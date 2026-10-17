import { readApiError } from "@/lib/i18n/api-errors";
import { DEFAULT_LOCALE, INTL_LOCALE, type Locale } from "@/lib/i18n/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type WinRateStats = {
  todayWinRate: number;
  totalWinRate: number;
  updatedAt: string;
  todayDateKey?: string;
  todayWins?: number;
  todaySettled?: number;
  totalWins?: number;
  totalSettled?: number;
};

const parseError = readApiError;

export async function fetchWinRateStats(token: string): Promise<WinRateStats> {
  const response = await fetch(`${API_URL}/api/win-rate-stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as WinRateStats;
}

export function formatWinRate(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

export function formatWinRateRecord(
  wins: number | undefined,
  settled: number | undefined,
  dateKey?: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!settled || settled <= 0) {
    const none = locale === "en" ? "No settled picks yet" : "尚無已結算預測";
    if (dateKey) {
      return `${formatHkDateLabel(dateKey, locale)} · ${none}`;
    }
    return none;
  }
  return `${wins ?? 0} / ${settled}`;
}

export function formatHkDateLabel(
  dateKey: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString(INTL_LOCALE[locale], {
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Hong_Kong",
  });
}
