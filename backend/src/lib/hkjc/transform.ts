import { ACTIVE_MATCH_STATUSES, HKJC_TOURNAMENT_FLAG } from "./constants.js";
import {
  bracketHandicapLine,
  flipHandicapLine,
  formatHandicapLine,
} from "./handicap.js";
import type {
  HkjcDateItem,
  HkjcHadOdds,
  HkjcHdcOdds,
  HkjcHilOdds,
  HkjcMatch,
} from "./types.js";

type RawTeam = { id: string; name_en: string; name_ch: string };
type RawTournament = {
  id: string;
  code: string;
  name_en: string;
  name_ch: string;
};
type RawCombination = {
  str: string;
  currentOdds: string;
};
type RawPool = {
  oddsType: string;
  inplay?: boolean;
  lines?: Array<{
    main?: boolean;
    condition?: string;
    combinations?: RawCombination[];
  }>;
};
export type RawMatch = {
  id: string;
  frontEndId: string;
  matchDate: string;
  kickOffTime: string;
  status: string;
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  tournament: RawTournament;
  poolInfo?: { sellingPools?: string[] };
  foPools?: RawPool[];
};

function getMainLine(pool?: RawPool) {
  return pool?.lines?.find((line) => line.main) ?? pool?.lines?.[0];
}

function parseHadOdds(foPools?: RawPool[]): HkjcHadOdds | null {
  const had = foPools?.find((pool) => pool.oddsType === "HAD");
  const mainLine = getMainLine(had);
  if (!mainLine?.combinations?.length) return null;

  const odds: Partial<HkjcHadOdds> = {};
  for (const combo of mainLine.combinations) {
    if (combo.str === "H") odds.home = combo.currentOdds;
    if (combo.str === "D") odds.draw = combo.currentOdds;
    if (combo.str === "A") odds.away = combo.currentOdds;
  }

  if (!odds.home || !odds.draw || !odds.away) return null;
  return odds as HkjcHadOdds;
}

export function parseHdcOdds(foPools?: RawPool[]): HkjcHdcOdds | null {
  const hdc = foPools?.find((pool) => pool.oddsType === "HDC");
  const mainLine = getMainLine(hdc);
  if (!mainLine?.condition || !mainLine.combinations?.length) return null;

  const home = mainLine.combinations.find((c) => c.str === "H");
  const away = mainLine.combinations.find((c) => c.str === "A");
  if (!home?.currentOdds || !away?.currentOdds) return null;

  const homeLine = bracketHandicapLine(mainLine.condition);
  const awayLine = bracketHandicapLine(flipHandicapLine(mainLine.condition));

  return {
    homeLine,
    homeOdds: home.currentOdds,
    awayLine,
    awayOdds: away.currentOdds,
  };
}

export function parseHilOdds(foPools?: RawPool[]): HkjcHilOdds | null {
  const hil = foPools?.find((pool) => pool.oddsType === "HIL");
  const mainLine = getMainLine(hil);
  if (!mainLine?.condition || !mainLine.combinations?.length) return null;

  const over = mainLine.combinations.find((c) => c.str === "H");
  const under = mainLine.combinations.find((c) => c.str === "L");
  if (!over?.currentOdds || !under?.currentOdds) return null;

  return {
    line: `[${formatHandicapLine(mainLine.condition)}]`,
    overOdds: over.currentOdds,
    underOdds: under.currentOdds,
  };
}

function parseMatchDate(matchDate: string): string {
  return matchDate.split("+")[0] ?? matchDate;
}

function formatKickOff(kickOffTime: string): string {
  const date = new Date(kickOffTime);
  if (Number.isNaN(date.getTime())) return kickOffTime;
  return date.toLocaleTimeString("zh-HK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  });
}

function formatDay(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  return date.toLocaleDateString("zh-HK", {
    weekday: "short",
    timeZone: "Asia/Hong_Kong",
  });
}

export function buildDateItems(matches: HkjcMatch[]): HkjcDateItem[] {
  const dateKeys = [...new Set(matches.map((match) => match.matchDate))].sort();
  return dateKeys.map((key) => {
    const [, , day] = key.split("-").map(Number);
    return {
      key,
      day: formatDay(key),
      date: day,
      hasEvent: true,
    };
  });
}

export function isActiveHkjcMatch(match: RawMatch): boolean {
  if (!ACTIVE_MATCH_STATUSES.has(match.status)) return false;
  const kickOff = new Date(match.kickOffTime).getTime();
  if (Number.isNaN(kickOff)) return true;
  return kickOff > Date.now() - 3 * 60 * 60 * 1000;
}

export function transformHkjcMatch(raw: RawMatch): HkjcMatch {
  const hadPool = raw.foPools?.find((pool) => pool.oddsType === "HAD");
  const dateKey = parseMatchDate(raw.matchDate);

  return {
    id: raw.id,
    frontEndId: raw.frontEndId,
    title: `${raw.homeTeam.name_ch} 對 ${raw.awayTeam.name_ch}`,
    homeTeam: raw.homeTeam.name_ch,
    awayTeam: raw.awayTeam.name_ch,
    homeTeamEn: raw.homeTeam.name_en,
    awayTeamEn: raw.awayTeam.name_en,
    homeTeamId: raw.homeTeam.id,
    awayTeamId: raw.awayTeam.id,
    tournamentId: raw.tournament.id,
    tournamentCode: raw.tournament.code,
    tournamentName: raw.tournament.name_ch,
    matchDate: dateKey,
    kickOffTime: raw.kickOffTime,
    kickOffLabel: formatKickOff(raw.kickOffTime),
    status: raw.status,
    homeLogo: "",
    awayLogo: "",
    tournamentLogo: HKJC_TOURNAMENT_FLAG(raw.tournament.code),
    hadOdds: parseHadOdds(raw.foPools),
    hdcOdds: parseHdcOdds(raw.foPools),
    hilOdds: parseHilOdds(raw.foPools),
    poolCount: raw.poolInfo?.sellingPools?.length ?? 0,
    inplay: Boolean(hadPool?.inplay),
  };
}

export function mergeRawMatches(batches: RawMatch[][]): RawMatch[] {
  const map = new Map<string, RawMatch>();

  for (const batch of batches) {
    for (const match of batch) {
      const existing = map.get(match.id);
      if (!existing) {
        map.set(match.id, { ...match, foPools: [...(match.foPools ?? [])] });
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

export function toInputSnapshot(match: HkjcMatch) {
  return {
    matchId: match.id,
    frontEndId: match.frontEndId,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamEn: match.homeTeamEn,
    awayTeamEn: match.awayTeamEn,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    tournamentName: match.tournamentName,
    tournamentCode: match.tournamentCode,
    kickOffTime: match.kickOffTime,
    hadOdds: match.hadOdds,
    hdcOdds: match.hdcOdds,
    hilOdds: match.hilOdds,
  };
}
