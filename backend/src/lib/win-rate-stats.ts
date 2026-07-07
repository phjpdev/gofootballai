import { computeWinRateStats } from "./compute-win-rate.js";

export type WinRateStats = {
  todayWinRate: number;
  totalWinRate: number;
  updatedAt: string;
  todayDateKey: string;
  todayWins?: number;
  todaySettled?: number;
  totalWins?: number;
  totalSettled?: number;
};

export async function getWinRateStats(): Promise<WinRateStats> {
  return computeWinRateStats();
}
