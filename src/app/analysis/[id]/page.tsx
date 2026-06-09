import { notFound } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import { getMatchById } from "@/lib/data/matches";
import { MapPin, Clock } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MatchAnalysisPage({ params }: Props) {
  const { id } = await params;
  const match = getMatchById(id);

  if (!match) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Match Analysis" showBack />

      <section className="rounded-[24px] bg-gray-90 p-4">
        <h1 className="text-xl font-bold tracking-[-0.1px] text-white">
          {match.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-20">
          <span className="flex items-center gap-1">
            <Clock className="size-4" />
            {match.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-4" />
            {match.venue}
          </span>
          {match.homeScore !== undefined && (
            <span className="rounded-lg bg-gray-80 px-2 py-1 text-xs font-bold text-white">
              {match.homeScore} - {match.awayScore}
            </span>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-white">
          Goals Performance
        </h2>
        <PerformanceChart />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-white">xG Analytics</h2>
        <AnalyticsChart />
      </section>

      <Link
        href="/analysis"
        className="flex h-14 items-center justify-center rounded-[19px] bg-white text-base font-semibold text-gray-100"
      >
        Back to Matches
      </Link>
    </div>
  );
}
