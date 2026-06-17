"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAnalysisStatus,
  fetchMatchAnalysis,
  regenerateAnalysis,
} from "@/lib/analyses-api";
import type { AnalysisResponse } from "@/types/analysis";
import type { Match } from "@/types";
import { Lock, Loader2 } from "lucide-react";

type MatchAnalysisClientProps = {
  match: Match;
};

const POLL_INTERVAL_MS = 1000;

export function MatchAnalysisClient({ match }: MatchAnalysisClientProps) {
  const { token, isAuthenticated, isMember, isAdmin, isLoading } = useAuth();
  const [analysisState, setAnalysisState] = useState<AnalysisResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const canAccess = isAuthenticated && (isMember || isAdmin);

  const loadAnalysis = useCallback(async () => {
    if (!token || !canAccess) return;

    try {
      const data = await fetchMatchAnalysis(token, match.id);
      setAnalysisState(data);
      setError(
        data.status === "failed"
          ? "分析生成失敗，請點擊重新分析"
          : (data.error ?? null),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "無法載入分析");
    } finally {
      setLoading(false);
    }
  }, [token, canAccess, match.id]);

  useEffect(() => {
    if (isLoading) return;
    if (!canAccess) {
      setLoading(false);
      return;
    }
    void loadAnalysis();
  }, [isLoading, canAccess, loadAnalysis]);

  useEffect(() => {
    if (!token || !canAccess) return;
    if (analysisState?.status !== "pending") return;

    const interval = window.setInterval(async () => {
      try {
        const status = await fetchAnalysisStatus(token, match.id);
        if (status.status === "completed" || status.status === "failed") {
          await loadAnalysis();
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [token, canAccess, analysisState?.status, match.id, loadAnalysis]);

  const handleRetry = async () => {
    if (!token) return;
    setRetrying(true);
    setError(null);
    setAnalysisState({ matchId: match.id, status: "pending", analysis: null });
    try {
      await regenerateAnalysis(token, match.id);
      await loadAnalysis();
    } catch (err) {
      setError(err instanceof Error ? err.message : "重試失敗");
    } finally {
      setRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-[24px] bg-gray-90" />
        <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-[24px] bg-gray-90 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-gray-80">
          <Lock className="size-6 text-gray-40" />
        </div>
        <h2 className="text-base font-bold text-white">會員專屬分析</h2>
        <p className="text-sm leading-[1.6] text-gray-40">
          請先登入或註冊會員帳戶，以查看 AI 賽事量化分析。
        </p>
        <Link
          href="/member"
          className="rounded-[19px] bg-orange-50 px-6 py-3 text-sm font-semibold text-white"
        >
          前往會員頁面
        </Link>
      </section>
    );
  }

  if (loading && !analysisState) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="size-8 animate-spin text-orange-50" />
        <p className="text-sm text-gray-40">正在載入 AI 分析…</p>
      </div>
    );
  }

  return (
    <MatchAnalysisView
      match={match}
      analysis={analysisState?.analysis ?? null}
      loading={analysisState?.status === "pending"}
      error={
        analysisState?.status === "failed"
          ? (error ?? "分析生成失敗，請點擊重新分析")
          : error ?? undefined
      }
      onRetry={handleRetry}
      retrying={retrying}
    />
  );
}
