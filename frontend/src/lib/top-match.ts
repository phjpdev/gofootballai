import { prewarmAnalyses } from "@/lib/analyses-api";
import { fetchHkjcMatchesFromApi } from "@/lib/hkjc/matches-api";

const TOP_MATCH_SCAN_LIMIT = 24;

export async function findTopConfidenceMatchId(
  token: string,
  fallbackMatchId: string,
): Promise<string> {
  const data = await fetchHkjcMatchesFromApi();
  const matchIds = data.matches
    .slice(0, TOP_MATCH_SCAN_LIMIT)
    .map((match) => match.id);

  if (matchIds.length === 0) {
    return fallbackMatchId;
  }

  const results = await prewarmAnalyses(token, matchIds);

  let topMatchId = fallbackMatchId;
  let topScore = -1;

  for (const result of results) {
    const score = result.confidenceScore ?? 0;
    if (score > topScore) {
      topScore = score;
      topMatchId = result.matchId;
    }
  }

  return topMatchId;
}

export async function resolveTopMatchDetailPath(
  token: string | null,
  canAccess: boolean,
  fallbackMatchId?: string,
): Promise<string> {
  const data = await fetchHkjcMatchesFromApi();
  const fallbackId = fallbackMatchId ?? data.matches[0]?.id;

  if (!fallbackId) {
    return "/analysis";
  }

  if (!canAccess || !token) {
    return `/analysis/${fallbackId}`;
  }

  const topMatchId = await findTopConfidenceMatchId(token, fallbackId);
  return `/analysis/${topMatchId}`;
}
