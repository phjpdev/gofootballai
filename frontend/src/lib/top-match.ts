import {
  fetchAnalysisScores,
  prewarmAnalyses,
} from "@/lib/analyses-api";
import {
  fetchAdminTodayPassedMatches,
  fetchArchivedMatches,
} from "@/lib/hkjc/archived-matches-api";
import { fetchHkjcMatchesFromApi } from "@/lib/hkjc/matches-api";
import {
  getTodayDateKeyHk,
  mergeAdminTodayPassedMatches,
} from "@/lib/hkjc/past-dates";
import { filterMatchesByDate } from "@/lib/hkjc/transform";
import type { HkjcMatch } from "@/types/hkjc";
import type { PrewarmResult } from "@/types/analysis";

const TOP_MATCH_POLL_MS = 1_500;
const TOP_MATCH_POLL_ATTEMPTS = 10;

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

export async function loadMatchesForDate(
  dateKey: string,
  token?: string | null,
): Promise<HkjcMatch[]> {
  const data = await fetchHkjcMatchesFromApi();
  let matches = filterMatchesByDate(data.matches, dateKey);

  if (!token) {
    return matches;
  }

  if (dateKey === getTodayDateKeyHk()) {
    try {
      const passed = await fetchAdminTodayPassedMatches(token);
      matches = mergeAdminTodayPassedMatches(matches, passed);
    } catch {
      // not admin or fetch failed
    }
    return matches;
  }

  try {
    const archived = await fetchArchivedMatches(token, dateKey);
    if (archived.length > 0) {
      matches = mergeAdminTodayPassedMatches(matches, archived);
    }
  } catch {
    // not admin or fetch failed
  }

  return matches;
}

async function loadRankedMatchIds(
  token: string,
  fallbackMatchId: string,
  count: number,
  dateKey?: string,
): Promise<string[]> {
  const effectiveDateKey = dateKey ?? getTodayDateKeyHk();
  const matches = await loadMatchesForDate(effectiveDateKey, token);
  const matchIds = matches.map((match) => match.id);
  const fallback = fallbackMatchId || matchIds[0] || "";

  if (matchIds.length === 0) {
    return fallback ? [fallback] : [];
  }

  let results = await fetchAnalysisScores(token, matchIds);
  let topIds = pickTopConfidenceMatchIds(results, count, fallback);

  if (topIds.length > 0 && topIds[0] !== fallback) {
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
    topIds = pickTopConfidenceMatchIds(results, count, fallback);
    if (topIds.length > 0 && topIds[0] !== fallback) {
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
  dateKey?: string,
): Promise<string> {
  const ids = await findTopConfidenceMatchIds(
    token,
    fallbackMatchId,
    1,
    dateKey,
  );
  return ids[0] ?? fallbackMatchId;
}

export async function findTopConfidenceMatchIds(
  token: string,
  fallbackMatchId: string,
  count = 4,
  dateKey?: string,
): Promise<string[]> {
  return loadRankedMatchIds(token, fallbackMatchId, count, dateKey);
}

export async function resolveTopMatchDetailPath(
  token: string | null,
  canAccess: boolean,
  options?: { fallbackMatchId?: string; dateKey?: string },
): Promise<string> {
  const dateKey = options?.dateKey ?? getTodayDateKeyHk();
  const matches = await loadMatchesForDate(dateKey, token);
  const fallbackId = options?.fallbackMatchId ?? matches[0]?.id;

  if (!fallbackId) {
    return "/analysis";
  }

  if (!canAccess || !token) {
    return `/analysis/${fallbackId}`;
  }

  const topMatchId = await findTopConfidenceMatchId(token, fallbackId, dateKey);
  return `/analysis/${topMatchId}`;
}

export async function resolveTopMatchPreviewPath(
  token: string | null,
  canAccess: boolean,
  options?: { fallbackMatchId?: string; dateKey?: string },
): Promise<string> {
  const dateKey = options?.dateKey ?? getTodayDateKeyHk();
  const matches = await loadMatchesForDate(dateKey, token);
  const fallbackId = options?.fallbackMatchId ?? matches[0]?.id;

  if (!fallbackId) {
    return "/analysis";
  }

  const dateQuery = `&date=${encodeURIComponent(dateKey)}`;

  if (!canAccess || !token) {
    return `/analysis/${fallbackId}`;
  }

  return `/analysis?picks=preview${dateQuery}`;
}

export function buildTopPicksHref(dateKey?: string): string {
  const effectiveDateKey = dateKey ?? getTodayDateKeyHk();
  return `/analysis?picks=top&date=${encodeURIComponent(effectiveDateKey)}`;
}
