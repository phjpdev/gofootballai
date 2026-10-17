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
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { localizedText } from "@/lib/i18n/localized";
import { resolveTopMatchPreviewPath } from "@/lib/top-match";

type FeaturedMatchCardProps = {
  title: string;
  tag: string;
  duration: string;
  stat: string;
  titleEn?: string;
  tagEn?: string;
  durationEn?: string;
  statEn?: string;
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
  titleEn,
  tagEn,
  durationEn,
  statEn,
  imageSrc,
  pickMode,
  dateKey,
  worldCupScores = {},
}: FeaturedMatchCardProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { data, todayPassedMatches } = useHkjc();
  const { token, isAuthenticated, isMember, isAdmin, isLoading } = useAuth();
  const [navigating, setNavigating] = useState(false);
  const canAccess = isAuthenticated && (isMember || isAdmin);
  const imageUrl = resolveFeaturedImageUrl(imageSrc);
  const isUploadedImage = imageUrl.includes("/uploads/");
  const displayTitle = localizedText(locale, title, titleEn);

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
        aria-label={t.analysis.featured.viewAnalysis(displayTitle)}
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
            {localizedText(locale, tag, tagEn)}
          </span>

          <div className="flex w-[229px] items-center justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="truncate text-lg font-bold tracking-[-0.072px] text-white whitespace-nowrap">
                {displayTitle}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex shrink-0 items-center gap-1">
                  <Clock className="size-4 text-white" strokeWidth={2} />
                  <span className="whitespace-nowrap text-xs font-medium tracking-[-0.018px] text-white">
                    {localizedText(locale, duration, durationEn)}
                  </span>
                </div>
                <span className="size-1 shrink-0 rounded-full bg-gray-70" />
                <div className="flex min-w-0 items-center gap-1">
                  <Flame className="size-4 shrink-0 text-white" strokeWidth={2} />
                  <span className="truncate text-xs font-medium tracking-[-0.018px] text-white">
                    {localizedText(locale, stat, statEn)}
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
