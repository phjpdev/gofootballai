import type { MatchAnalysisData } from "./analysis-schema.js";
import { query } from "./db.js";
import { dateKeyFromKickOff, getTodayDateKeyHk } from "./hk-date.js";
import type { HkjcInputSnapshot } from "./hkjc/types.js";
import { resolveMatchScores } from "./match-scores.js";
import {
  isPickSettlable,
  settleAiPick,
  type PickOutcome,
} from "./pick-settlement.js";
import type { WinRateStats } from "./win-rate-stats.js";

type AnalysisPickRow = {
  hkjc_match_id: string;
  input_snapshot: HkjcInputSnapshot | null;
  analysis: MatchAnalysisData | null;
};

let cachedStats: { stats: WinRateStats; expiresAt: number } | null = null;
const STATS_CACHE_TTL_MS = Number(process.env.WIN_RATE_STATS_CACHE_MS ?? 3 * 60 * 1000);

function clampRate(wins: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((wins / total) * 1000) / 10));
}

function isCountableOutcome(outcome: PickOutcome | null): outcome is "won" | "lost" {
  return outcome === "won" || outcome === "lost";
}

async function loadCompletedAiPicks(): Promise<AnalysisPickRow[]> {
  const result = await query<AnalysisPickRow>(
    `SELECT hkjc_match_id, input_snapshot, analysis
     FROM match_analyses
     WHERE status = 'completed'
       AND analysis IS NOT NULL
       AND analysis->'pick'->>'selection' IS NOT NULL
       AND analysis->'pick'->>'selection' NOT IN ('', '待定', 'TBD', 'N/A')`,
  );
  return result.rows;
}

export async function computeWinRateStats(options?: {
  refresh?: boolean;
}): Promise<WinRateStats> {
  if (!options?.refresh && cachedStats && cachedStats.expiresAt > Date.now()) {
    return cachedStats.stats;
  }

  const rows = await loadCompletedAiPicks();
  const todayKey = getTodayDateKeyHk();

  const settlableRows = rows.filter((row) => {
    const kickOff = row.input_snapshot?.kickOffTime;
    return kickOff ? isPickSettlable(kickOff) : false;
  });

  const scoreEntries = settlableRows
    .map((row) => {
      const kickOff = row.input_snapshot?.kickOffTime;
      if (!kickOff) return null;
      const dateKey = dateKeyFromKickOff(kickOff);
      if (!dateKey) return null;
      return { matchId: row.hkjc_match_id, dateKey };
    })
    .filter((entry): entry is { matchId: string; dateKey: string } => entry !== null);

  const scores = await resolveMatchScores(scoreEntries);

  let todayWins = 0;
  let todayTotal = 0;
  let totalWins = 0;
  let totalTotal = 0;

  for (const row of settlableRows) {
    const pick = row.analysis?.pick;
    const kickOff = row.input_snapshot?.kickOffTime;
    if (!pick || !kickOff) continue;

    const score = scores.get(row.hkjc_match_id);
    if (!score) continue;

    const outcome = settleAiPick(pick, score, row.input_snapshot);
    if (!isCountableOutcome(outcome)) continue;

    totalTotal += 1;
    if (outcome === "won") totalWins += 1;

    const matchDate = dateKeyFromKickOff(kickOff);
    if (matchDate === todayKey) {
      todayTotal += 1;
      if (outcome === "won") todayWins += 1;
    }
  }

  const stats: WinRateStats = {
    todayWinRate: clampRate(todayWins, todayTotal),
    totalWinRate: clampRate(totalWins, totalTotal),
    updatedAt: new Date().toISOString(),
    todayWins,
    todaySettled: todayTotal,
    totalWins,
    totalSettled: totalTotal,
  };

  cachedStats = {
    stats,
    expiresAt: Date.now() + STATS_CACHE_TTL_MS,
  };

  return stats;
}
