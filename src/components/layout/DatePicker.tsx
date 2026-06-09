"use client";

import { cn } from "@/lib/utils";

export type DateItem = {
  day: string;
  date: number | string;
  active?: boolean;
  hasEvent?: boolean;
};

type DatePickerProps = {
  dates: DateItem[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
  showAll?: boolean;
};

export function DatePicker({
  dates,
  onSelect,
  selectedIndex = 1,
  showAll = false,
}: DatePickerProps) {
  const allActive = showAll && selectedIndex === 0;

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {showAll && (
        <button
          type="button"
          onClick={() => onSelect?.(0)}
          className={cn(
            "flex w-14 shrink-0 flex-col items-center justify-center rounded-[19px] p-2",
            allActive
              ? "bg-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.25)]"
              : "bg-gray-100 shadow-[0_8px_16px_0_rgba(17,18,20,0.05)]",
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "text-xs font-medium tracking-[-0.018px]",
                allActive ? "text-white" : "text-gray-40",
              )}
            >
              All
            </span>
            <span
              className={cn(
                "text-xl font-bold tracking-[-0.1px]",
                allActive ? "text-white" : "text-white",
              )}
            >
              ·
            </span>
          </div>
          <span
            className={cn(
              "mt-2 size-2 rounded-full",
              allActive ? "bg-white" : "bg-gray-60",
            )}
          />
        </button>
      )}
      {dates.map((item, index) => {
        const itemIndex = showAll ? index + 1 : index;
        const isActive = itemIndex === selectedIndex;
        return (
          <button
            key={`${item.day}-${item.date}`}
            type="button"
            onClick={() => onSelect?.(itemIndex)}
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
