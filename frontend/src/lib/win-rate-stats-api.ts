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

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

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
): string {
  if (!settled || settled <= 0) {
    if (dateKey) {
      return `${formatHkDateLabel(dateKey)} · 尚無已結算預測`;
    }
    return "尚無已結算預測";
  }
  return `${wins ?? 0} / ${settled}`;
}

export function formatHkDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("zh-HK", {
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Hong_Kong",
  });
}
