"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LedBorder } from "@/components/motion/LedBorder";
import { useAuth } from "@/context/AuthContext";
import { resolveTopMatchDetailPath } from "@/lib/top-match";
import type { AnalysisPick } from "@/types/analysis";

type PredictionPickCardProps = {
  pick: AnalysisPick;
  matchId: string;
};

function splitPickSelection(selection: string): { label: string; value: string } {
  const normalized = selection.trim();
  const match = normalized.match(/^([\u4e00-\u9fff]+)\s*(.*)$/);
  if (match?.[2]) {
    return { label: match[1], value: match[2].trim() };
  }
  return { label: normalized, value: "" };
}

export function PredictionPickCard({ pick, matchId }: PredictionPickCardProps) {
  const router = useRouter();
  const { token, isAuthenticated, isMember, isAdmin } = useAuth();
  const [navigating, setNavigating] = useState(false);
  const { label, value } = splitPickSelection(pick.selection);
  const canAccess = isAuthenticated && (isMember || isAdmin);

  async function handleClick() {
    if (navigating) return;

    setNavigating(true);
    try {
      const path = await resolveTopMatchDetailPath(token, canAccess, matchId);
      router.push(path);
    } catch {
      router.push(`/analysis/${matchId}`);
    } finally {
      setNavigating(false);
    }
  }

  return (
    <LedBorder
      className="aspect-square h-[173px] min-w-0 flex-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      borderWidth={3}
      borderRadius={16}
    >
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={navigating}
        aria-label="查看最高 AI 評分賽事分析"
        className="relative block h-full w-full bg-gray-90 text-left transition-opacity hover:opacity-95 active:opacity-90 disabled:opacity-70"
      >
        <Image
          src="/images/prediction-hero.png"
          alt=""
          fill
          sizes="(max-width: 375px) 45vw, 200px"
          className="object-cover object-[center_20%]"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center text-white">
          <p className="mt-3 rounded-xl bg-black/50 px-3 py-1 text-sm font-bold leading-none">
            預測:
          </p>
          <div className="flex flex-1 items-center justify-center px-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-black/50 px-4 py-2">
              <span className="text-[40px] font-bold leading-none tracking-tight">
                {label}
              </span>
              {value && (
                <span className="text-[40px] font-bold leading-none tracking-tight">
                  {value}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </LedBorder>
  );
}
