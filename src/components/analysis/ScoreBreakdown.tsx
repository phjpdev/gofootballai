import { RadarChart } from "@/components/analysis/RadarChart";

export function ScoreBreakdown() {
  return (
    <section className="relative w-full">
      <div className="relative mx-auto w-[343px]">
        <RadarChart />
      </div>
    </section>
  );
}
