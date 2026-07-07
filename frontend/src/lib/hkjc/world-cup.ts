import type { HkjcMatch } from "@/types/hkjc";

const WORLD_CUP_TOURNAMENT_CODES = new Set([
  "WCC",
  "WC",
  "FWC",
  "FIFA",
]);

export function isWorldCupMatch(
  match: Pick<HkjcMatch, "tournamentCode" | "tournamentName">,
): boolean {
  const code = match.tournamentCode?.trim().toUpperCase();
  if (code && WORLD_CUP_TOURNAMENT_CODES.has(code)) {
    return true;
  }

  const name = match.tournamentName?.trim() ?? "";
  return /世界盃|世界杯|world\s*cup|fifa/i.test(name);
}

export function filterWorldCupMatches(matches: HkjcMatch[]): HkjcMatch[] {
  return matches.filter(isWorldCupMatch);
}
