import { Router } from "express";
import {
  getWinRateStats,
  updateWinRateStats,
} from "../lib/win-rate-stats.js";
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

router.put("/", requireAuth, requireAdmin, async (req, res) => {
  const todayWinRate = Number(req.body?.todayWinRate);
  const totalWinRate = Number(req.body?.totalWinRate);

  if (!Number.isFinite(todayWinRate) || !Number.isFinite(totalWinRate)) {
    res.status(400).json({ error: "請提供有效的勝率數值" });
    return;
  }

  if (todayWinRate < 0 || todayWinRate > 100 || totalWinRate < 0 || totalWinRate > 100) {
    res.status(400).json({ error: "勝率必須介乎 0 至 100" });
    return;
  }

  try {
    const stats = await updateWinRateStats({ todayWinRate, totalWinRate });
    res.json(stats);
  } catch (error) {
    console.error("Win rate stats update failed:", error);
    res.status(500).json({ error: "無法更新勝率資料" });
  }
});

export default router;
