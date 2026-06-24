import { Router } from "express";
import {
  listTopMatchPreviews,
  PREVIEW_SLOT_COUNT,
  updateTopMatchPreviews,
  type TopMatchPreviewId,
  type TopMatchPreviewSlot,
} from "../lib/top-match-previews.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";

const router = Router();

const SLOT_IDS = new Set<TopMatchPreviewId>([
  "preview-1",
  "preview-2",
  "preview-3",
  "preview-4",
]);

router.get("/public", async (_req, res) => {
  const items = await listTopMatchPreviews();
  res.json({ items });
});

router.put("/", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];

  if (rawItems.length !== PREVIEW_SLOT_COUNT) {
    res.status(400).json({ error: `請提供 ${PREVIEW_SLOT_COUNT} 個精選預測欄位` });
    return;
  }

  const items: TopMatchPreviewSlot[] = [];

  for (const raw of rawItems) {
    const id = String(raw?.id ?? "") as TopMatchPreviewId;
    if (!SLOT_IDS.has(id)) {
      res.status(400).json({ error: "精選預測欄位 ID 無效" });
      return;
    }

    const matchId = String(raw?.matchId ?? "").trim();
    const homeTeam = String(raw?.homeTeam ?? "").trim();
    const awayTeam = String(raw?.awayTeam ?? "").trim();
    const pickSelection = String(raw?.pickSelection ?? "").trim();

    if (matchId.length > 64) {
      res.status(400).json({ error: "賽事 ID 過長" });
      return;
    }

    if (
      homeTeam.length > 80 ||
      awayTeam.length > 80 ||
      pickSelection.length > 80
    ) {
      res.status(400).json({ error: "文字內容過長" });
      return;
    }

    if (!homeTeam || !awayTeam || !pickSelection) {
      res.status(400).json({ error: "請填寫主隊、客隊及預測結果" });
      return;
    }

    items.push({ id, matchId, homeTeam, awayTeam, pickSelection });
  }

  const sortedIds = items.map((item) => item.id).sort();
  const expectedIds = [...SLOT_IDS].sort();
  if (sortedIds.join(",") !== expectedIds.join(",")) {
    res.status(400).json({ error: "精選預測欄位不完整" });
    return;
  }

  try {
    const updated = await updateTopMatchPreviews(
      [...items].sort(
        (a, b) =>
          expectedIds.indexOf(a.id) - expectedIds.indexOf(b.id),
      ),
    );
    res.json({ items: updated });
  } catch {
    res.status(500).json({ error: "更新精選預測失敗" });
  }
});

export default router;
