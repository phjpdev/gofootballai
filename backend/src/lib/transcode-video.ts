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

function runCommand(
  command: string,
  args: string[],
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      resolve({ code: null, stdout, stderr: error.message });
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function probeVideo(filePath: string): Promise<{
  codec: string;
  pixFmt: string;
} | null> {
  const result = await runCommand("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=codec_name,pix_fmt",
    "-of",
    "csv=p=0",
    filePath,
  ]);

  if (result.code !== 0) return null;
  const [codec = "", pixFmt = ""] = result.stdout.trim().split(",");
  if (!codec) return null;
  return { codec: codec.toLowerCase(), pixFmt: pixFmt.toLowerCase() };
}

function isBrowserReadyH264(probe: { codec: string; pixFmt: string }): boolean {
  return probe.codec === "h264" && probe.pixFmt === "yuv420p";
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
): Promise<boolean> {
  const result = await runCommand("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-level",
    "4.0",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    outputPath,
  ]);
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
    : await transcodeToH264(inputPath, tempPath);

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

  const fileName = path.basename(mediaUrl);
  const filePath = path.join(uploadDir, fileName);
  const finalPath = await optimizeUploadedVideo(filePath);
  return `/uploads/${path.basename(finalPath)}`;
}
