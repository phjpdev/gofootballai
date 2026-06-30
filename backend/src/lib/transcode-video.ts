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

function runFfmpeg(inputPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn("ffmpeg", [
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

    ffmpeg.on("error", () => resolve(false));
    ffmpeg.on("close", (code) => resolve(code === 0));
  });
}

/**
 * Re-encode uploaded videos to H.264/AAC MP4 for broad browser playback
 * (fixes black screen when source is HEVC or has incompatible pixel format).
 * Returns the final file path to store, or the original path if ffmpeg is unavailable.
 */
export async function optimizeUploadedVideo(inputPath: string): Promise<string> {
  const ext = path.extname(inputPath).toLowerCase();
  if (!VIDEO_EXTENSIONS.has(ext)) return inputPath;

  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath, ext);
  const tempPath = path.join(dir, `${base}.transcode.tmp.mp4`);
  const finalPath = path.join(dir, `${base}.mp4`);

  const ok = await runFfmpeg(inputPath, tempPath);
  if (!ok) {
    try {
      await unlink(tempPath);
    } catch {
      // ignore missing temp file
    }
    return inputPath;
  }

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
