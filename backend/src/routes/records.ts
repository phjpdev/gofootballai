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
  uploadsDir,
} from "../lib/upload.js";
import {
  optimizeUploadedVideo,
  optimizeUploadedVideoByUrl,
} from "../lib/transcode-video.js";
import {
  appendChunk,
  createUploadSession,
  discardSession,
  finalizeSession,
  markSessionRecord,
  readSessionMeta,
  serializeFinalize,
  UploadSessionError,
} from "../lib/upload-sessions.js";
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

async function resolveMediaUrlForPath(
  filePath: string,
  filename: string,
  type: RecordType,
): Promise<string> {
  if (type === "video") {
    const finalPath = await optimizeUploadedVideo(filePath);
    return publicUploadPath(path.basename(finalPath));
  }
  return publicUploadPath(filename);
}

/**
 * Resumable upload endpoints.
 *
 * A 20MB single-shot POST holds the connection for 15s or more, so any API
 * restart during that window loses the whole upload and surfaces as a bare 502.
 * These let the client push short chunks and resume from the exact byte we
 * already hold, which turns a restart into one cheap retry.
 */
router.post("/upload-sessions", requireAuth, requireAdmin, async (req, res) => {
  const session = await createUploadSession(String(req.query.name ?? ""));
  res.status(201).json(session);
});

router.put(
  "/upload-sessions/:uploadId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const uploadId = String(req.params.uploadId);
    const offset = Number(req.query.offset ?? NaN);
    if (!Number.isInteger(offset) || offset < 0) {
      res.status(400).json({ error: "offset 無效" });
      return;
    }

    try {
      const result = await appendChunk(uploadId, offset, req);
      res.json(result);
    } catch (error) {
      if (error instanceof UploadSessionError) {
        res
          .status(error.status)
          .json({ error: error.message, received: error.received });
        return;
      }
      throw error;
    }
  },
);

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

    const uploadId = String(req.body.uploadId ?? "").trim();

    if ((type === "photo" || type === "video") && !req.file && !uploadId) {
      res.status(400).json({ error: "請上傳相片或影片檔案" });
      return;
    }

    if (uploadId) {
      await serializeFinalize(uploadId, async () => {
      // Finalizing a resumable upload. If a previous attempt already created
      // the record but its response never reached the client, return that one
      // rather than creating a duplicate. Re-read inside the lock: an earlier
      // attempt may have completed while we were queued.
      const meta = await readSessionMeta(uploadId);
      if (!meta) {
        res.status(404).json({ error: "找不到上傳工作階段，請重新上傳" });
        return;
      }
      if (meta.recordId) {
        const existing = await getRecordById(meta.recordId);
        if (existing) {
          res.status(201).json({ record: existing });
          return;
        }
      }

      let mediaUrlFromSession: string;
      let finalizedName = "";
      try {
        const finalized = await finalizeSession(uploadId);
        finalizedName = finalized.filename;
        const asFile = { mimetype: "", originalname: finalized.filename };
        if (type === "photo" && !isImageFile(asFile)) {
          deleteUploadedFile(publicUploadPath(finalized.filename));
          await discardSession(uploadId);
          res.status(400).json({ error: "相片紀錄需要圖片檔案" });
          return;
        }
        if (type === "video" && !isVideoFile(asFile)) {
          deleteUploadedFile(publicUploadPath(finalized.filename));
          await discardSession(uploadId);
          res.status(400).json({ error: "影片紀錄需要影片檔案" });
          return;
        }
        mediaUrlFromSession = await resolveMediaUrlForPath(
          finalized.filePath,
          finalized.filename,
          type,
        );
      } catch (error) {
        if (error instanceof UploadSessionError) {
          res.status(error.status).json({ error: error.message });
          return;
        }
        if (finalizedName) deleteUploadedFile(publicUploadPath(finalizedName));
        res.status(400).json({
          error: error instanceof Error ? error.message : "影片處理失敗",
        });
        return;
      }

      try {
        const record = await createRecord({
          authorId: req.user!.sub,
          type,
          title,
          content: content || undefined,
          mediaUrl: mediaUrlFromSession,
          displayDate,
          starRating,
        });
        // Deliberately NOT discarded: if this 201 never reaches the client it
        // retries, and meta.recordId lets us return the same record instead of
        // creating a duplicate. sweepStaleSessions removes it after the TTL.
        await markSessionRecord(uploadId, record.id);
        res.status(201).json({ record });
      } catch {
        deleteUploadedFile(mediaUrlFromSession);
        await discardSession(uploadId);
        res.status(500).json({ error: "建立紀錄失敗" });
      }
      });
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

    let mediaUrl: string | undefined;
    try {
      if (req.file) {
        mediaUrl = await resolveUploadedMediaUrl(req.file, type);
      }
    } catch (error) {
      if (req.file) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
      }
      res.status(400).json({
        error: error instanceof Error ? error.message : "影片處理失敗",
      });
      return;
    }

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
      try {
        mediaUrl = await resolveUploadedMediaUrl(req.file, type);
      } catch (error) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({
          error: error instanceof Error ? error.message : "影片處理失敗",
        });
        return;
      }
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

router.post(
  "/:id/retranscode",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const existing = await getRecordById(id);

    if (!existing || existing.type !== "video" || !existing.mediaUrl) {
      res.status(404).json({ error: "找不到影片紀錄" });
      return;
    }

    try {
      const nextMediaUrl = await optimizeUploadedVideoByUrl(
        existing.mediaUrl,
        uploadsDir,
      );
      const record = await updateRecord(id, {
        type: existing.type,
        title: existing.title,
        content: existing.content,
        mediaUrl: nextMediaUrl,
        displayDate: existing.displayDate ?? existing.createdAt.slice(0, 10),
        starRating: existing.starRating ?? 0,
      });

      if (!record) {
        res.status(404).json({ error: "找不到紀錄" });
        return;
      }

      if (existing.mediaUrl !== nextMediaUrl) {
        deleteUploadedFile(existing.mediaUrl);
      }

      res.json({ record });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "影片轉換失敗",
      });
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
