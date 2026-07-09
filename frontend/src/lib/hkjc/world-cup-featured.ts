import {
  getTodayDateKeyHk,
  mergeAdminTodayPassedMatches,
} from "./past-dates";
import { filterMatchesByDate, filterUpcomingMatches } from "./transform";
import { filterWorldCupMatches } from "./world-cup";
import type { HkjcMatch } from "@/types/hkjc";

function rankMatchesByScore(
  matches: HkjcMatch[],
  scores: Record<string, number>,
): HkjcMatch[] {
  return [...matches].sort((a, b) => {
    const scoreDelta = (scores[b.id] ?? 0) - (scores[a.id] ?? 0);
    if (scoreDelta !== 0) return scoreDelta;
    return (
      new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime()
    );
  });
}

function matchesForDate(
  matches: HkjcMatch[],
  dateKey: string,
  todayPassedMatches: HkjcMatch[] = [],
): HkjcMatch[] {
  const forDate = filterMatchesByDate(matches, dateKey);
  if (dateKey === getTodayDateKeyHk()) {
    return mergeAdminTodayPassedMatches(forDate, todayPassedMatches);
  }
  return forDate;
}

export function getWorldCupMatchesForDate(
  matches: HkjcMatch[],
  dateKey: string,
  todayPassedMatches: HkjcMatch[] = [],
): HkjcMatch[] {
  const forDate = matchesForDate(matches, dateKey, todayPassedMatches);
  const upcoming = filterWorldCupMatches(filterUpcomingMatches(forDate));
  if (upcoming.length > 0) {
    return upcoming;
  }
  return filterWorldCupMatches(forDate);
}

export function buildWorldCupFeaturedHref(
  matches: HkjcMatch[],
  options?: {
    dateKey?: string;
    todayPassedMatches?: HkjcMatch[];
    scores?: Record<string, number>;
  },
): string {
  const dateKey = options?.dateKey ?? getTodayDateKeyHk();
  const scores = options?.scores ?? {};
  const todayPassed = options?.todayPassedMatches ?? [];

  const pools = [
    getWorldCupMatchesForDate(matches, dateKey, todayPassed),
    filterUpcomingMatches(matchesForDate(matches, dateKey, todayPassed)),
    matchesForDate(matches, dateKey, todayPassed),
    filterUpcomingMatches(matches),
    matches,
  ];

  for (const pool of pools) {
    if (pool.length === 0) continue;
    const topMatch = rankMatchesByScore(pool, scores)[0];
    if (topMatch) {
      return `/analysis/${topMatch.id}`;
    }
  }

  return "/analysis";
}

export function getWorldCupMatchIdsForDate(
  matches: HkjcMatch[],
  dateKey: string,
  todayPassedMatches: HkjcMatch[] = [],
): string[] {
  return getWorldCupMatchesForDate(matches, dateKey, todayPassedMatches).map(
    (match) => match.id,
  );
}

// Backwards-compatible helpers
export function getTodayWorldCupMatches(
  matches: HkjcMatch[],
  todayPassedMatches: HkjcMatch[] = [],
): HkjcMatch[] {
  return getWorldCupMatchesForDate(
    matches,
    getTodayDateKeyHk(),
    todayPassedMatches,
  );
}

export function getFeaturedScoreLookupIds(
  matches: HkjcMatch[],
  dateKey: string,
  todayPassedMatches: HkjcMatch[] = [],
): string[] {
  const worldCupIds = getWorldCupMatchIdsForDate(
    matches,
    dateKey,
    todayPassedMatches,
  );
  if (worldCupIds.length > 0) {
    return worldCupIds;
  }

  const forDate = matchesForDate(matches, dateKey, todayPassedMatches);
  const upcoming = filterUpcomingMatches(forDate);
  const pool = upcoming.length > 0 ? upcoming : forDate;
  return pool.slice(0, 20).map((match) => match.id);
}
