import { getTodayDateKeyHk, mergeAdminTodayPassedMatches } from "./past-dates";
import { filterMatchesByDate, filterUpcomingMatches } from "./transform";
import { filterWorldCupMatches } from "./world-cup";
import type { HkjcMatch } from "@/types/hkjc";

export function getTodayWorldCupMatches(
  matches: HkjcMatch[],
  todayPassedMatches: HkjcMatch[] = [],
): HkjcMatch[] {
  const todayKey = getTodayDateKeyHk();
  const today = mergeAdminTodayPassedMatches(
    filterMatchesByDate(matches, todayKey),
    todayPassedMatches,
  );

  const upcoming = filterWorldCupMatches(filterUpcomingMatches(today));
  if (upcoming.length > 0) {
    return upcoming;
  }

  return filterWorldCupMatches(today);
}

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

export function buildWorldCupFeaturedHref(
  matches: HkjcMatch[],
  options?: {
    todayPassedMatches?: HkjcMatch[];
    scores?: Record<string, number>;
  },
): string {
  const todayKey = getTodayDateKeyHk();
  const scores = options?.scores ?? {};
  let pool = getTodayWorldCupMatches(
    matches,
    options?.todayPassedMatches ?? [],
  );

  if (pool.length === 0) {
    pool = filterUpcomingMatches(filterMatchesByDate(matches, todayKey));
  }

  if (pool.length === 0) {
    return `/analysis?date=${encodeURIComponent(todayKey)}`;
  }

  const topMatch = rankMatchesByScore(pool, scores)[0];
  return topMatch ? `/analysis/${topMatch.id}` : `/analysis?date=${encodeURIComponent(todayKey)}`;
}

export function getTodayWorldCupMatchIds(
  matches: HkjcMatch[],
  todayPassedMatches: HkjcMatch[] = [],
): string[] {
  return getTodayWorldCupMatches(matches, todayPassedMatches).map(
    (match) => match.id,
  );
}
