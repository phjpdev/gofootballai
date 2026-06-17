import { RadarChart } from "@/components/analysis/RadarChart";
import type { AnalysisDimensions } from "@/types/analysis";

type ScoreBreakdownProps = {
  dimensions: AnalysisDimensions;
};

export function ScoreBreakdown({ dimensions }: ScoreBreakdownProps) {
  return (
    <section className="relative w-full">
      <div className="relative mx-auto w-[343px]">
        <RadarChart dimensions={dimensions} />
      </div>
    </section>
  );
}
