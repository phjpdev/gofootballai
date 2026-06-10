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
      res.status(400).json({ error: "紀錄類型無效" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "請填寫標題" });
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

    if (type === "photo" && !req.file?.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "相片紀錄需要圖片檔案" });
      return;
    }

    if (type === "video" && !req.file?.mimetype.startsWith("video/")) {
      res.status(400).json({ error: "影片紀錄需要影片檔案" });
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

    if (!title) {
      res.status(400).json({ error: "請填寫標題" });
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
      if (type === "photo" && !req.file.mimetype.startsWith("image/")) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "相片紀錄需要圖片檔案" });
        return;
      }
      if (type === "video" && !req.file.mimetype.startsWith("video/")) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "影片紀錄需要影片檔案" });
        return;
      }
      mediaUrl = publicUploadPath(req.file.filename);
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
