import type { HkjcDateItem, HkjcMatch } from "@/types/hkjc";
import { getHkjcApiUrl } from "@/lib/hkjc/matches-api";
import { readApiError } from "@/lib/i18n/api-errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const parseError = readApiError;

export async function fetchArchivedDates(token: string): Promise<HkjcDateItem[]> {
  const response = await fetch(`${API_URL}/api/hkjc/archived/dates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { dates: HkjcDateItem[] };
  return data.dates;
}

export async function fetchArchivedMatches(
  token: string,
  dateKey: string,
): Promise<HkjcMatch[]> {
  const response = await fetch(
    `${API_URL}/api/hkjc/archived/matches?date=${encodeURIComponent(dateKey)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { matches: HkjcMatch[] };
  return data.matches;
}

export async function fetchAdminTodayPassedMatches(
  token: string,
): Promise<HkjcMatch[]> {
  const response = await fetch(`${API_URL}/api/hkjc/archived/today-passed`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { matches: HkjcMatch[] };
  return data.matches;
}

export { getHkjcApiUrl };
