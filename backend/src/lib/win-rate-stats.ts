import { query } from "./db.js";

export type WinRateStats = {
  todayWinRate: number;
  totalWinRate: number;
  updatedAt: string;
};

type WinRateStatsRow = {
  today_win_rate: string;
  total_win_rate: string;
  updated_at: Date;
};

const DEFAULT_STATS: WinRateStats = {
  todayWinRate: 0,
  totalWinRate: 0,
  updatedAt: new Date(0).toISOString(),
};

function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

function mapRow(row: WinRateStatsRow): WinRateStats {
  return {
    todayWinRate: Number(row.today_win_rate),
    totalWinRate: Number(row.total_win_rate),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function seedWinRateStats(): Promise<void> {
  await query(
    `INSERT INTO win_rate_stats (id, today_win_rate, total_win_rate)
     VALUES ('default', 0, 0)
     ON CONFLICT (id) DO NOTHING`,
  );
}

export async function getWinRateStats(): Promise<WinRateStats> {
  const result = await query<WinRateStatsRow>(
    `SELECT today_win_rate, total_win_rate, updated_at
     FROM win_rate_stats
     WHERE id = 'default'
     LIMIT 1`,
  );

  const row = result.rows[0];
  return row ? mapRow(row) : DEFAULT_STATS;
}

export async function updateWinRateStats(input: {
  todayWinRate: number;
  totalWinRate: number;
}): Promise<WinRateStats> {
  const todayWinRate = clampRate(input.todayWinRate);
  const totalWinRate = clampRate(input.totalWinRate);

  const result = await query<WinRateStatsRow>(
    `INSERT INTO win_rate_stats (id, today_win_rate, total_win_rate)
     VALUES ('default', $1, $2)
     ON CONFLICT (id)
     DO UPDATE SET
       today_win_rate = EXCLUDED.today_win_rate,
       total_win_rate = EXCLUDED.total_win_rate,
       updated_at = NOW()
     RETURNING today_win_rate, total_win_rate, updated_at`,
    [todayWinRate, totalWinRate],
  );

  return mapRow(result.rows[0]);
}
