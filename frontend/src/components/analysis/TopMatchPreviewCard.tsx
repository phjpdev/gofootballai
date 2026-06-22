"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { MatchHeaderCard } from "@/components/analysis/MatchHeaderCard";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { useAuth } from "@/context/AuthContext";
import { fetchMatchAnalysis } from "@/lib/analyses-api";
import { getMatchById } from "@/lib/data/matches";
import { hkjcMatchToLegacy } from "@/lib/hkjc/fetch-matches";
import { fetchHkjcMatchByIdFromApi } from "@/lib/hkjc/matches-api";
import type { MatchAnalysisResult } from "@/types/analysis";
import type { Match } from "@/types";

type TopMatchPreviewCardProps = {
  matchId: string;
  delay?: number;
};

async function loadMatch(matchId: string): Promise<Match | null> {
  try {
    const hkjcMatch = await fetchHkjcMatchByIdFromApi(matchId);
    if (hkjcMatch) {
      return hkjcMatchToLegacy(hkjcMatch);
    }
  } catch {
    // fall through to static data
  }

  return getMatchById(matchId) ?? null;
}

export function TopMatchPreviewCard({
  matchId,
  delay = 0,
}: TopMatchPreviewCardProps) {
  const { token, canViewVipAnalysis } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const loadedMatch = await loadMatch(matchId);
        if (cancelled) return;

        if (!loadedMatch) {
          setError("找不到賽事資料");
          return;
        }

        setMatch(loadedMatch);

        if (!token) return;

        const response = await fetchMatchAnalysis(token, matchId);
        if (cancelled) return;

        if (response.analysis) {
          setAnalysis(response.analysis);
        } else if (response.status === "pending") {
          setError("AI 分析生成中");
        } else {
          setError("暫無分析資料");
        }
      } catch {
        if (!cancelled) {
          setError("無法載入分析");
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
  }, [matchId, token]);

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
          <p className="py-8 text-center text-sm text-gray-40">{error}</p>
        )}

        {!loading && match && analysis && (
          <div className="flex flex-col gap-4">
            <MatchHeaderCard match={match} showMeta={false} />
            <ScoreBreakdown
              dimensions={analysis.dimensions}
              pick={analysis.pick}
              matchId={match.id}
              vipLocked={!canViewVipAnalysis}
            />
          </div>
        )}

        {!loading && match && !analysis && !error && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="size-6 animate-spin text-orange-50" />
            <p className="text-sm text-gray-40">AI 正在量化分析中…</p>
          </div>
        )}
      </Link>
    </AnimateIn>
  );
}
