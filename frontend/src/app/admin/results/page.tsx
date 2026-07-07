"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchWinRateStats,
  formatWinRate,
  formatWinRateRecord,
  type WinRateStats,
} from "@/lib/win-rate-stats-api";

export default function AdminResultsPage() {
  const { isAdmin, isAuthenticated, isLoading, token } = useAuth();
  const [stats, setStats] = useState<WinRateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const nextStats = await fetchWinRateStats(token);
      setStats(nextStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法載入勝率資料");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !isAdmin || !token) {
      setLoading(false);
      return;
    }
    void loadStats();
  }, [isLoading, isAuthenticated, isAdmin, token, loadStats]);

  if (isLoading || loading) {
    return <div className="h-56 animate-pulse rounded-[24px] bg-gray-90" />;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/member"
          className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          返回會員頁面
        </Link>
        <section className="flex flex-col items-center gap-4 rounded-[24px] bg-gray-90 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-80">
            <Lock className="size-6 text-gray-40" />
          </div>
          <h1 className="text-base font-bold text-white">管理員專用</h1>
          <p className="text-sm leading-[1.6] text-gray-40">
            此頁面僅供管理員查看勝率結果。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/member"
        className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
      >
        <ChevronLeft className="size-4" />
        返回會員頁面
      </Link>

      <section className="flex flex-col gap-5 rounded-[24px] bg-gray-90 p-5 sm:p-6">
        <div>
          <h1 className="text-lg font-bold tracking-[-0.06px] text-white">
            勝率結果
          </h1>
          <p className="mt-1 text-sm text-gray-40">
            根據 AI 生成預測自動計算，僅統計已完場賽事。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-gray-80 bg-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-40">
              TODAY WIN RATE
            </p>
            <p className="mt-3 text-4xl font-bold tabular-nums text-orange-50">
              {formatWinRate(stats?.todayWinRate ?? 0)}
            </p>
            <p className="mt-2 text-sm text-gray-40">
              {formatWinRateRecord(stats?.todayWins, stats?.todaySettled)}
            </p>
          </div>

          <div className="rounded-[20px] border border-gray-80 bg-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-40">
              TOTAL WIN RATE
            </p>
            <p className="mt-3 text-4xl font-bold tabular-nums text-blue-40">
              {formatWinRate(stats?.totalWinRate ?? 0)}
            </p>
            <p className="mt-2 text-sm text-gray-40">
              {formatWinRateRecord(stats?.totalWins, stats?.totalSettled)}
            </p>
          </div>
        </div>

        {stats?.updatedAt && (
          <p className="text-xs text-gray-50">
            最後更新：{new Date(stats.updatedAt).toLocaleString("zh-HK")}
          </p>
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}
      </section>
    </div>
  );
}
