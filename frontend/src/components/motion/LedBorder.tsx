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
  borderWidth = 3,
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

  const innerRadius = Math.max(0, borderRadius - borderWidth);
  const inset = borderWidth / 2;
  const rectRadius = Math.max(0, borderRadius - inset);
  const rectWidth = Math.max(0, size.w - borderWidth);
  const rectHeight = Math.max(0, size.h - borderWidth);
  const hasSize = size.w > 0 && size.h > 0;
  const perimeter =
    2 * (rectWidth + rectHeight - 2 * rectRadius) + 2 * Math.PI * rectRadius;
  const heatCoreDash = Math.max(32, Math.min(44, perimeter * 0.045));
  const heatGlowDash = heatCoreDash * 1.15;
  const heatTrailDash = heatCoreDash * 1.3;
  const dualGap = Math.max((perimeter - heatCoreDash * 2) / 2, heatCoreDash);
  const dualDashPattern = (dash: number) =>
    `${dash} ${dualGap} ${dash} ${dualGap}`;

  const heatGradientId = `led-heat-${uid}`;
  const heatBlurHeavyId = `led-heat-blur-heavy-${uid}`;
  const heatBlurMidId = `led-heat-blur-mid-${uid}`;

  const trackProps = {
    x: inset,
    y: inset,
    width: rectWidth,
    height: rectHeight,
    rx: rectRadius,
    ry: rectRadius,
  };

  return (
    <div
      ref={containerRef}
      className={cn("led-border relative isolate overflow-visible", className)}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      }}
    >
      {hasSize && (
        <svg
          className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible"
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ ["--led-dash-total" as string]: `${perimeter}px` }}
          aria-hidden
        >
          <defs>
            <linearGradient
              id={heatGradientId}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={size.w}
              y2={size.h}
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="18%" stopColor="#60a5fa" stopOpacity="0.55" />
              <stop offset="42%" stopColor="#a855f7" stopOpacity="0.95" />
              <stop offset="62%" stopColor="#f97316" stopOpacity="1" />
              <stop offset="82%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
            </linearGradient>
            <filter
              id={heatBlurHeavyId}
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id={heatBlurMidId}
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect
            className="led-border__track led-border__track--dim"
            {...trackProps}
          />
          <rect
            className="led-border__track led-border__track--heat-trail"
            stroke={`url(#${heatGradientId})`}
            filter={`url(#${heatBlurHeavyId})`}
            strokeDasharray={dualDashPattern(heatTrailDash)}
            {...trackProps}
          />
          <rect
            className="led-border__track led-border__track--heat-glow"
            stroke={`url(#${heatGradientId})`}
            filter={`url(#${heatBlurMidId})`}
            strokeDasharray={dualDashPattern(heatGlowDash)}
            {...trackProps}
          />
          <rect
            className="led-border__track led-border__track--heat-core"
            stroke={`url(#${heatGradientId})`}
            strokeDasharray={dualDashPattern(heatCoreDash)}
            {...trackProps}
          />
        </svg>
      )}
      <div
        className={cn(
          "led-border__content relative z-[1] h-full w-full overflow-hidden",
          contentClassName,
        )}
        style={{ borderRadius: `${innerRadius}px` }}
      >
        {children}
      </div>
    </div>
  );
}
