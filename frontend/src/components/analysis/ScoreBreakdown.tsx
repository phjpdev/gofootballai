import { PredictionPickCard } from "@/components/analysis/PredictionPickCard";
import { RadarChart } from "@/components/analysis/RadarChart";
import type { AnalysisDimensions, AnalysisPick } from "@/types/analysis";

type ScoreBreakdownProps = {
  dimensions: AnalysisDimensions;
  pick: AnalysisPick;
};

export function ScoreBreakdown({ dimensions, pick }: ScoreBreakdownProps) {
  return (
    <section className="relative w-full">
      <div className="flex w-full items-center justify-center gap-2">
        <div className="relative h-[173px] w-[171px] shrink-0 overflow-hidden">
          <div className="origin-top-left scale-50">
            <RadarChart dimensions={dimensions} />
          </div>
        </div>
        <PredictionPickCard pick={pick} />
      </div>
    </section>
  );
}
