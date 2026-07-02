import { Router } from "express";
import {
  enrichArchivedMatchForClient,
  getArchivedMatchById,
  listAdminPastDates,
  listAdminTodayPassedMatches,
  listArchivedMatchesByDate,
  syncArchivedFromAnalyses,
} from "../lib/archived-hkjc.js";
import {
  fetchHkjcMatchById,
  fetchHkjcMatchesResponse,
} from "../lib/hkjc/fetch-matches.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/matches", async (req, res) => {
  try {
    const refresh = req.query.refresh === "1";
    const data = await fetchHkjcMatchesResponse({ refresh });
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.json(data);
  } catch (error) {
    console.error("HKJC matches fetch failed:", error);
    res.status(502).json({ error: "無法取得馬會賽事資料" });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const match =
      (await fetchHkjcMatchById(req.params.id)) ??
      (await getArchivedMatchById(req.params.id));
    if (!match) {
      res.status(404).json({ error: "找不到賽事" });
      return;
    }
    res.json(await enrichArchivedMatchForClient(match));
  } catch (error) {
    console.error("HKJC match fetch failed:", error);
    res.status(502).json({ error: "無法取得馬會賽事資料" });
  }
});

router.get(
  "/archived/dates",
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    try {
      const dates = await listAdminPastDates(2);
      res.json({ dates });
    } catch (error) {
      console.error("Archived dates fetch failed:", error);
      res.status(500).json({ error: "無法載入過往賽事日期" });
    }
  },
);

router.get(
  "/archived/matches",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const dateKey = String(req.query.date ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      res.status(400).json({ error: "請提供有效日期" });
      return;
    }

    try {
      await syncArchivedFromAnalyses();
      const matches = await listArchivedMatchesByDate(dateKey);
      res.json({ date: dateKey, matches, total: matches.length });
    } catch (error) {
      console.error("Archived matches fetch failed:", error);
      res.status(500).json({ error: "無法載入過往賽事" });
    }
  },
);

router.get(
  "/archived/today-passed",
  requireAuth,
  requireAdmin,
  async (_req, res) => {
    try {
      await syncArchivedFromAnalyses();
      const matches = await listAdminTodayPassedMatches();
      res.json({ matches, total: matches.length });
    } catch (error) {
      console.error("Today passed matches fetch failed:", error);
      res.status(500).json({ error: "無法載入今日已開賽賽事" });
    }
  },
);

export default router;
