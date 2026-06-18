import {
  buildDateItems,
  isActiveHkjcMatch,
  mergeRawMatches,
  transformHkjcMatch,
  type RawMatch,
} from "./transform.js";
import { createFootballAPI } from "./graphql-client.js";
import type { HkjcMatch, HkjcMatchesResponse } from "./types.js";

let cache: { matches: HkjcMatch[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

async function fetchRawMatches(): Promise<RawMatch[]> {
  const api = createFootballAPI();
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

  const merged = mergeRawMatches([batchA as RawMatch[], batchB as RawMatch[]]);
  if (merged.length === 0) {
    console.warn("HKJC returned no raw matches");
  }
  return merged;
}

async function loadMatches(): Promise<HkjcMatch[]> {
  const rawMatches = await fetchRawMatches();
  return rawMatches
    .filter(isActiveHkjcMatch)
    .map(transformHkjcMatch)
    .sort(
      (a, b) =>
        new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime(),
    );
}

export async function fetchHkjcMatches(options?: {
  refresh?: boolean;
}): Promise<HkjcMatch[]> {
  if (!options?.refresh && cache && cache.expiresAt > Date.now()) {
    return cache.matches;
  }

  const matches = await loadMatches();

  if (matches.length > 0) {
    cache = { matches, expiresAt: Date.now() + CACHE_TTL_MS };
    return matches;
  }

  if (cache && cache.matches.length > 0) {
    console.warn("HKJC fetch returned empty; serving stale cache");
    return cache.matches;
  }

  return matches;
}

export async function fetchHkjcMatchesResponse(options?: {
  refresh?: boolean;
}): Promise<HkjcMatchesResponse> {
  const matches = await fetchHkjcMatches(options);
  return {
    matches,
    dates: buildDateItems(matches),
    total: matches.length,
    updatedAt: new Date().toISOString(),
  };
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
