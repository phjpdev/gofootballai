"use client";

import { ArrowRight, Check, Dumbbell, Flame, Timer } from "lucide-react";
import Link from "next/link";

type StatColumnProps = {
  icon: React.ReactNode;
  value: string;
  unit: string;
  bgColor: string;
  fillColor: string;
  fillHeight: string;
};

function StatColumn({
  icon,
  value,
  unit,
  bgColor,
  fillColor,
  fillHeight,
}: StatColumnProps) {
  const isLight = fillColor === "#D7D8D9";

  return (
    <div
      className="relative h-[294px] w-[109px] shrink-0 rounded-[24px]"
      style={{ backgroundColor: bgColor }}
    >
      <div className="absolute left-1/2 top-4 -translate-x-1/2">{icon}</div>
      <div
        className="absolute bottom-0 left-0 flex w-full flex-col items-center justify-center rounded-[24px] p-4"
        style={{ backgroundColor: fillColor, height: fillHeight }}
      >
        <p
          className={`w-full text-center text-[30px] font-bold leading-[38px] tracking-[-0.3px] ${isLight ? "text-gray-100" : "text-white"}`}
        >
          {value}
        </p>
        <p
          className={`w-full text-center text-base font-medium tracking-[-0.048px] ${isLight ? "text-gray-100" : "text-white"}`}
        >
          {unit}
        </p>
      </div>
    </div>
  );
}

export function MatchComplete() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[375px] overflow-hidden rounded-[40px] bg-gray-100 lg:my-8 lg:min-h-[812px] lg:shadow-2xl">
      <div className="flex flex-col items-center gap-8 px-4 pt-[113px]">
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.3px] text-white">
            賽事分析
            <br />
            完成！
          </h1>
          <p className="text-base leading-[1.6] tracking-[-0.048px] text-gray-20">
            AI 評分 +8 已加入。
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="flex gap-2">
            <StatColumn
              icon={<Timer className="size-6 text-gray-30" strokeWidth={2} />}
              value="90"
              unit="分鐘"
              bgColor="#24262B"
              fillColor="#D7D8D9"
              fillHeight="93px"
            />
            <StatColumn
              icon={<Flame className="size-6 text-blue-40" strokeWidth={2} />}
              value="3"
              unit="入球"
              bgColor="#1E3A8A"
              fillColor="#2563EB"
              fillHeight="157px"
            />
            <StatColumn
              icon={<Dumbbell className="size-6 text-orange-30" strokeWidth={2} />}
              value="68"
              unit="% 控球"
              bgColor="#7C2D12"
              fillColor="#F97316"
              fillHeight="228px"
            />
          </div>

          <div className="w-full rounded-[24px] bg-gray-90 p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-bold tracking-[-0.072px] text-white">
                  更多 AI 洞察
                </p>
                <p className="text-sm leading-[1.6] tracking-[-0.028px] text-gray-40">
                  另有 12 項建議
                </p>
              </div>
              <button
                type="button"
                aria-label="查看建議"
                className="flex size-16 shrink-0 items-center justify-center rounded-[21px] bg-orange-50"
              >
                <ArrowRight className="size-6 text-white" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <Link
            href="/analysis"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-[19px] bg-white px-7 py-4"
          >
            <span className="text-base font-semibold tracking-[-0.048px] text-gray-100">
              好的，謝謝！
            </span>
            <Check className="size-6 text-gray-100" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
