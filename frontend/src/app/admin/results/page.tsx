"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchWinRateStats,
  formatWinRate,
  updateWinRateStats,
} from "@/lib/win-rate-stats-api";

export default function AdminResultsPage() {
  const { isAdmin, isAuthenticated, isLoading, token } = useAuth();
  const [todayWinRate, setTodayWinRate] = useState("0");
  const [totalWinRate, setTotalWinRate] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadStats = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const stats = await fetchWinRateStats(token);
      setTodayWinRate(String(stats.todayWinRate));
      setTotalWinRate(String(stats.totalWinRate));
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

  async function handleSave() {
    if (!token) return;

    const today = Number.parseFloat(todayWinRate);
    const total = Number.parseFloat(totalWinRate);

    if (!Number.isFinite(today) || !Number.isFinite(total)) {
      setError("請輸入有效的勝率數值");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const stats = await updateWinRateStats(token, {
        todayWinRate: today,
        totalWinRate: total,
      });
      setTodayWinRate(String(stats.todayWinRate));
      setTotalWinRate(String(stats.totalWinRate));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法更新勝率資料");
    } finally {
      setSaving(false);
    }
  }

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
            此頁面僅供管理員查看及更新勝率結果。
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
            顯示及更新平台預測勝率統計。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-gray-80 bg-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-40">
              TODAY WIN RATE
            </p>
            <p className="mt-3 text-4xl font-bold tabular-nums text-orange-50">
              {formatWinRate(Number.parseFloat(todayWinRate) || 0)}
            </p>
            <label className="mt-4 block text-xs font-medium text-gray-40">
              更新數值 (%)
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={todayWinRate}
                onChange={(event) => setTodayWinRate(event.target.value)}
                className="mt-2 w-full rounded-[14px] border border-gray-80 bg-gray-90 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-50"
              />
            </label>
          </div>

          <div className="rounded-[20px] border border-gray-80 bg-gray-100 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-40">
              TOTAL WIN RATE
            </p>
            <p className="mt-3 text-4xl font-bold tabular-nums text-blue-40">
              {formatWinRate(Number.parseFloat(totalWinRate) || 0)}
            </p>
            <label className="mt-4 block text-xs font-medium text-gray-40">
              更新數值 (%)
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={totalWinRate}
                onChange={(event) => setTotalWinRate(event.target.value)}
                className="mt-2 w-full rounded-[14px] border border-gray-80 bg-gray-90 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-50"
              />
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
        {saved && !error && (
          <p className="text-sm text-green-300">勝率已更新。</p>
        )}

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full rounded-[19px] bg-orange-50 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-fit"
        >
          {saving ? "儲存中…" : "儲存勝率"}
        </button>
      </section>
    </div>
  );
}
