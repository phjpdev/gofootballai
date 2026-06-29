import {
  buildDateItems,
  isActiveHkjcMatch,
  mergeRawMatches,
  transformHkjcMatch,
  type RawMatch,
} from "./transform.js";
import { archiveHkjcMatches } from "../archived-hkjc.js";
import { createFootballAPI } from "./graphql-client.js";
import type { HkjcMatch, HkjcMatchesResponse } from "./types.js";

let cache: {
  matches: HkjcMatch[];
  expiresAt: number;
  savedAt: number;
} | null = null;
const CACHE_TTL_MS = 120_000;
const STALE_MAX_MS = 24 * 60 * 60 * 1000;

const matchByIdCache = new Map<string, { match: HkjcMatch; expiresAt: number }>();
const MATCH_BY_ID_TTL_MS = 120_000;

async function fetchRawMatches(): Promise<RawMatch[]> {
  const api = createFootballAPI();
  const batchA = await api.getAllFootballMatches({
    oddsTypes: ["HAD", "HDC"],
    showAllMatch: true,
  });
  const batchB = await api.getAllFootballMatches({
    oddsTypes: ["HIL"],
    showAllMatch: true,
  });

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

  try {
    const matches = await loadMatches();

    if (matches.length > 0) {
      cache = {
        matches,
        expiresAt: Date.now() + CACHE_TTL_MS,
        savedAt: Date.now(),
      };
      void archiveHkjcMatches(matches).catch((error) => {
        console.warn("Failed to archive HKJC matches:", error);
      });
      return matches;
    }
  } catch (error) {
    console.error("HKJC loadMatches failed:", error);
  }

  if (cache && cache.matches.length > 0) {
    const age = Date.now() - cache.savedAt;
    if (age < STALE_MAX_MS) {
      console.warn("HKJC fetch failed or empty; serving stale cache");
      return cache.matches;
    }
  }

  return cache?.matches ?? [];
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
  const cached = matchByIdCache.get(matchId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.match;
  }

  const fromList = (await fetchHkjcMatches()).find((match) => match.id === matchId);
  if (fromList) {
    matchByIdCache.set(matchId, {
      match: fromList,
      expiresAt: Date.now() + MATCH_BY_ID_TTL_MS,
    });
    return fromList;
  }

  try {
    const api = createFootballAPI();
    const raw = (await api.getFootballMatchDetails(matchId, [
      "HAD",
      "HDC",
      "HIL",
    ])) as RawMatch | null;
    if (!raw) return null;

    const match = transformHkjcMatch(raw);
    matchByIdCache.set(matchId, {
      match,
      expiresAt: Date.now() + MATCH_BY_ID_TTL_MS,
    });
    void archiveHkjcMatches([match]).catch((error) => {
      console.warn(`Failed to archive HKJC match ${matchId}:`, error);
    });
    return match;
  } catch (error) {
    console.error(`Direct HKJC fetch failed for ${matchId}:`, error);
    return null;
  }
}

export function invalidateHkjcCache(): void {
  cache = null;
  matchByIdCache.clear();
}
