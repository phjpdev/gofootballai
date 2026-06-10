"use client";

import { cn } from "@/lib/utils";

const TABS = ["1d", "1w", "1m", "1y", "all"] as const;
type TabKey = (typeof TABS)[number];

const TAB_LABEL: Record<TabKey, string> = {
  "1d": "1日",
  "1w": "1週",
  "1m": "1月",
  "1y": "1年",
  all: "全部",
};

type TabGroupProps = {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  variant?: "dark" | "darker";
  className?: string;
};

export function TabGroup({
  activeTab = "1d",
  onTabChange,
  variant = "dark",
  className,
}: TabGroupProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start rounded-[14px] p-1",
        variant === "darker" ? "bg-gray-100" : "bg-gray-80",
        className,
      )}
    >
      {TABS.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange?.(tab)}
            className={cn(
              "flex h-8 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[10px] px-2.5 py-2",
              isActive && "bg-gray-60 shadow-[0_0_0_4px_rgba(129,133,141,0.25)]",
            )}
          >
            <span
              className={cn(
                "text-xs font-bold tracking-[-0.018px] whitespace-nowrap",
                isActive ? "text-white" : "text-gray-40",
              )}
            >
              {TAB_LABEL[tab]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
