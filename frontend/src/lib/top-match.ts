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
  const ids = pickTopConfidenceMatchIds(results, 1, fallbackMatchId);
  return ids[0] ?? fallbackMatchId;
}

function pickTopConfidenceMatchIds(
  results: PrewarmResult[],
  count: number,
  fallbackMatchId: string,
): string[] {
  const ranked = results
    .filter(
      (result) =>
        result.status === "completed" && (result.confidenceScore ?? 0) > 0,
    )
    .sort(
      (a, b) => (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0),
    );

  const ids = ranked.slice(0, count).map((result) => result.matchId);
  if (ids.length > 0) {
    return ids;
  }

  return fallbackMatchId ? [fallbackMatchId] : [];
}

async function loadRankedMatchIds(
  token: string,
  fallbackMatchId: string,
  count: number,
): Promise<string[]> {
  const data = await fetchHkjcMatchesFromApi();
  const matchIds = data.matches.map((match) => match.id);

  if (matchIds.length === 0) {
    return fallbackMatchId ? [fallbackMatchId] : [];
  }

  let results = await fetchAnalysisScores(token, matchIds);
  let topIds = pickTopConfidenceMatchIds(results, count, fallbackMatchId);

  if (topIds.length > 0 && topIds[0] !== fallbackMatchId) {
    return topIds;
  }

  if (
    results.some(
      (result) =>
        result.status === "completed" && (result.confidenceScore ?? 0) > 0,
    )
  ) {
    return topIds;
  }

  void prewarmAnalyses(token, matchIds);

  for (let attempt = 0; attempt < TOP_MATCH_POLL_ATTEMPTS; attempt += 1) {
    await sleep(TOP_MATCH_POLL_MS);
    results = await fetchAnalysisScores(token, matchIds);
    topIds = pickTopConfidenceMatchIds(results, count, fallbackMatchId);
    if (topIds.length > 0 && topIds[0] !== fallbackMatchId) {
      return topIds;
    }
    if (results.some((result) => result.status === "completed")) {
      return topIds;
    }
  }

  return topIds;
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
  const ids = await findTopConfidenceMatchIds(token, fallbackMatchId, 1);
  return ids[0] ?? fallbackMatchId;
}

export async function findTopConfidenceMatchIds(
  token: string,
  fallbackMatchId: string,
  count = 4,
): Promise<string[]> {
  return loadRankedMatchIds(token, fallbackMatchId, count);
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

export async function resolveTopMatchPreviewPath(
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

  return "/analysis?picks=preview";
}
