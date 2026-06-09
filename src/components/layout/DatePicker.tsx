"use client";

import { cn } from "@/lib/utils";

export type DateItem = {
  day: string;
  date: number;
  active?: boolean;
  hasEvent?: boolean;
};

type DatePickerProps = {
  dates: DateItem[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
};

export function DatePicker({
  dates,
  onSelect,
  selectedIndex = 1,
}: DatePickerProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {dates.map((item, index) => {
        const isActive = index === selectedIndex;
        return (
          <button
            key={`${item.day}-${item.date}`}
            type="button"
            onClick={() => onSelect?.(index)}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center justify-center rounded-[19px] p-2",
              isActive
                ? "bg-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.25)]"
                : "bg-gray-100 shadow-[0_8px_16px_0_rgba(17,18,20,0.05)]",
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium tracking-[-0.018px]",
                  isActive ? "text-white" : "text-gray-40",
                )}
              >
                {item.day}
              </span>
              <span
                className={cn(
                  "text-xl font-bold tracking-[-0.1px]",
                  isActive ? "text-white" : "text-white",
                )}
              >
                {item.date}
              </span>
            </div>
            {item.hasEvent !== false && (
              <span
                className={cn(
                  "mt-2 size-2 rounded-full",
                  isActive ? "bg-white" : "bg-gray-60",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
