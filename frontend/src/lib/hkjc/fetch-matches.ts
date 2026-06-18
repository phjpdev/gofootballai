import { FootballAPI } from "hkjc-api";
import {
  buildDateItems,
  isActiveHkjcMatch,
  transformHkjcMatch,
} from "@/lib/hkjc/transform";
import type { HkjcMatch, HkjcMatchesResponse } from "@/types/hkjc";

type RawPool = { oddsType: string };
type RawMatch = Parameters<typeof isActiveHkjcMatch>[0] & {
  foPools?: RawPool[];
};

function mergeRawMatches(batches: RawMatch[][]): RawMatch[] {
  const map = new Map<string, RawMatch>();

  for (const batch of batches) {
    for (const match of batch) {
      const existing = map.get(match.id);
      if (!existing) {
        map.set(match.id, match);
        continue;
      }

      const poolByType = new Map<string, RawPool>();
      for (const pool of [...(existing.foPools ?? []), ...(match.foPools ?? [])]) {
        poolByType.set(pool.oddsType, pool);
      }

      map.set(match.id, {
        ...existing,
        ...match,
        foPools: [...poolByType.values()],
      });
    }
  }

  return [...map.values()];
}

let cache: { data: HkjcMatchesResponse; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function fetchHkjcMatches(): Promise<HkjcMatchesResponse> {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.data;
  }

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

  const rawMatches = mergeRawMatches([batchA as RawMatch[], batchB as RawMatch[]]);
  const matches = rawMatches
    .filter(isActiveHkjcMatch)
    .map(transformHkjcMatch)
    .sort(
      (a, b) =>
        new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime(),
    );

  const data: HkjcMatchesResponse = {
    matches,
    dates: buildDateItems(matches),
    total: matches.length,
    updatedAt: new Date().toISOString(),
  };

  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}

export async function fetchHkjcMatchById(id: string): Promise<HkjcMatch | null> {
  const { matches } = await fetchHkjcMatches();
  return matches.find((match) => match.id === id) ?? null;
}

export function hkjcMatchToLegacy(match: HkjcMatch) {
  const homeOdds = match.hadOdds ? Number.parseFloat(match.hadOdds.home) : 2;
  const implied = Math.min(95, Math.round((1 / homeOdds) * 100));

  const homeLogo =
    match.homeLogo ||
    `/api/hkjc/logo?type=team&id=${encodeURIComponent(match.homeTeamId)}`;
  const awayLogo =
    match.awayLogo ||
    `/api/hkjc/logo?type=team&id=${encodeURIComponent(match.awayTeamId)}`;

  return {
    id: match.id,
    title: match.title,
    tag: match.tournamentCode || match.frontEndId,
    progress: match.inplay ? 100 : 65,
    movements: match.poolCount,
    completion: implied,
    imageSrc: match.tournamentLogo,
    homeLogo,
    awayLogo,
    date: match.matchDate,
    time: match.kickOffLabel,
    venue: match.tournamentName,
    frontEndId: match.frontEndId,
    hadOdds: match.hadOdds,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamEn: match.homeTeamEn,
    awayTeamEn: match.awayTeamEn,
  };
}
