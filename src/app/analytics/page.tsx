import { TopNav } from "@/components/layout/TopNav";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Analytics" />
      <section>
        <h2 className="mb-4 text-base font-bold tracking-[-0.048px] text-white">
          Match xG{" "}
          <span className="text-gray-40">(Live)</span>
        </h2>
        <div className="lg:max-w-2xl">
          <AnalyticsChart />
        </div>
      </section>
      <section className="hidden lg:block">
        <p className="text-sm leading-[1.6] text-gray-40">
          Compare current vs previous match expected goals (xG) with real-time
          analytics powered by AI.
        </p>
      </section>
    </div>
  );
}
