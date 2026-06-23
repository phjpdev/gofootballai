import { Router } from "express";
import {
  getAnalysisByMatchId,
  getAnalysisScoresByMatchIds,
  isPendingStale,
  needsAnalysis,
  patchAnalysisConfidence,
  redactAnalysisForVip,
  toPublicAnalysis,
} from "../lib/analyses.js";
import {
  checkRateLimit,
  enqueueAnalysis,
  isAnalysisInFlight,
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
import { findUserById } from "../lib/users.js";
import { canViewVipAnalysis } from "../lib/vip.js";

const router = Router();

async function resolveCanViewVip(req: AuthedRequest): Promise<boolean> {
  if (!req.user) return false;
  if (req.user.role === "admin") return true;

  const user = await findUserById(req.user.sub);
  if (!user) return false;

  return canViewVipAnalysis({
    role: user.role,
    vipExpiresAt: user.vipExpiresAt,
  });
}

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
    const canViewVip = await resolveCanViewVip(req);

    const cached = await getCachedAnalysis<CachedAnalysisPayload>(
      matchId,
      promptVersion,
    );
    if (cached?.status === "completed" && cached.analysis) {
      const analysis = redactAnalysisForVip(
        patchAnalysisConfidence(cached.analysis as MatchAnalysisData),
        canViewVip,
      );
      res.json({ ...cached, analysis });
      return;
    }

    let row = await getAnalysisByMatchId(matchId, promptVersion);

    if (needsAnalysis(row)) {
      const force = row?.status === "failed";
      enqueueAnalysis(matchId, force);
      row = await getAnalysisByMatchId(matchId, promptVersion);
    }

    const payload = toPublicAnalysis(row, canViewVip);
    if (row?.status === "completed" && row.analysis) {
      await setCachedAnalysis(
        matchId,
        promptVersion,
        toPublicAnalysis(row, true),
      );
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

    if (row.status === "pending" && isPendingStale(row) && !isAnalysisInFlight(matchId)) {
      enqueueAnalysis(matchId, false);
    }

    res.json({
      matchId,
      status: row.status,
      confidenceScore: row.analysis
        ? patchAnalysisConfidence(row.analysis).confidenceScore
        : undefined,
      error: row.error_message ?? undefined,
    });
  },
);

router.post(
  "/scores",
  requireAuth,
  requireMember,
  async (req, res) => {
    const matchIds = Array.isArray(req.body?.matchIds)
      ? (req.body.matchIds as string[])
      : [];

    if (matchIds.length === 0) {
      res.status(400).json({ error: "matchIds is required" });
      return;
    }

    const results = await getAnalysisScoresByMatchIds(matchIds);
    res.json({ results });
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
