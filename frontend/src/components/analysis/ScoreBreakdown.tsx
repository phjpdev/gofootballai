import { PredictionPickCard } from "@/components/analysis/PredictionPickCard";
import { RadarChart } from "@/components/analysis/RadarChart";
import { VipContentLock } from "@/components/analysis/VipContentLock";
import type { PickContext } from "@/lib/i18n/localized";
import type { AnalysisDimensions, AnalysisPick } from "@/types/analysis";

type ScoreBreakdownProps = {
  dimensions: AnalysisDimensions;
  /** `selection` stays Chinese; it is translated for display with `pickContext`. */
  pick: AnalysisPick;
  /** Team names (and the AI's English wording, if it applies) for the English pick. */
  pickContext?: PickContext;
  matchId: string;
  vipLocked?: boolean;
};

export function ScoreBreakdown({
  dimensions,
  pick,
  pickContext,
  matchId,
  vipLocked = false,
}: ScoreBreakdownProps) {
  return (
    <section className="relative w-full">
      <div className="flex w-full items-center justify-center gap-2 lg:grid lg:grid-cols-[minmax(0,343px)_1fr] lg:items-stretch lg:justify-start lg:gap-6">
        <div className="relative h-[173px] w-[171px] shrink-0 overflow-hidden lg:h-auto lg:w-auto lg:overflow-visible">
          <div className="origin-top-left scale-50 lg:origin-top-left lg:scale-100">
            <RadarChart dimensions={dimensions} />
          </div>
        </div>
        <VipContentLock
          locked={vipLocked}
          size="compact"
          className="min-w-0 flex-1 rounded-2xl lg:flex"
        >
          <PredictionPickCard
            pick={pick}
            pickContext={pickContext}
            matchId={matchId}
          />
        </VipContentLock>
      </div>
    </section>
  );
}
