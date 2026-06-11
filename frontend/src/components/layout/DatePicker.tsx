"use client";

import { Fragment, type ReactNode } from "react";
import { AnimateIn } from "@/components/motion/AnimateIn";
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
  animate?: boolean;
};

function DatePickerButton({
  active,
  onClick,
  day,
  date,
  hasEvent = true,
}: {
  active: boolean;
  onClick: () => void;
  day: string;
  date: number | string;
  hasEvent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-14 shrink-0 flex-col items-center justify-center rounded-[19px] p-2",
        active
          ? "bg-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.25)]"
          : "bg-gray-100 shadow-[0_8px_16px_0_rgba(17,18,20,0.05)]",
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            "text-xs font-medium tracking-[-0.018px]",
            active ? "text-white" : "text-gray-40",
          )}
        >
          {day}
        </span>
        <span className="text-xl font-bold tracking-[-0.1px] text-white">
          {date}
        </span>
      </div>
      {hasEvent && (
        <span
          className={cn(
            "mt-2 size-2 rounded-full",
            active ? "bg-white" : "bg-gray-60",
          )}
        />
      )}
    </button>
  );
}

export function DatePicker({
  dates,
  onSelect,
  selectedIndex = 1,
  showAll = false,
  animate = true,
}: DatePickerProps) {
  const allActive = showAll && selectedIndex === 0;

  function wrap(index: number, node: ReactNode) {
    if (!animate) return node;
    return (
      <AnimateIn
        variant="slide-left"
        delay={index * 80}
        className="shrink-0"
        as="div"
      >
        {node}
      </AnimateIn>
    );
  }

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {showAll &&
        wrap(
          0,
          <DatePickerButton
            active={allActive}
            onClick={() => onSelect?.(0)}
            day="全部"
            date="·"
          />,
        )}
      {dates.map((item, index) => {
        const itemIndex = showAll ? index + 1 : index;
        const isActive = itemIndex === selectedIndex;
        return (
          <Fragment key={`${item.day}-${item.date}`}>
            {wrap(
              itemIndex,
              <DatePickerButton
                active={isActive}
                onClick={() => onSelect?.(itemIndex)}
                day={item.day}
                date={item.date}
                hasEvent={item.hasEvent !== false}
              />,
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
