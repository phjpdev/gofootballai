import type {
  AnalysisResponse,
  MatchAnalysisResult,
  PrewarmResult,
} from "@/types/analysis";
import { readApiError } from "@/lib/i18n/api-errors";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const parseError = readApiError;

export async function fetchMatchAnalysis(
  token: string,
  matchId: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<AnalysisResponse> {
  const query = locale === "en" ? "?lang=en" : "";
  const response = await fetch(`${API_URL}/api/analyses/${matchId}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AnalysisResponse;
}

export async function fetchAnalysisStatus(
  token: string,
  matchId: string,
): Promise<{
  matchId: string;
  status: AnalysisResponse["status"];
  confidenceScore?: number;
  error?: string;
}> {
  const response = await fetch(`${API_URL}/api/analyses/${matchId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as {
    matchId: string;
    status: AnalysisResponse["status"];
    confidenceScore?: number;
    error?: string;
  };
}

export async function fetchAnalysisScores(
  token: string,
  matchIds: string[],
): Promise<PrewarmResult[]> {
  const response = await fetch(`${API_URL}/api/analyses/scores`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ matchIds }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { results: PrewarmResult[] };
  return data.results;
}

export async function prewarmAnalyses(
  token: string,
  matchIds: string[],
): Promise<PrewarmResult[]> {
  const response = await fetch(`${API_URL}/api/analyses/prewarm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ matchIds }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { results: PrewarmResult[] };
  return data.results;
}

export async function regenerateAnalysis(
  token: string,
  matchId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/analyses/${matchId}/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export type { MatchAnalysisResult };
