import { Brain, LineChart, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Match Analysis",
    description:
      "Deep learning models analyze every pass, shot, and tactical shift in real time.",
  },
  {
    icon: LineChart,
    title: "Performance Tracking",
    description:
      "xG charts, possession stats, and player ratings updated live during matches.",
  },
  {
    icon: Shield,
    title: "Trusted Insights",
    description:
      "Data-driven predictions and reports used by coaches and analysts worldwide.",
  },
];

export function SystemIntro() {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-[24px] bg-gray-90 p-4">
        <h2 className="text-xl font-bold tracking-[-0.1px] text-white">
          GoFootball.ai
        </h2>
        <p className="mt-2 text-sm leading-[1.6] tracking-[-0.028px] text-gray-20">
          Your AI-powered football intelligence platform. Analyze matches,
          track performance, and stay updated with the latest from your
          favorite leagues.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex gap-3 rounded-[24px] bg-gray-90 p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-orange-50">
              <Icon className="size-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-[-0.048px] text-white">
                {title}
              </h3>
              <p className="mt-1 text-sm leading-[1.6] tracking-[-0.028px] text-gray-40">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
