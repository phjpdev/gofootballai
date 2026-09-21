import { spawn } from "node:child_process";
import { rename, unlink } from "node:fs/promises";
import path from "node:path";

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
  ".avi",
  ".mkv",
  ".mpeg",
  ".mpg",
  ".3gp",
  ".wmv",
]);

/** ffmpeg writes progress to stderr continuously; never buffer it unbounded. */
const MAX_CHILD_OUTPUT_CHARS = 64 * 1024;
const FFMPEG_TIMEOUT_MS = Number(process.env.FFMPEG_TIMEOUT_MS ?? 180_000);
const FFPROBE_TIMEOUT_MS = Number(process.env.FFPROBE_TIMEOUT_MS ?? 30_000);
/** Cap worker threads: the x264 per-thread frame pool is what drove peak RSS. */
const FFMPEG_THREADS = process.env.FFMPEG_THREADS ?? "2";
/** Cap the long edge. A 1440x2560 phone clip cost ~813MB re-encoded natively. */
const MAX_LONG_EDGE = Number(process.env.VIDEO_MAX_LONG_EDGE ?? 1280);

function runCommand(
  command: string,
  args: string[],
  timeoutMs: number = FFMPEG_TIMEOUT_MS,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args);
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timer: NodeJS.Timeout | undefined;

    const finish = (result: {
      code: number | null;
      stdout: string;
      stderr: string;
    }) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(result);
    };

    timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish({
        code: null,
        stdout,
        stderr: `${command} exceeded ${timeoutMs}ms and was killed`,
      });
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < MAX_CHILD_OUTPUT_CHARS) stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < MAX_CHILD_OUTPUT_CHARS) stderr += chunk.toString();
    });
    child.on("error", (error) => {
      finish({ code: null, stdout, stderr: error.message });
    });
    child.on("close", (code) => finish({ code, stdout, stderr }));
  });
}

type VideoProbe = {
  codec: string;
  pixFmt: string;
  width: number;
  height: number;
};

/**
 * Parsed as JSON on purpose: ffprobe emits csv fields in ITS own order
 * (codec_name,width,height,pix_fmt) rather than the requested order, so
 * positional parsing silently swaps pix_fmt for width once you add fields.
 */
async function probeVideo(filePath: string): Promise<VideoProbe | null> {
  const result = await runCommand(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name,pix_fmt,width,height",
      "-of",
      "json",
      filePath,
    ],
    FFPROBE_TIMEOUT_MS,
  );

  if (result.code !== 0) return null;

  try {
    const parsed = JSON.parse(result.stdout) as {
      streams?: Array<{
        codec_name?: string;
        pix_fmt?: string;
        width?: number;
        height?: number;
      }>;
    };
    const stream = parsed.streams?.[0];
    if (!stream?.codec_name) return null;
    return {
      codec: stream.codec_name.toLowerCase(),
      pixFmt: (stream.pix_fmt ?? "").toLowerCase(),
      width: Number(stream.width ?? 0),
      height: Number(stream.height ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * 8-bit 4:2:0 H.264 plays everywhere, so it only needs a faststart remux.
 * yuvj420p is the same samples with full-range flags -- it used to miss this
 * gate and pay for a full re-encode for no benefit.
 */
const BROWSER_READY_PIX_FMTS = new Set(["yuv420p", "yuvj420p"]);

function isBrowserReadyH264(probe: VideoProbe): boolean {
  return probe.codec === "h264" && BROWSER_READY_PIX_FMTS.has(probe.pixFmt);
}

/** Cap the long edge, preserve aspect, keep both dimensions even for libx264. */
function buildScaleFilter(probe: VideoProbe): string | null {
  const longEdge = Math.max(probe.width, probe.height);
  if (!Number.isFinite(longEdge) || longEdge <= 0 || longEdge <= MAX_LONG_EDGE) {
    return null;
  }
  const ratio = MAX_LONG_EDGE / longEdge;
  const even = (value: number) =>
    Math.max(2, Math.round((value * ratio) / 2) * 2);
  return `scale=${even(probe.width)}:${even(probe.height)}`;
}

async function remuxWithFaststart(
  inputPath: string,
  outputPath: string,
): Promise<boolean> {
  const result = await runCommand("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
  return result.code === 0;
}

async function transcodeToH264(
  inputPath: string,
  outputPath: string,
  probe: VideoProbe,
): Promise<boolean> {
  const scale = buildScaleFilter(probe);
  const args = ["-y", "-threads", FFMPEG_THREADS, "-i", inputPath];
  if (scale) args.push("-vf", scale);
  args.push(
    "-c:v",
    "libx264",
    "-threads",
    FFMPEG_THREADS,
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    // Deliberately no explicit -level: x264 derives a conformant one. The old
    // hardcoded "-level 4.0" was violated on every axis by a tall phone frame
    // (1440x2560 is 14400 macroblocks against an 8192 limit) and was still
    // stamped into the SPS, which some hardware decoders refuse outright.
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    outputPath,
  );

  const result = await runCommand("ffmpeg", args);
  if (result.code !== 0) {
    console.error(
      "ffmpeg transcode failed:",
      result.stderr.slice(-2000) || `exit code ${result.code}`,
    );
  }
  return result.code === 0;
}

async function replaceWithOptimizedFile(
  inputPath: string,
  tempPath: string,
  finalPath: string,
): Promise<string> {
  if (inputPath !== finalPath) {
    try {
      await unlink(inputPath);
    } catch {
      // ignore
    }
  } else {
    try {
      await unlink(finalPath);
    } catch {
      // ignore
    }
  }

  await rename(tempPath, finalPath);
  return finalPath;
}

/**
 * Re-encode or remux uploaded videos for browser playback.
 * Throws if ffmpeg/ffprobe are unavailable or processing fails.
 */
export async function optimizeUploadedVideo(inputPath: string): Promise<string> {
  const ext = path.extname(inputPath).toLowerCase();
  if (!VIDEO_EXTENSIONS.has(ext)) return inputPath;

  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, ext);
  const tempPath = path.join(dir, `${base}.transcode.tmp.mp4`);
  const finalPath = path.join(dir, `${base}.mp4`);

  const probe = await probeVideo(inputPath);
  if (!probe) {
    throw new Error(
      "無法處理影片。請在伺服器安裝 ffmpeg：sudo apt install -y ffmpeg",
    );
  }

  const ok = isBrowserReadyH264(probe)
    ? await remuxWithFaststart(inputPath, tempPath)
    : await transcodeToH264(inputPath, tempPath, probe);

  if (!ok) {
    try {
      await unlink(tempPath);
    } catch {
      // ignore
    }
    throw new Error("影片轉換失敗，請確認伺服器已安裝 ffmpeg 並稍後再試");
  }

  return replaceWithOptimizedFile(inputPath, tempPath, finalPath);
}

export async function optimizeUploadedVideoByUrl(
  mediaUrl: string,
  uploadDir: string,
): Promise<string> {
  if (!mediaUrl.startsWith("/uploads/")) {
    throw new Error("只支援重新處理已上傳的媒體檔案");
  }

  const cleanUrl = mediaUrl.split("?")[0];
  const fileName = path.basename(cleanUrl);
  const filePath = path.join(uploadDir, fileName);
  const finalPath = await optimizeUploadedVideo(filePath);
  return `/uploads/${path.basename(finalPath)}`;
}
