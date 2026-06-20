import {
  fetchAnalysisScores,
  prewarmAnalyses,
} from "@/lib/analyses-api";
import { fetchHkjcMatchesFromApi } from "@/lib/hkjc/matches-api";
import type { PrewarmResult } from "@/types/analysis";

const TOP_MATCH_POLL_MS = 1_500;
const TOP_MATCH_POLL_ATTEMPTS = 10;

function pickHighestConfidenceMatchId(
  results: PrewarmResult[],
  fallbackMatchId: string,
): string {
  let topMatchId = fallbackMatchId;
  let topScore = -1;

  for (const result of results) {
    if (result.status !== "completed") continue;
    const score = result.confidenceScore ?? 0;
    if (score > topScore) {
      topScore = score;
      topMatchId = result.matchId;
    }
  }

  return topScore > 0 ? topMatchId : fallbackMatchId;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function findTopConfidenceMatchId(
  token: string,
  fallbackMatchId: string,
): Promise<string> {
  const data = await fetchHkjcMatchesFromApi();
  const matchIds = data.matches.map((match) => match.id);

  if (matchIds.length === 0) {
    return fallbackMatchId;
  }

  let results = await fetchAnalysisScores(token, matchIds);
  let topMatchId = pickHighestConfidenceMatchId(results, fallbackMatchId);

  if (
    results.some(
      (result) =>
        result.status === "completed" && (result.confidenceScore ?? 0) > 0,
    )
  ) {
    return topMatchId;
  }

  void prewarmAnalyses(token, matchIds);

  for (let attempt = 0; attempt < TOP_MATCH_POLL_ATTEMPTS; attempt += 1) {
    await sleep(TOP_MATCH_POLL_MS);
    results = await fetchAnalysisScores(token, matchIds);
    topMatchId = pickHighestConfidenceMatchId(results, fallbackMatchId);
    if (topMatchId !== fallbackMatchId) {
      return topMatchId;
    }
    if (results.some((result) => result.status === "completed")) {
      return topMatchId;
    }
  }

  return topMatchId;
}

export async function resolveTopMatchDetailPath(
  token: string | null,
  canAccess: boolean,
  fallbackMatchId?: string,
): Promise<string> {
  const data = await fetchHkjcMatchesFromApi();
  const fallbackId = fallbackMatchId ?? data.matches[0]?.id;

  if (!fallbackId) {
    return "/analysis";
  }

  if (!canAccess || !token) {
    return `/analysis/${fallbackId}`;
  }

  const topMatchId = await findTopConfidenceMatchId(token, fallbackId);
  return `/analysis/${topMatchId}`;
}
