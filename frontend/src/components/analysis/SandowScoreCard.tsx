"use client";

import { useEffect, useState } from "react";
import { figmaAsset } from "@/lib/figma-assets";

const CHEVRON = figmaAsset("a86a39395c1147b5e058f0c0f73491f1aac0eecb");

type SandowScoreCardProps = {
  score?: number;
  animate?: boolean;
};

export function SandowScoreCard({ score = 61, animate = true }: SandowScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayScore(score);
      return;
    }

    const duration = 800;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayScore(Math.round(score * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-[#fb923c] bg-[#f97316]">
        <p className="text-center text-[26px] font-bold leading-none tabular-nums text-white">
          {displayScore}%
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="w-full text-base font-bold leading-[22px] tracking-[-0.112px] text-white">
          AI 量化評分
        </p>
        <div className="flex w-full items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="relative size-5 shrink-0">
              <div className="absolute inset-[13.09%_4.47%_9.1%_4.48%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("d730a779051682dbcb81c6e58b599a9f1febcc31")}
                  className="absolute inset-0 block size-full max-w-none"
                />
              </div>
            </div>
            <p className="text-sm font-normal leading-[1.6] text-white whitespace-nowrap">
              綜合實力
            </p>
          </div>
          <div className="relative size-1.5 shrink-0">
            <div className="absolute inset-[16.67%] rounded-full bg-white/30" />
          </div>
          <div className="flex items-center gap-1">
            <div className="relative size-5 shrink-0">
              <div className="absolute inset-[1.97%_6.74%_7.5%_7.5%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("5a02b4f874787724fbd43c3c7828ada9850b2670")}
                  className="absolute inset-0 block size-full max-w-none"
                />
              </div>
            </div>
            <p className="text-sm font-normal leading-[1.6] text-white whitespace-nowrap">
              十四代演算法
            </p>
          </div>
        </div>
      </div>

      <div className="relative size-6 shrink-0">
        <div className="absolute inset-[12.84%_28.44%_12.84%_31.69%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={CHEVRON}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
