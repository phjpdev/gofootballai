"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { AuthForm } from "@/components/member/AuthForm";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAnalysisStatus,
  fetchMatchAnalysis,
  regenerateAnalysis,
} from "@/lib/analyses-api";
import type { AnalysisResponse } from "@/types/analysis";
import type { Match } from "@/types";

type MatchAnalysisClientProps = {
  match: Match;
};

const POLL_INTERVAL_MS = 2_500;

export function MatchAnalysisClient({ match }: MatchAnalysisClientProps) {
  const pathname = usePathname();
  const { token, isAuthenticated, isMember, isAdmin, isLoading, user } = useAuth();
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

  return (
    <MatchAnalysisView
      match={match}
      analysis={analysisState?.analysis ?? null}
      loading={isLoading || (canAccess && loading && !analysisState)}
      pending={analysisState?.status === "pending"}
      locked={!isLoading && !canAccess}
      lockedHint={
        isAuthenticated && user && !canAccess
          ? "此帳戶無法查看會員分析，請使用會員帳戶登入。"
          : "請登入或註冊會員帳戶，以查看 AI 賽事量化分析。"
      }
      loginRedirectTo={pathname}
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
