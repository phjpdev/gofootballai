import { Router, type NextFunction, type Request, type Response } from "express";
import {
  getFeaturedItemById,
  listFeaturedItems,
  updateFeaturedItem,
} from "../lib/featured.js";
import {
  deleteUploadedFile,
  publicUploadPath,
  upload,
} from "../lib/upload.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

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
  const items = await listFeaturedItems();
  res.json({ items });
});

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  (req, res, next) => handleUpload(req, res, next),
  async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    const existing = await getFeaturedItemById(id);

    if (!existing) {
      res.status(404).json({ error: "找不到精選賽事卡片" });
      return;
    }

    const title = String(req.body.title ?? "").trim();
    const tag = String(req.body.tag ?? "").trim();
    const duration = String(req.body.duration ?? "").trim();
    const stat = String(req.body.stat ?? "").trim();

    if (!title || !tag || !duration || !stat) {
      res.status(400).json({ error: "請填寫所有文字欄位" });
      return;
    }

    if (title.length > 80 || tag.length > 40 || duration.length > 40 || stat.length > 40) {
      res.status(400).json({ error: "文字內容過長" });
      return;
    }

    let imageSrc: string | undefined;

    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        deleteUploadedFile(publicUploadPath(req.file.filename));
        res.status(400).json({ error: "請上傳圖片檔案" });
        return;
      }
      imageSrc = publicUploadPath(req.file.filename);
    }

    try {
      const item = await updateFeaturedItem(id, {
        title,
        tag,
        duration,
        stat,
        imageSrc,
      });

      if (!item) {
        if (imageSrc) deleteUploadedFile(imageSrc);
        res.status(404).json({ error: "找不到精選賽事卡片" });
        return;
      }

      if (imageSrc && existing.imageSrc.startsWith("/uploads/")) {
        deleteUploadedFile(existing.imageSrc);
      }

      res.json({ item });
    } catch {
      if (imageSrc) deleteUploadedFile(imageSrc);
      res.status(500).json({ error: "更新精選賽事失敗" });
    }
  },
);

export default router;
