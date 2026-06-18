import { Router } from "express";
import {
  getAnalysisByMatchId,
  isAnalysisStale,
  needsAnalysis,
  patchAnalysisConfidence,
  toPublicAnalysis,
} from "../lib/analyses.js";
import {
  checkRateLimit,
  ensureAnalysis,
  enqueueAnalysis,
  prewarmAnalyses,
} from "../lib/analysis-queue.js";
import { MATCH_ANALYSIS_PROMPT_VERSION } from "../lib/prompts/match-analysis-v1.js";
import type { MatchAnalysisData } from "../lib/analysis-schema.js";
import {
  getCachedAnalysis,
  setCachedAnalysis,
} from "../lib/redis.js";
import {
  requireAuth,
  requireMember,
  type AuthedRequest,
} from "../middleware/auth.js";

const router = Router();

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

type CachedAnalysisPayload = {
  matchId: string;
  status: "pending" | "completed" | "failed";
  analysis: unknown;
  expiresAt?: string;
  error?: string;
};

router.get(
  "/:matchId",
  requireAuth,
  requireMember,
  async (req: AuthedRequest, res) => {
    const matchId = paramId(req.params.matchId);
    const promptVersion = MATCH_ANALYSIS_PROMPT_VERSION;

    const cached = await getCachedAnalysis<CachedAnalysisPayload>(
      matchId,
      promptVersion,
    );
    if (cached?.status === "completed" && cached.analysis) {
      const analysis = patchAnalysisConfidence(cached.analysis as MatchAnalysisData);
      res.json({ ...cached, analysis });
      return;
    }

    let row = await getAnalysisByMatchId(matchId, promptVersion);

    if (needsAnalysis(row)) {
      await ensureAnalysis(matchId, {
        force: row?.status === "failed",
      });
      row = await getAnalysisByMatchId(matchId, promptVersion);
    }

    const payload = toPublicAnalysis(row);
    if (row?.status === "completed" && row.analysis) {
      await setCachedAnalysis(matchId, promptVersion, payload);
    }

    res.json(payload);
  },
);

router.get(
  "/:matchId/status",
  requireAuth,
  requireMember,
  async (req, res) => {
    const matchId = paramId(req.params.matchId);
    const row = await getAnalysisByMatchId(
      matchId,
      MATCH_ANALYSIS_PROMPT_VERSION,
    );

    if (!row) {
      res.json({ matchId, status: "missing" });
      return;
    }

    res.json({
      matchId,
      status: isAnalysisStale(row) ? "pending" : row.status,
      confidenceScore: row.analysis
        ? patchAnalysisConfidence(row.analysis).confidenceScore
        : undefined,
      error: row.error_message ?? undefined,
    });
  },
);

router.post(
  "/prewarm",
  requireAuth,
  requireMember,
  async (req: AuthedRequest, res) => {
    const userId = req.user?.sub;
    if (!userId || !checkRateLimit(userId)) {
      res.status(429).json({ error: "請求過於頻繁，請稍後再試" });
      return;
    }

    const matchIds = Array.isArray(req.body?.matchIds)
      ? (req.body.matchIds as string[])
      : [];

    if (matchIds.length === 0) {
      res.status(400).json({ error: "matchIds is required" });
      return;
    }

    const results = await prewarmAnalyses(matchIds);
    res.json({ results });
  },
);

router.post(
  "/:matchId/generate",
  requireAuth,
  requireMember,
  async (req: AuthedRequest, res) => {
    const userId = req.user?.sub;
    if (!userId || !checkRateLimit(userId)) {
      res.status(429).json({ error: "請求過於頻繁，請稍後再試" });
      return;
    }

    const matchId = paramId(req.params.matchId);
    enqueueAnalysis(matchId, true);
    res.json({ matchId, status: "pending" });
  },
);

export default router;
