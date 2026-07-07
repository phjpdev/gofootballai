const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type WinRateStats = {
  todayWinRate: number;
  totalWinRate: number;
  updatedAt: string;
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

export async function updateWinRateStats(
  token: string,
  input: Pick<WinRateStats, "todayWinRate" | "totalWinRate">,
): Promise<WinRateStats> {
  const response = await fetch(`${API_URL}/api/win-rate-stats`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
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
