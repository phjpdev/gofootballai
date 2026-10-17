"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { FeaturedSection } from "@/components/analysis/FeaturedSection";
import { AnalysisMemberGate } from "@/components/analysis/AnalysisLockScreen";
import {
  HkjcDatePicker,
  HkjcMatchesSection,
  HkjcProvider,
} from "@/components/analysis/HkjcMatchList";
import { TopMatchPreviewSection } from "@/components/analysis/TopMatchPreviewSection";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n/LocaleProvider";

function AnalysisPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const picksParam = searchParams.get("picks");
  const topPicks = picksParam === "top";
  const topPreview = picksParam === "preview";
  const showPicksView = topPicks || topPreview;
  const { isAuthenticated, isMember, isAdmin, isLoading: authLoading } =
    useAuth();
  const canAccessPicks = isAuthenticated && (isMember || isAdmin);

  if (showPicksView && !authLoading && !canAccessPicks) {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/analysis"
          className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          {t.analysis.backToAllMatches}
        </Link>
        <AnalysisMemberGate
          variant="fullscreen"
          redirectTo={
            topPreview ? "/analysis?picks=preview" : "/analysis?picks=top"
          }
          hint={t.analysis.picksGateHint}
        />
      </div>
    );
  }

  return (
    <HkjcProvider>
      <div className="flex flex-col gap-8">
        {showPicksView && (
          <Link
            href="/analysis"
            className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
          >
            <ChevronLeft className="size-4" />
            {t.analysis.backToAllMatches}
          </Link>
        )}

        {!showPicksView && (
          <header className="flex flex-col gap-8">
            <HkjcDatePicker />
          </header>
        )}

        {!showPicksView && <FeaturedSection />}

        {topPreview ? (
          <TopMatchPreviewSection />
        ) : (
          <HkjcMatchesSection mode={topPicks ? "top-picks" : "default"} />
        )}
      </div>
    </HkjcProvider>
  );
}

function AnalysisPageFallback() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-[88px] animate-pulse rounded-[19px] bg-gray-90" />
      <div className="h-[225px] animate-pulse rounded-[20px] bg-gray-90" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[84px] animate-pulse rounded-[16px] bg-gray-90"
          />
        ))}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<AnalysisPageFallback />}>
      <AnalysisPageContent />
    </Suspense>
  );
}
