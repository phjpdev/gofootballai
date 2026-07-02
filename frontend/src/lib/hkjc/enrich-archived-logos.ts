import type { HkjcMatch } from "@/types/hkjc";
import { resolveEnglishTeamName } from "@/lib/hkjc/team-names";

export function enrichArchivedMatchLogos(match: HkjcMatch): HkjcMatch {
  const homeTeamEn = match.homeTeamEn || resolveEnglishTeamName(match.homeTeam);
  const awayTeamEn = match.awayTeamEn || resolveEnglishTeamName(match.awayTeam);

  const homeLogo =
    match.homeLogo ||
    (match.homeTeamId
      ? `/api/hkjc/logo?type=team&id=${encodeURIComponent(match.homeTeamId)}`
      : "");
  const awayLogo =
    match.awayLogo ||
    (match.awayTeamId
      ? `/api/hkjc/logo?type=team&id=${encodeURIComponent(match.awayTeamId)}`
      : "");

  return {
    ...match,
    homeTeamEn,
    awayTeamEn,
    homeLogo,
    awayLogo,
  };
}

export function enrichArchivedMatches(matches: HkjcMatch[]): HkjcMatch[] {
  return matches.map(enrichArchivedMatchLogos);
}
