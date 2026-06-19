import Link from "next/link";
import { MatchHeaderCard } from "@/components/analysis/MatchHeaderCard";
import { SandowScoreCard } from "@/components/analysis/SandowScoreCard";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { AthleticSlider } from "@/components/analysis/AthleticSlider";
import { FitnessMetrics } from "@/components/analysis/FitnessMetrics";
import { AnalysisNarrative } from "@/components/analysis/AnalysisNarrative";
import { ActivitiesChart } from "@/components/charts/ActivitiesChart";
import { StepsStatsChart } from "@/components/charts/StepsStatsChart";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { AnalysisMemberGate } from "@/components/analysis/AnalysisLockScreen";
import type { MatchAnalysisResult } from "@/types/analysis";
import type { Match } from "@/types";
import { ChevronLeft, Loader2 } from "lucide-react";

type MatchAnalysisViewProps = {
  match: Match;
  analysis: MatchAnalysisResult | null;
  loading?: boolean;
  pending?: boolean;
  locked?: boolean;
  lockedHint?: string;
  loginRedirectTo?: string;
  error?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
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

function MemberGate({
  hint,
  redirectTo,
}: {
  hint: string;
  redirectTo: string;
}) {
  return <AnalysisMemberGate hint={hint} redirectTo={redirectTo} />;
}

export function MatchAnalysisView({
  match,
  analysis,
  loading = false,
  pending = false,
  locked = false,
  lockedHint = "請登入或註冊會員帳戶，以查看 AI 賽事量化分析。",
  loginRedirectTo = "/analysis",
  error,
  onRetry,
  retrying = false,
}: MatchAnalysisViewProps) {
  const showPending = pending && !analysis;
  const showLoading = loading && !analysis && !locked;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link
          href="/analysis"
          className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          返回賽事分析
        </Link>

        <AnimateIn variant="slide-right" delay={0}>
          <MatchHeaderCard match={match} />
        </AnimateIn>
      </div>

      {locked && (
        <MemberGate hint={lockedHint} redirectTo={loginRedirectTo} />
      )}

      {!locked && showLoading && <AnalysisSkeleton />}

      {!locked && showPending && <PendingState />}

      {!locked && error && !analysis && !showPending && !showLoading && (
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

      {!locked && analysis && (
        <>
          <AnimateIn variant="slide-right" delay={150}>
            <SandowScoreCard score={analysis.confidenceScore} />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={220}>
            <ScoreBreakdown
              dimensions={analysis.dimensions}
              pick={analysis.pick}
            />
          </AnimateIn>

          <AnimateIn variant="slide-right" delay={290}>
            <AthleticSlider
              score={analysis.confidenceScore}
              level={analysis.recommendationLevel}
              label={analysis.recommendationLabel}
              description="球隊具備應對高強度對抗的戰術能力"
              middleContent={
                <AnalysisNarrative
                  narrative={analysis.narrative}
                  riskFlags={analysis.riskFlags}
                />
              }
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
        </>
      )}
    </div>
  );
}
