"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LedBorderProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  borderRadius?: number;
  borderWidth?: number;
};

export function LedBorder({
  children,
  className,
  contentClassName,
  borderRadius = 24,
  borderWidth = 2,
}: LedBorderProps) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize({ w: width, h: height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const inset = borderWidth / 2;
  const rectRadius = Math.max(0, borderRadius - inset);
  const rectWidth = Math.max(0, size.w - borderWidth);
  const rectHeight = Math.max(0, size.h - borderWidth);
  const hasSize = size.w > 0 && size.h > 0;

  return (
    <div
      ref={containerRef}
      className={cn("led-border relative isolate", className)}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {hasSize && (
        <svg
          className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden
        >
          <defs>
            <filter
              id={`led-glow-${uid}`}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect
            className="led-border__track led-border__track--dim"
            x={inset}
            y={inset}
            width={rectWidth}
            height={rectHeight}
            rx={rectRadius}
            ry={rectRadius}
            pathLength={1}
          />
          <rect
            className="led-border__track led-border__track--glow"
            x={inset}
            y={inset}
            width={rectWidth}
            height={rectHeight}
            rx={rectRadius}
            ry={rectRadius}
            pathLength={1}
            filter={`url(#led-glow-${uid})`}
          />
          <rect
            className="led-border__track led-border__track--beam"
            x={inset}
            y={inset}
            width={rectWidth}
            height={rectHeight}
            rx={rectRadius}
            ry={rectRadius}
            pathLength={1}
          />
        </svg>
      )}
      <div
        className={cn(
          "led-border__content relative z-10 h-full w-full overflow-hidden",
          contentClassName,
        )}
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {children}
      </div>
    </div>
  );
}
