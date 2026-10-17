"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { MatchHeaderCard } from "@/components/analysis/MatchHeaderCard";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { useAuth } from "@/context/AuthContext";
import { hasPreviewOverrides, type TopMatchPreviewSlot } from "@/lib/data/top-match-previews";
import { fetchMatchAnalysis } from "@/lib/analyses-api";
import { getMatchById } from "@/lib/data/matches";
import { hkjcMatchToLegacy } from "@/lib/hkjc/fetch-matches";
import { fetchHkjcMatchByIdFromApi } from "@/lib/hkjc/matches-api";
import { flipOverUnderPickSelection } from "@/lib/analysis-pick-display";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { PickContext } from "@/lib/i18n/localized";
import type { MatchAnalysisResult } from "@/types/analysis";
import type { Match } from "@/types";

/** Key into `t.analysis.topPreview`, resolved at render so it follows the locale. */
type PreviewError =
  | "matchNotFound"
  | "analysisPending"
  | "noAnalysis"
  | "analysisFailed";

type TopMatchPreviewCardProps = {
  matchId: string;
  slot?: TopMatchPreviewSlot;
  delay?: number;
};

async function loadMatch(
  matchId: string,
  locale: Locale,
): Promise<Match | null> {
  try {
    const hkjcMatch = await fetchHkjcMatchByIdFromApi(matchId);
    if (hkjcMatch) {
      return hkjcMatchToLegacy(hkjcMatch);
    }
  } catch {
    // fall through to static data
  }

  return getMatchById(matchId, locale) ?? null;
}

/**
 * English name for one side: the slot's English override, else the HKJC
 * English name while the slot's Chinese name is still this match's team.
 * Otherwise leave it empty so the slot's Chinese name is resolved/shown as is.
 */
function previewTeamEn(
  overrideZh: string,
  overrideEn: string | undefined,
  matchZh: string | undefined,
  matchEn: string | undefined,
): string | undefined {
  const english = overrideEn?.trim();
  if (english) return english;
  const chinese = overrideZh.trim();
  if (!chinese || chinese === matchZh?.trim()) return matchEn;
  return undefined;
}

export function TopMatchPreviewCard({
  matchId,
  slot,
  delay = 0,
}: TopMatchPreviewCardProps) {
  const { token, canViewVipAnalysis } = useAuth();
  const { locale, t } = useI18n();
  const [match, setMatch] = useState<Match | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PreviewError | null>(null);

  const overrides = slot && hasPreviewOverrides(slot) ? slot : undefined;

  const displayMatch = useMemo(() => {
    if (!match || !overrides) return match;
    return {
      ...match,
      homeTeam: overrides.homeTeam || match.homeTeam,
      awayTeam: overrides.awayTeam || match.awayTeam,
      homeTeamEn: previewTeamEn(
        overrides.homeTeam,
        overrides.homeTeamEn,
        match.homeTeam,
        match.homeTeamEn,
      ),
      awayTeamEn: previewTeamEn(
        overrides.awayTeam,
        overrides.awayTeamEn,
        match.awayTeam,
        match.awayTeamEn,
      ),
      // Chinese data title (split on "對" by consumers); display text comes from the team fields.
      title: `${overrides.homeTeam || match.homeTeam} 對 ${overrides.awayTeam || match.awayTeam}`,
    };
  }, [match, overrides]);

  const displayPick = useMemo(() => {
    const pick = !analysis
      ? undefined
      : overrides?.pickSelection
        ? { ...analysis.pick, selection: overrides.pickSelection }
        : analysis.pick;
    if (!pick) return undefined;
    return {
      ...pick,
      selection: flipOverUnderPickSelection(pick.selection),
    };
  }, [analysis, overrides]);

  // The pick stays Chinese; PredictionPickCard translates it with this context.
  const pickContext = useMemo((): PickContext | undefined => {
    if (!displayMatch || !analysis) return undefined;
    const slotPick = Boolean(overrides?.pickSelection);
    // The AI's English wording only describes its own, untouched pick.
    const isOriginalPick =
      !slotPick &&
      flipOverUnderPickSelection(analysis.pick.selection) ===
        analysis.pick.selection;
    return {
      homeTeam: displayMatch.homeTeam,
      awayTeam: displayMatch.awayTeam,
      homeTeamEn: displayMatch.homeTeamEn,
      awayTeamEn: displayMatch.awayTeamEn,
      fallbackEn: slotPick
        ? overrides?.pickSelectionEn
        : isOriginalPick
          ? analysis.pick.selectionEn
          : undefined,
    };
  }, [displayMatch, analysis, overrides]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const loadedMatch = await loadMatch(matchId, locale);
        if (cancelled) return;

        if (!loadedMatch) {
          setError("matchNotFound");
          return;
        }

        setMatch(loadedMatch);

        if (!token) return;

        const response = await fetchMatchAnalysis(token, matchId, locale);
        if (cancelled) return;

        if (response.analysis) {
          setAnalysis(response.analysis);
        } else if (response.status === "pending") {
          setError("analysisPending");
        } else {
          setError("noAnalysis");
        }
      } catch {
        if (!cancelled) {
          setError("analysisFailed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [matchId, token, locale]);

  return (
    <AnimateIn variant="slide-right" delay={delay}>
      <Link
        href={`/analysis/${matchId}`}
        className="block rounded-[24px] border border-gray-80 bg-gray-90 p-4 transition-colors hover:border-gray-70"
      >
        {loading && (
          <div className="flex flex-col gap-4">
            <div className="h-[140px] animate-pulse rounded-[20px] bg-gray-80" />
            <div className="h-[180px] animate-pulse rounded-[20px] bg-gray-80" />
          </div>
        )}

        {!loading && error && (
          <p className="py-8 text-center text-sm text-gray-40">
            {t.analysis.topPreview[error]}
          </p>
        )}

        {!loading && displayMatch && analysis && displayPick && (
          <div className="flex flex-col gap-4">
            <MatchHeaderCard match={displayMatch} showMeta={false} />
            <ScoreBreakdown
              dimensions={analysis.dimensions}
              pick={displayPick}
              pickContext={pickContext}
              matchId={displayMatch.id}
              vipLocked={!canViewVipAnalysis && !overrides?.pickSelection}
            />
          </div>
        )}

        {!loading && match && !analysis && !error && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="size-6 animate-spin text-orange-50" />
            <p className="text-sm text-gray-40">{t.analysis.topPreview.analysing}</p>
          </div>
        )}
      </Link>
    </AnimateIn>
  );
}
