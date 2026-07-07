import { createFootballAPI } from "./hkjc/graphql-client.js";
import type { MatchScore } from "./pick-settlement.js";

type HistoricResult = {
  homeResult?: string | number;
  awayResult?: string | number;
  resultType?: number;
};

type HistoricMatch = {
  id: string;
  results?: HistoricResult[];
};

type RawRunningResult = {
  homeScore?: string | number;
  awayScore?: string | number;
};

const scoreCache = new Map<string, { score: MatchScore | null; expiresAt: number }>();
const SCORE_CACHE_TTL_MS = Number(process.env.WIN_RATE_SCORE_CACHE_MS ?? 5 * 60 * 1000);

function cacheScore(matchId: string, score: MatchScore | null): void {
  scoreCache.set(matchId, {
    score,
    expiresAt: Date.now() + SCORE_CACHE_TTL_MS,
  });
}

function readCachedScore(matchId: string): MatchScore | null | undefined {
  const cached = scoreCache.get(matchId);
  if (!cached) return undefined;
  if (cached.expiresAt <= Date.now()) {
    scoreCache.delete(matchId);
    return undefined;
  }
  return cached.score;
}

function parseScore(home: unknown, away: unknown): MatchScore | null {
  const homeGoals = Number(home);
  const awayGoals = Number(away);
  if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) {
    return null;
  }
  return { homeGoals, awayGoals };
}

function pickFullTimeResult(results: HistoricResult[] | undefined): MatchScore | null {
  if (!results?.length) return null;

  const fullTime =
    results.find((result) => result.resultType === 1) ??
    results[results.length - 1];
  return parseScore(fullTime.homeResult, fullTime.awayResult);
}

async function fetchHistoricScoresByDateRange(
  startDate: string,
  endDate: string,
): Promise<Map<string, MatchScore>> {
  const scores = new Map<string, MatchScore>();
  const api = createFootballAPI();

  try {
    const response = await api.searchHistoricFootballMatches({
      startDate,
      endDate,
    });

    for (const match of (response.matches ?? []) as HistoricMatch[]) {
      const score = pickFullTimeResult(match.results);
      if (score) {
        scores.set(match.id, score);
        cacheScore(match.id, score);
      }
    }
  } catch (error) {
    console.error("Historic score batch fetch failed:", error);
  }

  return scores;
}

async function fetchScoreForMatch(matchId: string): Promise<MatchScore | null> {
  const cached = readCachedScore(matchId);
  if (cached !== undefined) return cached;

  const api = createFootballAPI();

  try {
    const historic = await api.getHistoricFootballMatchDetails(matchId, ["HAD"]);
    const additional = historic as {
      additionalResults?: { results?: HistoricResult[] };
    } | null;
    const fromAdditional = pickFullTimeResult(
      additional?.additionalResults?.results,
    );
    if (fromAdditional) {
      cacheScore(matchId, fromAdditional);
      return fromAdditional;
    }
  } catch (error) {
    console.warn(`Historic score lookup failed for ${matchId}:`, error);
  }

  try {
    const live = (await api.getFootballMatchDetails(matchId, ["HAD"])) as {
      runningResult?: RawRunningResult;
    } | null;
    const fromLive = parseScore(
      live?.runningResult?.homeScore,
      live?.runningResult?.awayScore,
    );
    if (fromLive) {
      cacheScore(matchId, fromLive);
      return fromLive;
    }
  } catch (error) {
    console.warn(`Live score lookup failed for ${matchId}:`, error);
  }

  cacheScore(matchId, null);
  return null;
}

export async function resolveMatchScores(
  entries: Array<{ matchId: string; dateKey: string }>,
): Promise<Map<string, MatchScore>> {
  const scores = new Map<string, MatchScore>();
  const missingIds: string[] = [];

  for (const entry of entries) {
    const cached = readCachedScore(entry.matchId);
    if (cached) {
      scores.set(entry.matchId, cached);
      continue;
    }
    missingIds.push(entry.matchId);
  }

  if (missingIds.length === 0) return scores;

  const dateKeys = [...new Set(entries.map((entry) => entry.dateKey))].sort();
  if (dateKeys.length > 0) {
    const batchScores = await fetchHistoricScoresByDateRange(
      dateKeys[0],
      dateKeys[dateKeys.length - 1],
    );
    for (const [matchId, score] of batchScores) {
      scores.set(matchId, score);
    }
  }

  const stillMissing = [...new Set(missingIds)].filter((id) => !scores.has(id));
  const maxIndividualLookups = Number(
    process.env.WIN_RATE_INDIVIDUAL_SCORE_LOOKUP_MAX ?? 30,
  );

  for (const matchId of stillMissing.slice(0, maxIndividualLookups)) {
    const score = await fetchScoreForMatch(matchId);
    if (score) {
      scores.set(matchId, score);
    }
  }

  return scores;
}
