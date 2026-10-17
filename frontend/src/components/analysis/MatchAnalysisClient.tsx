"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditMatchPickModal } from "@/components/analysis/EditMatchPickModal";
import {
  getMatchTeams,
  type MatchHeaderMatch,
} from "@/components/analysis/MatchHeaderCard";
import {
  MatchAnalysisView,
  type AnalysisLanguageStatus,
} from "@/components/analysis/MatchAnalysisView";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAnalysisStatus,
  fetchMatchAnalysis,
  regenerateAnalysis,
} from "@/lib/analyses-api";
import { fetchMatchPickOverride } from "@/lib/match-pick-overrides-api";
import { flipOverUnderPickSelection } from "@/lib/analysis-pick-display";
import { localizeApiError } from "@/lib/i18n/api-errors";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { PickContext } from "@/lib/i18n/localized";
import type { AnalysisResponse, MatchAnalysisResult } from "@/types/analysis";

type MatchAnalysisClientProps = {
  match: MatchHeaderMatch;
};

/** Kept as a kind (not text) so it re-renders in the right language after a toggle. */
type AnalysisError =
  | { kind: "failed" }
  | { kind: "loadFailed" }
  | { kind: "retryFailed" }
  | { kind: "message"; message: string };

const POLL_INTERVAL_MS = 2_500;
const MAX_PENDING_MS = 90_000;

export function MatchAnalysisClient({ match }: MatchAnalysisClientProps) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const { token, isAuthenticated, isMember, isAdmin, isLoading, user, canViewVipAnalysis } =
    useAuth();
  const [analysisState, setAnalysisState] = useState<AnalysisResponse | null>(
    null,
  );
  /** Language the shown analysis text is actually in. */
  const [analysisLanguage, setAnalysisLanguage] = useState<Locale | null>(null);
  /** Locale of the last finished request (success or failure). */
  const [settledLocale, setSettledLocale] = useState<Locale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [pendingSince, setPendingSince] = useState<number | null>(null);
  const [pickOverride, setPickOverride] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const latestRequest = useRef(0);

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

    return {
      ...base,
      pick: {
        ...base.pick,
        selection: flipOverUnderPickSelection(selection),
      },
    };
  }, [analysisState?.analysis, pickOverride]);

  const pickContext = useMemo((): PickContext => {
    const pick = analysisState?.analysis?.pick;
    // The AI's English wording only describes its own pick, un-overridden and un-flipped.
    const isOriginalPick =
      pick !== undefined &&
      !pickOverride.trim() &&
      flipOverUnderPickSelection(pick.selection) === pick.selection;
    return {
      ...getMatchTeams(match),
      fallbackEn: isOriginalPick ? pick.selectionEn : undefined,
    };
  }, [analysisState?.analysis, pickOverride, match]);

  const loadAnalysis = useCallback(async () => {
    if (!token || !canAccess) return;

    const requestId = ++latestRequest.current;
    try {
      const data = await fetchMatchAnalysis(token, match.id, locale);
      // A language toggle or a newer poll superseded this request.
      if (requestId !== latestRequest.current) return;
      setAnalysisState(data);
      // Older backends omit `language`; assume the requested one.
      setAnalysisLanguage(data.language ?? locale);
      setError(
        data.status === "failed"
          ? { kind: "failed" }
          : data.error
            ? { kind: "message", message: localizeApiError(data.error, locale) }
            : null,
      );
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(
        err instanceof Error
          ? { kind: "message", message: err.message }
          : { kind: "loadFailed" },
      );
    } finally {
      if (requestId === latestRequest.current) {
        setSettledLocale(locale);
        setLoading(false);
      }
    }
  }, [token, canAccess, match.id, locale]);

  // Also re-runs when the locale changes, refetching the analysis in that language.
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
      setError(
        err instanceof Error
          ? { kind: "message", message: err.message }
          : { kind: "retryFailed" },
      );
    } finally {
      setRetrying(false);
    }
  };

  const modalPickSelection =
    pickOverride.trim() ||
    analysisState?.analysis?.pick.selection ||
    "";

  const errorText = (value: AnalysisError | null): string | undefined => {
    if (!value) return undefined;
    if (value.kind === "message") return value.message;
    return t.matchDetail.errors[value.kind];
  };

  let languageStatus: AnalysisLanguageStatus = null;
  if (displayAnalysis) {
    if (settledLocale !== locale) {
      languageStatus = "switching";
    } else if (locale === "en" && analysisLanguage === "zh-HK") {
      languageStatus = "untranslated";
    }
  }

  return (
    <>
      <MatchAnalysisView
        match={match}
        analysis={displayAnalysis}
        pickContext={pickContext}
        languageStatus={languageStatus}
        loading={isLoading || (canAccess && loading && !analysisState)}
        pending={analysisState?.status === "pending" && !timedOut}
        locked={!isLoading && !canAccess}
        canViewVipContent={canViewVipAnalysis}
        lockedHint={
          isAuthenticated && user && !canAccess
            ? t.matchDetail.lockedHint.notMember
            : t.matchDetail.lockedHint.default
        }
        loginRedirectTo={pathname}
        error={
          timedOut
            ? t.matchDetail.errors.timedOut
            : analysisState?.status === "failed"
              ? (errorText(error) ?? t.matchDetail.errors.failed)
              : errorText(error)
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
          pickContext={getMatchTeams(match)}
          onClose={() => setEditModalOpen(false)}
          onSaved={setPickOverride}
        />
      )}
    </>
  );
}
