import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "uploads");
mkdirSync(uploadDir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
      return;
    }
    cb(new Error("只允許上傳圖片或影片檔案"));
  },
});

export function publicUploadPath(filename: string): string {
  return `/uploads/${filename}`;
}

export function deleteUploadedFile(mediaUrl: string | null | undefined): void {
  if (!mediaUrl?.startsWith("/uploads/")) return;
  const filePath = path.join(uploadDir, path.basename(mediaUrl));
  try {
    if (existsSync(filePath)) unlinkSync(filePath);
  } catch {
    // ignore missing or locked files
  }
}
