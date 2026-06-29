import type { HkjcMatch } from "@/types/hkjc";

const HKJC_TEAM_EN: Record<string, string> = {
  克羅地亞: "Croatia",
  加納: "Ghana",
  巴西: "Brazil",
  日本: "Japan",
  德國: "Germany",
  法國: "France",
  英格蘭: "England",
  荷蘭: "Netherlands",
  西班牙: "Spain",
  葡萄牙: "Portugal",
  阿根廷: "Argentina",
  墨西哥: "Mexico",
  美國: "United States",
  加拿大: "Canada",
  瑞士: "Switzerland",
  摩洛哥: "Morocco",
  蘇格蘭: "Scotland",
  波斯尼亞: "Bosnia and Herzegovina",
  卡塔爾: "Qatar",
  澳洲: "Australia",
  南韓: "South Korea",
};

function resolveEnglishTeamName(chineseName: string): string {
  return HKJC_TEAM_EN[chineseName.trim()] ?? "";
}

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
