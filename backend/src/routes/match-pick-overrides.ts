import { Router } from "express";
import {
  getMatchPickOverride,
  upsertMatchPickOverride,
} from "../lib/match-pick-overrides.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:matchId", async (req, res) => {
  const matchId = String(req.params.matchId ?? "").trim();
  if (!matchId || matchId.length > 64) {
    res.status(400).json({ error: "賽事 ID 無效" });
    return;
  }

  try {
    const override = await getMatchPickOverride(matchId);
    res.json({
      matchId,
      pickSelection: override?.pickSelection ?? "",
    });
  } catch {
    res.status(500).json({ error: "無法載入預測覆寫" });
  }
});

router.put(
  "/:matchId",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const matchId = String(req.params.matchId ?? "").trim();
    if (!matchId || matchId.length > 64) {
      res.status(400).json({ error: "賽事 ID 無效" });
      return;
    }

    const pickSelection = String(req.body?.pickSelection ?? "").trim();
    if (pickSelection.length > 80) {
      res.status(400).json({ error: "預測文字過長" });
      return;
    }

    try {
      const override = await upsertMatchPickOverride(matchId, pickSelection);
      res.json({
        matchId,
        pickSelection: override?.pickSelection ?? "",
      });
    } catch {
      res.status(500).json({ error: "更新預測失敗" });
    }
  },
);

export default router;
