"use client";

import { TabGroup } from "@/components/ui/TabGroup";

const Y_LABELS = ["1,000", "900", "800", "700", "600", "500"];
const X_LABELS = ["11:00", "12:00", "13:00", "14:00", "15:00"];

export function StepsStatsChart() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.3px] text-white">
        Steps Stats
      </h2>
      <div className="w-full rounded-[32px] bg-gray-90 p-4">
        <div className="flex flex-col gap-4">
          <TabGroup variant="darker" />

          <div className="relative h-[218px] w-full">
            <div className="absolute inset-0 flex flex-col justify-between pb-5">
              {Y_LABELS.map((label) => (
                <div key={label} className="flex w-full items-center gap-1">
                  <span className="text-[10px] font-medium tracking-[-0.01px] text-gray-60 whitespace-nowrap">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-gray-80" />
                </div>
              ))}
            </div>

            <svg
              className="absolute left-[23px] top-4 h-[174px] w-[calc(100%-23px)]"
              viewBox="0 0 288 174"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="stepsBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="stepsOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 120 C30 100, 60 80, 100 90 C140 100, 180 60, 220 70 C250 78, 270 50, 288 40 L288 174 L0 174 Z"
                fill="url(#stepsOrangeGrad)"
              />
              <path
                d="M0 120 C30 100, 60 80, 100 90 C140 100, 180 60, 220 70 C250 78, 270 50, 288 40"
                stroke="#F97316"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M0 140 C30 130, 60 110, 100 100 C140 90, 180 80, 220 60 C250 45, 270 35, 288 25 L288 174 L0 174 Z"
                fill="url(#stepsBlueGrad)"
              />
              <path
                d="M0 140 C30 130, 60 110, 100 100 C140 90, 180 80, 220 60 C250 45, 270 35, 288 25"
                stroke="#2563EB"
                strokeWidth="2"
                fill="none"
              />
              <line
                x1="168"
                y1="16"
                x2="168"
                y2="136"
                stroke="#676C75"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>

            <div className="absolute left-[54%] top-[21px] flex flex-col items-center">
              <div className="rounded-[11px] bg-orange-50 px-3 py-2">
                <span className="text-xs font-bold tracking-[-0.018px] text-white">
                  825
                </span>
              </div>
              <div className="size-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-orange-50" />
            </div>

            <div className="absolute bottom-0 left-[19px] flex w-[calc(100%-19px)] justify-between text-[10px] font-medium tracking-[-0.01px] text-gray-60">
              {X_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-end">
              <span className="text-[36px] font-bold leading-[44px] tracking-[-0.432px] text-white">
                1,187
              </span>
              <span className="mb-1 ml-0 text-lg font-medium tracking-[-0.072px] text-gray-40">
                Total
              </span>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-orange-50" />
                <span className="text-xs font-medium tracking-[-0.018px] text-white">
                  Current
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-blue-60" />
                <span className="text-xs font-medium tracking-[-0.018px] text-white">
                  Previous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
