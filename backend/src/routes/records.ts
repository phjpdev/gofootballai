import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import path from "node:path";
import {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord,
} from "../lib/records.js";
import { isImageFile, isVideoFile } from "../lib/media-files.js";
import {
  deleteUploadedFile,
  MAX_UPLOAD_BYTES,
  publicUploadPath,
  upload,
} from "../lib/upload.js";
import { optimizeUploadedVideo } from "../lib/transcode-video.js";
import {
  requireAdmin,
  requireAuth,
  requireMember,
  type AuthedRequest,
} from "../middleware/auth.js";
import type { RecordType } from "../types.js";

const router = Router();

function parseRecordType(value: unknown): RecordType | null {
  const type = String(value ?? "");
  if (type === "text" || type === "photo" || type === "video") return type;
  return null;
}

function parseDisplayDate(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) {
    return null;
  }
  return raw;
}

function parseStarRating(value: unknown): number | null {
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return null;
  return Math.round(rating * 10) / 10;
}

async function resolveUploadedMediaUrl(
  file: Express.Multer.File,
  type: RecordType,
): Promise<string> {
  if (type === "video") {
    const finalPath = await optimizeUploadedVideo(file.path);
    return publicUploadPath(path.basename(finalPath));
  }
  return publicUploadPath(file.filename);
}

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          error: `檔案大小不能超過 ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB`,
        });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}

router.get("/public", async (_req, res) => {
  const records = await listRecords();
  res.json({ records });
});

router.get("/", requireAuth, requireMember, async (_req, res) => {
  const records = await listRecords();
  res.json({ records });
});

router.post(
  "/",
  requireAuth,
  requireAdmin,
  (req, res, next) => handleUpload(req, res, next),
  async (req: AuthedRequest, res) => {
    const type = parseRecordType(req.body.type);
    const title = String(req.body.title ?? "").trim();
    const content = String(req.body.content ?? "").trim();
    const displayDate = parseDisplayDate(req.body.displayDate);
    const starRating = parseStarRating(req.body.starRating);

    if (!type) {
      res.status(400).json({ error: "紀錄類型無效" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "請填寫標題" });
      return;
    }

    if (!displayDate) {
      res.status(400).json({ error: "請選擇有效日期" });
      return;
    }

    if (starRating === null) {
      res.status(400).json({ error: "請填寫 0 至 5 的星級評分" });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ error: "標題最多 200 個字元" });
      return;
    }

    if ((type === "photo" || type === "video") && !req.file) {
      res.status(400).json({ error: "請上傳相片或影片檔案" });
      return;
    }

    if (type === "photo" && req.file && !isImageFile(req.file)) {
      res.status(400).json({ error: "相片紀錄需要圖片檔案" });
      return;
    }

    if (type === "video" && req.file && !isVideoFile(req.file)) {
      res.status(400).json({ error: "影片紀錄需要影片檔案" });
      return;
    }

    const mediaUrl = req.file
      ? await resolveUploadedMediaUrl(req.file, type)
      : undefined;

    try {
      const record = await createRecord({
        authorId: req.user!.sub,
        type,
        title,
        content: content || undefined,
        mediaUrl,
        displayDate,
        starRating,
      });

      res.status(201).json({ record });
    } catch {
      if (mediaUrl) deleteUploadedFile(mediaUrl);
      res.status(500).json({ error: "建立紀錄失敗" });
    }
  },
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  (req, res, next) => handleUpload(req, res, next),
  async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const existing = await getRecordById(id);

    if (!existing) {
      res.status(404).json({ error: "找不到紀錄" });
      return;
    }

    const type = parseRecordType(req.body.type) ?? existing.type;
    const title = String(req.body.title ?? "").trim();
    const content = String(req.body.content ?? "").trim();
    const displayDate =
      parseDisplayDate(req.body.displayDate) ?? existing.displayDate;
    const starRating =
      parseStarRating(req.body.starRating) ?? existing.starRating;

    if (!title) {
      res.status(400).json({ error: "請填寫標題" });
      return;
    }

    if (!displayDate) {
      res.status(400).json({ error: "請選擇有效日期" });
      return;
    }

    if (starRating === null) {
      res.status(400).json({ error: "請填寫 0 至 5 的星級評分" });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ error: "標題最多 200 個字元" });
      return;
    }

    let mediaUrl: string | null | undefined = undefined;

    if (type === "text") {
      mediaUrl = null;
    } else if (req.file) {
      if (type === "photo" && !isImageFile(req.file)) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "相片紀錄需要圖片檔案" });
        return;
      }
      if (type === "video" && !isVideoFile(req.file)) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "影片紀錄需要影片檔案" });
        return;
      }
      mediaUrl = await resolveUploadedMediaUrl(req.file, type);
    } else if (type !== existing.type) {
      res.status(400).json({
        error: "更改紀錄類型時請上傳新檔案",
      });
      return;
    } else if (
      (type === "photo" || type === "video") &&
      !existing.mediaUrl
    ) {
      res.status(400).json({ error: "請上傳相片或影片檔案" });
      return;
    }

    try {
      const record = await updateRecord(id, {
        type,
        title,
        content: content || null,
        mediaUrl,
        displayDate,
        starRating,
      });

      if (!record) {
        if (req.file) deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(404).json({ error: "找不到紀錄" });
        return;
      }

      if (mediaUrl !== undefined && existing.mediaUrl) {
        const nextMedia = mediaUrl ?? undefined;
        if (existing.mediaUrl !== nextMedia) {
          deleteUploadedFile(existing.mediaUrl);
        }
      }

      res.json({ record });
    } catch {
      if (req.file) deleteUploadedFile(publicUploadPath(req.file.filename));
      res.status(500).json({ error: "更新紀錄失敗" });
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const deleted = await deleteRecord(id);
    if (!deleted) {
      res.status(404).json({ error: "找不到紀錄" });
      return;
    }

    deleteUploadedFile(deleted.mediaUrl);
    res.json({ ok: true });
  },
);

export default router;
