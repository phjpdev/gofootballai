"use client";

import { ArrowRight, Clock, Lightbulb } from "lucide-react";
import { TabGroup } from "@/components/ui/TabGroup";

const GRID_LINES = ["900", "800", "700", "600", "500"];

export function PerformanceChart() {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[32px] bg-gray-90 p-4">
      <TabGroup variant="dark" />

      <div className="relative h-[140px] w-full">
        <div className="absolute inset-0 flex flex-col justify-between">
          {GRID_LINES.map((label) => (
            <div key={label} className="flex w-full items-center gap-1">
              <span className="w-5 text-[10px] font-medium tracking-[-0.01px] text-gray-70">
                {label}
              </span>
              <div className="h-px flex-1 bg-gray-80" />
            </div>
          ))}
        </div>

        <svg
          className="absolute left-6 top-0.5 h-[131px] w-[calc(100%-24px)]"
          viewBox="0 0 287 131"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 120 C40 110, 80 90, 120 70 C160 50, 200 40, 287 30 L287 131 L0 131 Z"
            fill="url(#perfGrad)"
          />
          <path
            d="M0 120 C40 110, 80 90, 120 70 C160 50, 200 40, 287 30"
            stroke="#F97316"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        <div className="absolute left-[64%] top-[35px] flex flex-col items-center gap-1">
          <div className="rounded-[11px] bg-orange-50 px-3 py-2">
            <span className="text-xs font-bold tracking-[-0.018px] text-white">
              880
            </span>
          </div>
          <div className="size-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-orange-50" />
          <div className="size-4 rounded-full border-2 border-orange-50 bg-gray-90" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[30px] font-bold leading-[38px] tracking-[-0.3px] text-white">
            24 Goals
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Clock className="size-5 text-gray-20" strokeWidth={2} />
              <span className="text-sm font-medium tracking-[-0.028px] text-gray-20">
                +5
              </span>
            </div>
            <span className="size-1 rounded-full bg-gray-40" />
            <div className="flex items-center gap-1">
              <Lightbulb className="size-5 text-gray-20" strokeWidth={2} />
              <span className="text-sm font-medium tracking-[-0.028px] text-gray-20">
                8 AI Insights
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="View details"
          className="flex size-14 shrink-0 items-center justify-center rounded-[19px] bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
        >
          <ArrowRight className="size-6 text-gray-100" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
