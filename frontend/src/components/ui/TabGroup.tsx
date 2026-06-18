"use client";

import { cn } from "@/lib/utils";

const PERIOD_TABS = ["1d", "1w", "1m", "1y", "all"] as const;
type PeriodTabKey = (typeof PERIOD_TABS)[number];

const PERIOD_TAB_LABEL: Record<PeriodTabKey, string> = {
  "1d": "1日",
  "1w": "1週",
  "1m": "1月",
  "1y": "1年",
  all: "全部",
};

const MATCH_MINUTE_TABS = ["15", "30", "45", "60", "75", "90"] as const;
type MatchMinuteTabKey = (typeof MATCH_MINUTE_TABS)[number];

const MATCH_MINUTE_TAB_LABEL: Record<MatchMinuteTabKey, string> = {
  "15": "15'",
  "30": "30'",
  "45": "45'",
  "60": "60'",
  "75": "75'",
  "90": "90'",
};

type TabGroupProps = {
  preset?: "period" | "matchMinutes";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  variant?: "dark" | "darker";
  className?: string;
};

export function TabGroup({
  preset = "period",
  activeTab,
  onTabChange,
  variant = "dark",
  className,
}: TabGroupProps) {
  const isMatchMinutes = preset === "matchMinutes";
  const tabs = isMatchMinutes ? MATCH_MINUTE_TABS : PERIOD_TABS;
  const defaultActive = isMatchMinutes ? "15" : "1d";
  const resolvedActive = activeTab ?? defaultActive;

  return (
    <div
      className={cn(
        "flex w-full items-start rounded-[14px] p-1",
        variant === "darker" ? "bg-gray-100" : "bg-gray-80",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab === resolvedActive;
        const label = isMatchMinutes
          ? MATCH_MINUTE_TAB_LABEL[tab as MatchMinuteTabKey]
          : PERIOD_TAB_LABEL[tab as PeriodTabKey];

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange?.(tab)}
            className={cn(
              "flex h-8 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[10px] py-2",
              isMatchMinutes ? "px-1" : "px-2.5",
              isActive && "bg-gray-60 shadow-[0_0_0_4px_rgba(129,133,141,0.25)]",
            )}
          >
            <span
              className={cn(
                "font-bold tracking-[-0.018px] whitespace-nowrap",
                isMatchMinutes ? "text-[10px]" : "text-xs",
                isActive ? "text-white" : "text-gray-40",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
