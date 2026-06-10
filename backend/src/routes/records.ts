import { Router, type NextFunction, type Request, type Response } from "express";
import {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord,
} from "../lib/records.js";
import {
  deleteUploadedFile,
  publicUploadPath,
  upload,
} from "../lib/upload.js";
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

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
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

    if (!type) {
      res.status(400).json({ error: "Invalid record type" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ error: "Title must be at most 200 characters" });
      return;
    }

    if ((type === "photo" || type === "video") && !req.file) {
      res.status(400).json({ error: "Please upload a photo or video file" });
      return;
    }

    if (type === "photo" && !req.file?.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "Photo records require an image file" });
      return;
    }

    if (type === "video" && !req.file?.mimetype.startsWith("video/")) {
      res.status(400).json({ error: "Video records require a video file" });
      return;
    }

    const mediaUrl = req.file ? publicUploadPath(req.file.filename) : undefined;

    try {
      const record = await createRecord({
        authorId: req.user!.sub,
        type,
        title,
        content: content || undefined,
        mediaUrl,
      });

      res.status(201).json({ record });
    } catch {
      if (mediaUrl) deleteUploadedFile(mediaUrl);
      res.status(500).json({ error: "Failed to create record" });
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
      res.status(404).json({ error: "Record not found" });
      return;
    }

    const type = parseRecordType(req.body.type) ?? existing.type;
    const title = String(req.body.title ?? "").trim();
    const content = String(req.body.content ?? "").trim();

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ error: "Title must be at most 200 characters" });
      return;
    }

    let mediaUrl: string | null | undefined = undefined;

    if (type === "text") {
      mediaUrl = null;
    } else if (req.file) {
      if (type === "photo" && !req.file.mimetype.startsWith("image/")) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "Photo records require an image file" });
        return;
      }
      if (type === "video" && !req.file.mimetype.startsWith("video/")) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "Video records require a video file" });
        return;
      }
      mediaUrl = publicUploadPath(req.file.filename);
    } else if (type !== existing.type) {
      res.status(400).json({
        error: "Please upload a new file when changing the record type",
      });
      return;
    } else if (
      (type === "photo" || type === "video") &&
      !existing.mediaUrl
    ) {
      res.status(400).json({ error: "Please upload a photo or video file" });
      return;
    }

    try {
      const record = await updateRecord(id, {
        type,
        title,
        content: content || null,
        mediaUrl,
      });

      if (!record) {
        if (req.file) deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(404).json({ error: "Record not found" });
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
      res.status(500).json({ error: "Failed to update record" });
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
      res.status(404).json({ error: "Record not found" });
      return;
    }

    deleteUploadedFile(deleted.mediaUrl);
    res.json({ ok: true });
  },
);

export default router;
