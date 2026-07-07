import { Router } from "express";
import { getWinRateStats } from "../lib/win-rate-stats.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const stats = await getWinRateStats();
    res.json(stats);
  } catch (error) {
    console.error("Win rate stats fetch failed:", error);
    res.status(500).json({ error: "無法載入勝率資料" });
  }
});

export default router;
