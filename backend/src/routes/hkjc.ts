import { Router } from "express";
import {
  fetchHkjcMatchById,
  fetchHkjcMatchesResponse,
} from "../lib/hkjc/fetch-matches.js";

const router = Router();

router.get("/matches", async (_req, res) => {
  try {
    const data = await fetchHkjcMatchesResponse();
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.json(data);
  } catch (error) {
    console.error("HKJC matches fetch failed:", error);
    res.status(502).json({ error: "無法取得馬會賽事資料" });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const match = await fetchHkjcMatchById(req.params.id);
    if (!match) {
      res.status(404).json({ error: "找不到賽事" });
      return;
    }
    res.json(match);
  } catch (error) {
    console.error("HKJC match fetch failed:", error);
    res.status(502).json({ error: "無法取得馬會賽事資料" });
  }
});

export default router;
