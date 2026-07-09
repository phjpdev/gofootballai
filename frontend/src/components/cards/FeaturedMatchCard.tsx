"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Clock, Flame } from "lucide-react";
import { LedBorder } from "@/components/motion/LedBorder";
import { useHkjc } from "@/components/analysis/HkjcMatchList";
import { useAuth } from "@/context/AuthContext";
import { resolveFeaturedImageUrl } from "@/lib/featured-api";
import { buildWorldCupFeaturedHref } from "@/lib/hkjc/world-cup-featured";
import { resolveTopMatchPreviewPath } from "@/lib/top-match";

type FeaturedMatchCardProps = {
  title: string;
  tag: string;
  duration: string;
  stat: string;
  imageSrc: string;
  pickMode: "single" | "multi";
  dateKey?: string;
  worldCupScores?: Record<string, number>;
};

export function FeaturedMatchCard({
  title,
  tag,
  duration,
  stat,
  imageSrc,
  pickMode,
  dateKey,
  worldCupScores = {},
}: FeaturedMatchCardProps) {
  const router = useRouter();
  const { data, todayPassedMatches } = useHkjc();
  const { token, isAuthenticated, isMember, isAdmin, isLoading } = useAuth();
  const [navigating, setNavigating] = useState(false);
  const canAccess = isAuthenticated && (isMember || isAdmin);
  const imageUrl = resolveFeaturedImageUrl(imageSrc);
  const isUploadedImage = imageUrl.includes("/uploads/");

  async function handleClick() {
    if (isLoading || navigating) return;

    if (pickMode === "single") {
      const path = buildWorldCupFeaturedHref(data?.matches ?? [], {
        dateKey,
        todayPassedMatches,
        scores: worldCupScores,
      });
      router.push(path);
      return;
    }

    setNavigating(true);
    try {
      const path = await resolveTopMatchPreviewPath(token, canAccess, { dateKey });
      router.push(path);
    } catch {
      router.push("/analysis");
    } finally {
      setNavigating(false);
    }
  }

  return (
    <LedBorder className="h-[225px] w-[261px] shrink-0" borderWidth={3}>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={
          isLoading ||
          navigating ||
          (pickMode === "single" && !data?.matches?.length)
        }
        aria-label={`查看 ${title} AI 分析`}
        className="relative h-full w-full bg-gray-90 p-4 text-left disabled:opacity-70"
      >
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized={isUploadedImage}
            className="object-cover"
            sizes="261px"
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 h-[144px] w-full bg-gradient-to-b from-transparent to-gray-90" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <span className="inline-flex h-6 w-fit items-center justify-center rounded-lg bg-white/30 px-2 py-1 text-xs font-semibold tracking-[-0.018px] text-white">
            {tag}
          </span>

          <div className="flex w-[229px] items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold tracking-[-0.072px] text-white whitespace-nowrap">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="size-4 text-white" strokeWidth={2} />
                  <span className="text-xs font-medium tracking-[-0.018px] text-white">
                    {duration}
                  </span>
                </div>
                <span className="size-1 rounded-full bg-gray-70" />
                <div className="flex items-center gap-1">
                  <Flame className="size-4 text-white" strokeWidth={2} />
                  <span className="text-xs font-medium tracking-[-0.018px] text-white">
                    {stat}
                  </span>
                </div>
              </div>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.25)]">
              <ArrowRight className="size-6 text-white" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </button>
    </LedBorder>
  );
}
