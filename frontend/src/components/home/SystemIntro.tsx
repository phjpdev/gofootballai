import { Brain, LineChart, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI 賽事分析",
    description:
      "深度學習模型即時拆解每一腳傳球、射門與戰術變化，掌握 2026 世界盃每場對決。",
  },
  {
    icon: LineChart,
    title: "數據追蹤",
    description:
      "xG 圖表、控球率、球員評分及進攻威脅指數，賽事中即時更新。",
  },
  {
    icon: Shield,
    title: "專業預測",
    description:
      "結合歷史數據與 AI 模型，為香港球迷提供可靠的賽果參考與戰術洞察。",
  },
];

export function SystemIntro() {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-[24px] bg-gray-90 p-4">
        <h2 className="text-xl font-bold tracking-[-0.1px] text-white">
          2026 世界盃 AI 分析平台
        </h2>
        <p className="mt-2 text-sm leading-[1.6] tracking-[-0.028px] text-gray-20">
          專為香港球迷而設，一站式掌握世界盃賽程、AI 戰術分析、球隊數據及最新會員資訊。
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
