"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditMatchPickModal } from "@/components/analysis/EditMatchPickModal";
import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAnalysisStatus,
  fetchMatchAnalysis,
  regenerateAnalysis,
} from "@/lib/analyses-api";
import { fetchMatchPickOverride } from "@/lib/match-pick-overrides-api";
import type { AnalysisResponse, MatchAnalysisResult } from "@/types/analysis";
import type { Match } from "@/types";

type MatchAnalysisClientProps = {
  match: Match;
};

const POLL_INTERVAL_MS = 2_500;
const MAX_PENDING_MS = 90_000;

export function MatchAnalysisClient({ match }: MatchAnalysisClientProps) {
  const pathname = usePathname();
  const { token, isAuthenticated, isMember, isAdmin, isLoading, user, canViewVipAnalysis } =
    useAuth();
  const [analysisState, setAnalysisState] = useState<AnalysisResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [pendingSince, setPendingSince] = useState<number | null>(null);
  const [pickOverride, setPickOverride] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const canAccess = isAuthenticated && (isMember || isAdmin);

  const loadPickOverride = useCallback(async () => {
    try {
      const selection = await fetchMatchPickOverride(match.id);
      setPickOverride(selection);
    } catch {
      setPickOverride("");
    }
  }, [match.id]);

  const displayAnalysis = useMemo((): MatchAnalysisResult | null => {
    const base = analysisState?.analysis ?? null;
    if (!base) return null;

    const selection = pickOverride.trim() || base.pick.selection;
    if (selection === base.pick.selection) return base;

    return {
      ...base,
      pick: {
        ...base.pick,
        selection,
      },
    };
  }, [analysisState?.analysis, pickOverride]);

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
    void loadPickOverride();
  }, [loadPickOverride]);

  useEffect(() => {
    if (analysisState?.status === "pending") {
      setPendingSince((prev) => prev ?? Date.now());
      return;
    }
    setPendingSince(null);
  }, [analysisState?.status]);

  useEffect(() => {
    if (!token || !canAccess) return;
    if (analysisState?.status !== "pending") return;

    const interval = window.setInterval(async () => {
      try {
        const status = await fetchAnalysisStatus(token, match.id);
        if (status.status === "completed" || status.status === "failed") {
          await loadAnalysis();
          return;
        }
        if (
          pendingSince &&
          Date.now() - pendingSince > MAX_PENDING_MS
        ) {
          await loadAnalysis();
        }
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [
    token,
    canAccess,
    analysisState?.status,
    match.id,
    loadAnalysis,
    pendingSince,
  ]);

  const timedOut =
    analysisState?.status === "pending" &&
    pendingSince !== null &&
    Date.now() - pendingSince > MAX_PENDING_MS;

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

  const modalPickSelection =
    pickOverride.trim() ||
    analysisState?.analysis?.pick.selection ||
    "";

  return (
    <>
      <MatchAnalysisView
        match={match}
        analysis={displayAnalysis}
        loading={isLoading || (canAccess && loading && !analysisState)}
        pending={analysisState?.status === "pending" && !timedOut}
        locked={!isLoading && !canAccess}
        canViewVipContent={canViewVipAnalysis}
        lockedHint={
          isAuthenticated && user && !canAccess
            ? "此帳戶無法查看會員分析，請使用會員帳戶登入。"
            : "請登入或註冊會員帳戶，以查看 AI 賽事量化分析。"
        }
        loginRedirectTo={pathname}
        error={
          timedOut
            ? "分析逾時，請點擊重新分析"
            : analysisState?.status === "failed"
              ? (error ?? "分析生成失敗，請點擊重新分析")
              : error ?? undefined
        }
        onRetry={handleRetry}
        retrying={retrying}
        showEditPick={isAdmin && Boolean(displayAnalysis)}
        onEditPick={() => setEditModalOpen(true)}
        pickOverridden={Boolean(pickOverride.trim())}
      />

      {isAdmin && token && (
        <EditMatchPickModal
          open={editModalOpen}
          matchId={match.id}
          token={token}
          initialPickSelection={modalPickSelection}
          onClose={() => setEditModalOpen(false)}
          onSaved={setPickOverride}
        />
      )}
    </>
  );
}
