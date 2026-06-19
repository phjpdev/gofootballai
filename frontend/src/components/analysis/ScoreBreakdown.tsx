import { PredictionPickCard } from "@/components/analysis/PredictionPickCard";
import { RadarChart } from "@/components/analysis/RadarChart";
import { VipContentLock } from "@/components/analysis/VipContentLock";
import type { AnalysisDimensions, AnalysisPick } from "@/types/analysis";

type ScoreBreakdownProps = {
  dimensions: AnalysisDimensions;
  pick: AnalysisPick;
  matchId: string;
  vipLocked?: boolean;
};

export function ScoreBreakdown({
  dimensions,
  pick,
  matchId,
  vipLocked = false,
}: ScoreBreakdownProps) {
  return (
    <section className="relative w-full">
      <div className="flex w-full items-center justify-center gap-2">
        <div className="relative h-[173px] w-[171px] shrink-0 overflow-hidden">
          <div className="origin-top-left scale-50">
            <RadarChart dimensions={dimensions} />
          </div>
        </div>
        <VipContentLock locked={vipLocked} className="min-w-0 flex-1 rounded-2xl">
          <PredictionPickCard pick={pick} matchId={matchId} />
        </VipContentLock>
      </div>
    </section>
  );
}
