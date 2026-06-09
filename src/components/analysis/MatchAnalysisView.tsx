import { TopNav } from "@/components/layout/TopNav";
import { ScoreBreakdown } from "@/components/analysis/ScoreBreakdown";
import { AthleticSlider } from "@/components/analysis/AthleticSlider";
import { FitnessMetrics } from "@/components/analysis/FitnessMetrics";
import { ActivitiesChart } from "@/components/charts/ActivitiesChart";
import { StepsStatsChart } from "@/components/charts/StepsStatsChart";
import type { Match } from "@/types";
import { Clock, MapPin } from "lucide-react";

type MatchAnalysisViewProps = {
  match: Match;
};

export function MatchAnalysisView({ match }: MatchAnalysisViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <TopNav title="Match Analysis" showBack />

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

      {/* Figma 22455:83934 — Score Breakdown (radar + 61 + legend) */}
      <ScoreBreakdown />

      {/* Figma 22467:87017 — Athletic level slider */}
      <AthleticSlider />

      {/* Figma 22455:83713 — Fitness metrics */}
      <FitnessMetrics />

      {/* Figma 826:119386 — Activities */}
      <ActivitiesChart />

      {/* Figma 214:24997 — Steps stats */}
      <StepsStatsChart />
    </div>
  );
}
