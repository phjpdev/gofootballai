import { TopNav } from "@/components/layout/TopNav";
import { PerformanceChart } from "@/components/charts/PerformanceChart";

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Performance" />
      <section>
        <h2 className="mb-4 text-base font-bold tracking-[-0.048px] text-white">
          Goals Scored{" "}
          <span className="text-gray-40">(Season)</span>
        </h2>
        <div className="lg:max-w-2xl">
          <PerformanceChart />
        </div>
      </section>
      <section className="hidden lg:block">
        <p className="mb-4 text-sm leading-[1.6] text-gray-40">
          Track your team&apos;s goal-scoring performance over time with
          AI-powered insights from GoFootball.ai.
        </p>
      </section>
    </div>
  );
}
