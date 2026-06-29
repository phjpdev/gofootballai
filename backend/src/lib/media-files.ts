import path from "node:path";

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
  ".avi",
  ".mkv",
  ".mpeg",
  ".mpg",
  ".3gp",
  ".3g2",
  ".wmv",
]);

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
  ".bmp",
  ".avif",
]);

function fileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

function isGenericBinaryMime(mimetype: string): boolean {
  const mime = mimetype.toLowerCase();
  return !mime || mime === "application/octet-stream" || mime === "binary/octet-stream";
}

export function isVideoFile(file: {
  mimetype: string;
  originalname: string;
}): boolean {
  const mime = file.mimetype.toLowerCase();
  if (mime.startsWith("video/")) return true;
  if (isGenericBinaryMime(mime)) {
    return VIDEO_EXTENSIONS.has(fileExtension(file.originalname));
  }
  return false;
}

export function isImageFile(file: {
  mimetype: string;
  originalname: string;
}): boolean {
  const mime = file.mimetype.toLowerCase();
  if (mime.startsWith("image/")) return true;
  if (isGenericBinaryMime(mime)) {
    return IMAGE_EXTENSIONS.has(fileExtension(file.originalname));
  }
  return false;
}

export function isAllowedUploadFile(file: {
  mimetype: string;
  originalname: string;
}): boolean {
  return isImageFile(file) || isVideoFile(file);
}
