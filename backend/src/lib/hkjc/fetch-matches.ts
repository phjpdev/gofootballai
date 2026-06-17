import { FootballAPI } from "hkjc-api";
import {
  isActiveHkjcMatch,
  mergeRawMatches,
  transformHkjcMatch,
  type RawMatch,
} from "./transform.js";
import type { HkjcMatch } from "./types.js";

let cache: { matches: HkjcMatch[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

async function fetchRawMatches(): Promise<RawMatch[]> {
  const api = new FootballAPI();
  const [batchA, batchB] = await Promise.all([
    api.getAllFootballMatches({
      oddsTypes: ["HAD", "HDC"],
      showAllMatch: true,
    }),
    api.getAllFootballMatches({
      oddsTypes: ["HIL"],
      showAllMatch: true,
    }),
  ]);

  return mergeRawMatches([batchA as RawMatch[], batchB as RawMatch[]]);
}

export async function fetchHkjcMatches(): Promise<HkjcMatch[]> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.matches;
  }

  const rawMatches = await fetchRawMatches();
  const matches = rawMatches
    .filter(isActiveHkjcMatch)
    .map(transformHkjcMatch)
    .sort(
      (a, b) =>
        new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime(),
    );

  cache = { matches, expiresAt: Date.now() + CACHE_TTL_MS };
  return matches;
}

export async function fetchHkjcMatchById(
  matchId: string,
): Promise<HkjcMatch | null> {
  const matches = await fetchHkjcMatches();
  return matches.find((match) => match.id === matchId) ?? null;
}

export function invalidateHkjcCache(): void {
  cache = null;
}
