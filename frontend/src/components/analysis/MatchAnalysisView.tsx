import Link from "next/link";
import { SandowScoreCard } from "@/components/analysis/SandowScoreCard";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { AthleticSlider } from "@/components/analysis/AthleticSlider";
import { FitnessMetrics } from "@/components/analysis/FitnessMetrics";
import { AnalysisNarrative } from "@/components/analysis/AnalysisNarrative";
import { ActivitiesChart } from "@/components/charts/ActivitiesChart";
import { StepsStatsChart } from "@/components/charts/StepsStatsChart";
import { AnimateIn } from "@/components/motion/AnimateIn";
import type { MatchAnalysisResult } from "@/types/analysis";
import type { Match } from "@/types";
import { ChevronLeft, Clock, Loader2, MapPin } from "lucide-react";

type MatchAnalysisViewProps = {
  match: Match;
  analysis: MatchAnalysisResult | null;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 animate-pulse rounded-[20px] bg-gray-90" />
      <div className="h-[346px] animate-pulse rounded-[24px] bg-gray-90" />
      <div className="h-32 animate-pulse rounded-[24px] bg-gray-90" />
      <div className="h-48 animate-pulse rounded-[24px] bg-gray-90" />
    </div>
  );
}

function PendingState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] bg-gray-90 py-10">
      <Loader2 className="size-8 animate-spin text-orange-50" />
      <p className="text-sm font-medium text-white">AI 正在量化分析中…</p>
      <p className="text-xs text-gray-40">十四代演算法運算中，通常需 10–30 秒</p>
    </div>
  );
}

export function MatchAnalysisView({
  match,
  analysis,
  loading = false,
  error,
  onRetry,
  retrying = false,
}: MatchAnalysisViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/analysis"
        className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
      >
        <ChevronLeft className="size-4" />
        返回賽事分析
      </Link>

      <AnimateIn variant="slide-right" delay={0}>
        <div className="flex flex-col gap-3">
          <div className="rounded-[24px] bg-gray-90 p-4">
            <h1 className="text-lg font-bold tracking-[-0.072px] text-white">
              {match.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-40">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {match.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {match.venue}
              </span>
              {match.homeScore !== undefined && (
                <span className="rounded-lg bg-gray-80 px-2 py-0.5 text-xs font-bold text-white">
                  {match.homeScore} - {match.awayScore}
                </span>
              )}
            </div>
          </div>
        </div>
      </AnimateIn>

      {loading && !analysis && <PendingState />}

      {error && !analysis && !loading && (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center">
          <p className="text-sm text-red-300">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="mt-3 text-sm font-medium text-orange-50 disabled:opacity-50"
            >
              {retrying ? "重試中…" : "重新分析"}
            </button>
          )}
        </div>
      )}

      {!analysis && loading && <AnalysisSkeleton />}

      {analysis && (
        <>
          <AnimateIn variant="slide-right" delay={150}>
            <SandowScoreCard score={analysis.confidenceScore} />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={220}>
            <ScoreBreakdown dimensions={analysis.dimensions} />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={290}>
            <AthleticSlider
              level={analysis.recommendationLevel}
              label={analysis.recommendationLabel}
              description="球隊具備應對高強度對抗的戰術能力"
            />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={360}>
            <FitnessMetrics
              dimensions={analysis.dimensions}
              goalProbabilities={analysis.goalProbabilities}
              momentum={analysis.momentum}
              roi={analysis.roi}
              pick={analysis.pick}
            />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={430}>
            <ActivitiesChart momentum={analysis.momentum} />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={500}>
            <StepsStatsChart scoreTrend={analysis.scoreTrend} />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={570}>
            <AnalysisNarrative
              narrative={analysis.narrative}
              riskFlags={analysis.riskFlags}
            />
          </AnimateIn>
        </>
      )}
    </div>
  );
}
