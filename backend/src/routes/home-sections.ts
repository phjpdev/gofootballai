import { Router, type NextFunction, type Request, type Response } from "express";
import {
  getHomeSectionById,
  listHomeSections,
  updateHomeSection,
  type HomeSectionId,
} from "../lib/home-sections.js";
import {
  deleteUploadedFile,
  publicUploadPath,
  upload,
} from "../lib/upload.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const SECTION_IDS = new Set<HomeSectionId>([
  "hero",
  "score",
  "daily",
  "metrics",
  "records",
  "rating",
]);

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
  const sections = await listHomeSections();
  res.json({ sections });
});

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  (req, res, next) => handleUpload(req, res, next),
  async (req: AuthedRequest, res) => {
    const id = String(req.params.id) as HomeSectionId;

    if (!SECTION_IDS.has(id)) {
      res.status(404).json({ error: "找不到首頁區塊" });
      return;
    }

    const existing = await getHomeSectionById(id);

    if (!existing) {
      res.status(404).json({ error: "找不到首頁區塊" });
      return;
    }

    const title = String(req.body.title ?? "").trim();
    const description = String(req.body.description ?? "").trim();
    const eyebrow = String(req.body.eyebrow ?? "").trim();
    const ctaText = String(req.body.ctaText ?? "").trim();
    const loginPrompt = String(req.body.loginPrompt ?? "").trim();
    const loginLinkText = String(req.body.loginLinkText ?? "").trim();

    if (!title || !description) {
      res.status(400).json({ error: "請填寫標題與描述" });
      return;
    }

    if (title.length > 120 || description.length > 500) {
      res.status(400).json({ error: "文字內容過長" });
      return;
    }

    if (id === "hero") {
      if (!eyebrow || !ctaText || !loginPrompt || !loginLinkText) {
        res.status(400).json({ error: "請填寫首頁英雄區所有文字欄位" });
        return;
      }
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
      const section = await updateHomeSection(id, {
        eyebrow: id === "hero" ? eyebrow : null,
        title,
        description,
        imageSrc,
        ctaText: id === "hero" ? ctaText : null,
        loginPrompt: id === "hero" ? loginPrompt : null,
        loginLinkText: id === "hero" ? loginLinkText : null,
      });

      if (!section) {
        if (imageSrc) deleteUploadedFile(imageSrc);
        res.status(404).json({ error: "找不到首頁區塊" });
        return;
      }

      if (imageSrc && existing.imageSrc.startsWith("/uploads/")) {
        deleteUploadedFile(existing.imageSrc);
      }

      res.json({ section });
    } catch {
      if (imageSrc) deleteUploadedFile(imageSrc);
      res.status(500).json({ error: "更新首頁區塊失敗" });
    }
  },
);

export default router;
