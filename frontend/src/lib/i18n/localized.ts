import type { Locale } from "./config";
import { resolveEnglishTeamName } from "@/lib/hkjc/team-names";

const CJK_RE = /[㐀-鿿豈-﫿]/;

export function containsCjk(value: string): boolean {
  return CJK_RE.test(value);
}

/**
 * Admin-entered content keeps Chinese as the source of truth; English is an
 * optional override. English readers see the Chinese text until one is filled in.
 */
export function localizedText(
  locale: Locale,
  zh: string | null | undefined,
  en: string | null | undefined,
): string {
  if (locale === "en") {
    const english = en?.trim();
    if (english) return english;
  }
  return zh ?? "";
}

/** HKJC sends both names; older/archived rows may lack English, so fall back. */
export function localizedTeamName(
  locale: Locale,
  zh: string | null | undefined,
  en?: string | null,
): string {
  const chinese = zh?.trim() ?? "";
  if (locale !== "en") return chinese;
  const english = en?.trim() || resolveEnglishTeamName(chinese);
  return english || chinese;
}

type MatchNames = {
  homeTeam: string;
  awayTeam: string;
  homeTeamEn?: string | null;
  awayTeamEn?: string | null;
  tournamentName?: string | null;
  tournamentNameEn?: string | null;
};

export function localizedMatchTeams(
  locale: Locale,
  match: MatchNames,
): { home: string; away: string } {
  return {
    home: localizedTeamName(locale, match.homeTeam, match.homeTeamEn),
    away: localizedTeamName(locale, match.awayTeam, match.awayTeamEn),
  };
}

export function localizedMatchTitle(locale: Locale, match: MatchNames): string {
  const { home, away } = localizedMatchTeams(locale, match);
  return locale === "en" ? `${home} vs ${away}` : `${home} 對 ${away}`;
}

export function localizedTournamentName(
  locale: Locale,
  match: Pick<MatchNames, "tournamentName" | "tournamentNameEn">,
): string {
  return localizedText(locale, match.tournamentName, match.tournamentNameEn);
}

export type PickContext = {
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeTeamEn?: string | null;
  awayTeamEn?: string | null;
  /** Used only when the Chinese selection cannot be mapped (e.g. AI free text). */
  fallbackEn?: string | null;
};

const NUMBER_LINE = String.raw`[+-]?\d+(?:\.\d+)?(?:\s*/\s*[+-]?\d+(?:\.\d+)?)?`;

function translateSide(rest: string): string | null {
  const trimmed = rest.trim();
  if (!trimmed) return "";
  if (trimmed === "勝" || trimmed === "贏") return " win";
  if (trimmed === "和" || trimmed === "和局") return " draw";
  const handicap = trimmed.replace(/^讓\s*/, "");
  if (new RegExp(`^${NUMBER_LINE}$`).test(handicap)) return ` ${handicap.replace(/\s+/g, "")}`;
  if (/^\[[^\]]+\]$/.test(handicap)) return ` ${handicap}`;
  return null;
}

/**
 * Picks are stored in Chinese ("大2.5", "主勝", "主-0.5/-1", "德國-1") and are
 * flipped/compared as Chinese elsewhere, so translate only at display time.
 */
export function formatPickSelection(
  selection: string,
  locale: Locale,
  context: PickContext = {},
): string {
  const value = selection.trim();
  if (locale !== "en" || !value || !containsCjk(value)) return selection;

  const overUnder = value.match(new RegExp(`^(大|小)\\s*(${NUMBER_LINE})$`));
  if (overUnder) {
    return `${overUnder[1] === "大" ? "Over" : "Under"} ${overUnder[2].replace(/\s+/g, "")}`;
  }

  if (value === "無" || value === "沒有") return "No pick";
  if (value === "和" || value === "和局") return "Draw";

  const sides: Array<[string, string]> = [];
  if (context.homeTeam) {
    sides.push([context.homeTeam.trim(), localizedTeamName("en", context.homeTeam, context.homeTeamEn)]);
  }
  if (context.awayTeam) {
    sides.push([context.awayTeam.trim(), localizedTeamName("en", context.awayTeam, context.awayTeamEn)]);
  }
  sides.push(["主隊", "Home"], ["客隊", "Away"], ["主", "Home"], ["客", "Away"]);

  for (const [zh, en] of sides) {
    if (!zh || !value.startsWith(zh)) continue;
    const suffix = translateSide(value.slice(zh.length));
    if (suffix !== null) return `${en}${suffix}`;
  }

  // Unknown team prefix: try the national-team dictionary on the leading name.
  const named = value.match(new RegExp(`^(.+?)\\s*(勝|贏|讓\\s*${NUMBER_LINE}|${NUMBER_LINE})?$`));
  if (named) {
    const english = resolveEnglishTeamName(named[1]);
    const suffix = translateSide(named[2] ?? "");
    if (english && suffix !== null) return `${english}${suffix}`;
  }

  const fallback = context.fallbackEn?.trim();
  if (fallback && !containsCjk(fallback)) return fallback;
  return selection;
}
