import {
  getAnalysisByMatchId,
  markAnalysisCompleted,
  markAnalysisFailed,
  patchAnalysisConfidence,
  upsertPendingAnalysis,
} from "./analyses.js";
import { formatMatchOddsPrompt } from "./hkjc/format-odds-prompt.js";
import {
  fetchHkjcMatchById,
  invalidateHkjcCache,
} from "./hkjc/fetch-matches.js";
import { toInputSnapshot } from "./hkjc/transform.js";
import { generateMatchAnalysis } from "./grok.js";
import { MATCH_ANALYSIS_PROMPT_VERSION } from "./prompts/match-analysis-v1.js";
import {
  invalidateCachedAnalysis,
  setCachedAnalysis,
} from "./redis.js";

const MAX_CONCURRENCY = Number(process.env.ANALYSIS_QUEUE_CONCURRENCY ?? 2);
const ANALYSIS_WAIT_MS = Number(process.env.ANALYSIS_WAIT_MS ?? 10_000);
const PREWARM_MAX = Number(process.env.ANALYSIS_PREWARM_MAX ?? 6);

const inFlight = new Set<string>();
const queue: string[] = [];
const activeJobs = new Map<string, Promise<void>>();
let runningCount = 0;

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(userId, timestamps);
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

async function processMatch(matchId: string, force = false): Promise<void> {
  const promptVersion = MATCH_ANALYSIS_PROMPT_VERSION;
  const existing = await getAnalysisByMatchId(matchId, promptVersion);

  if (!force && existing?.status === "completed") {
    return;
  }

  const match = await fetchHkjcMatchById(matchId);
  if (!match) {
    await markAnalysisFailed({
      matchId,
      promptVersion,
      errorMessage: "找不到馬會賽事",
    });
    return;
  }

  if (!match.hadOdds) {
    await markAnalysisFailed({
      matchId,
      promptVersion,
      errorMessage: "主客和盤口未開，無法分析",
    });
    return;
  }

  const snapshot = toInputSnapshot(match);
  await upsertPendingAnalysis({
    matchId,
    frontEndId: match.frontEndId,
    snapshot,
    promptVersion,
    resetCompleted: force,
  });

  try {
    const oddsBlock = formatMatchOddsPrompt(snapshot);
    const result = await generateMatchAnalysis(oddsBlock);
    const row = await markAnalysisCompleted({
      matchId,
      promptVersion,
      model: result.model,
      snapshot,
      analysis: result.analysis,
      rawResponse: result.rawResponse,
    });

    await setCachedAnalysis(matchId, promptVersion, {
      matchId,
      status: row.status,
      analysis: row.analysis,
      expiresAt: row.expires_at?.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "分析生成失敗";
    console.error(`Analysis failed for ${matchId}:`, message);
    await markAnalysisFailed({
      matchId,
      promptVersion,
      errorMessage: message,
    });
    await invalidateCachedAnalysis(matchId, promptVersion);
  }
}

function runJob(matchId: string, force = false): Promise<void> {
  const existing = activeJobs.get(matchId);
  if (existing && !force) return existing;

  const job = processMatch(matchId, force).finally(() => {
    activeJobs.delete(matchId);
    inFlight.delete(matchId);
  });

  activeJobs.set(matchId, job);
  inFlight.add(matchId);
  return job;
}

function pumpQueue(): void {
  while (runningCount < MAX_CONCURRENCY && queue.length > 0) {
    const matchId = queue.shift();
    if (!matchId) break;

    runningCount += 1;
    void runJob(matchId)
      .catch((error) => {
        console.error(`Analysis job failed for ${matchId}:`, error);
      })
      .finally(() => {
        runningCount -= 1;
        pumpQueue();
      });
  }
}

export function isAnalysisInFlight(matchId: string): boolean {
  return inFlight.has(matchId);
}

export function enqueueAnalysis(matchId: string, force = false): void {
  if (inFlight.has(matchId)) return;

  if (force) {
    void runJob(matchId, true);
    return;
  }

  if (!queue.includes(matchId)) {
    queue.push(matchId);
  }
  pumpQueue();
}

export async function ensureAnalysis(
  matchId: string,
  options: { waitMs?: number; force?: boolean } = {},
): Promise<void> {
  const waitMs = options.waitMs ?? ANALYSIS_WAIT_MS;
  const promptVersion = MATCH_ANALYSIS_PROMPT_VERSION;
  const existing = await getAnalysisByMatchId(matchId, promptVersion);

  if (!options.force && existing?.status === "completed") {
    return;
  }

  const job = runJob(matchId, true);
  if (waitMs <= 0) return;

  await Promise.race([
    job,
    new Promise<void>((resolve) => {
      setTimeout(resolve, waitMs);
    }),
  ]);
}

export async function prewarmAnalyses(
  matchIds: string[],
  force = false,
): Promise<
  Array<{
    matchId: string;
    status: "pending" | "completed" | "failed" | "missing";
    confidenceScore?: number;
  }>
> {
  const uniqueIds = [...new Set(matchIds)].slice(0, PREWARM_MAX);
  const promptVersion = MATCH_ANALYSIS_PROMPT_VERSION;
  const results: Array<{
    matchId: string;
    status: "pending" | "completed" | "failed" | "missing";
    confidenceScore?: number;
  }> = [];

  for (const matchId of uniqueIds) {
    const existing = await getAnalysisByMatchId(matchId, promptVersion);

    if (!force && existing?.status === "completed") {
      results.push({
        matchId,
        status: existing.status,
        confidenceScore: existing.analysis
          ? patchAnalysisConfidence(existing.analysis).confidenceScore
          : undefined,
      });
      continue;
    }

    enqueueAnalysis(matchId, force);
    results.push({
      matchId,
      status: "pending",
    });
  }

  return results;
}
