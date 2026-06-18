import type { HkjcMatch, HkjcMatchesResponse } from "@/types/hkjc";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getHkjcApiUrl(path: string): string {
  return `${API_URL}/api/hkjc${path}`;
}

export async function fetchHkjcMatchesFromApi(): Promise<HkjcMatchesResponse> {
  const response = await fetch(getHkjcApiUrl("/matches"), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("載入賽事失敗");
  }
  return (await response.json()) as HkjcMatchesResponse;
}

export async function fetchHkjcMatchByIdFromApi(
  id: string,
): Promise<HkjcMatch | null> {
  const response = await fetch(getHkjcApiUrl(`/matches/${encodeURIComponent(id)}`), {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("載入賽事失敗");
  }
  return (await response.json()) as HkjcMatch;
}
