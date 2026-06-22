"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HomeOnboardingScroll } from "@/components/home/HomeOnboardingScroll";
import { HomePageNav } from "@/components/home/HomePageNav";
import { HomeAiCoachSection } from "@/components/home/sections/HomeAiCoachSection";
import { HomeCoachSection } from "@/components/home/sections/HomeCoachSection";
import { HomeDailySection } from "@/components/home/sections/HomeDailySection";
import { HomeHeroSection } from "@/components/home/sections/HomeHeroSection";
import { HomeMetricsSection } from "@/components/home/sections/HomeMetricsSection";
import { HomeScoreSection } from "@/components/home/sections/HomeScoreSection";

const PAGE_COUNT = 6;
const FEATURE_PAGE_COUNT = PAGE_COUNT - 1;

const FEATURE_PAGES = [
  HomeScoreSection,
  HomeDailySection,
  HomeMetricsSection,
  HomeAiCoachSection,
  HomeCoachSection,
] as const;

function HomeOnboardingPagerMobile() {
  const [page, setPage] = useState(0);
  const router = useRouter();

  function goNext() {
    if (page < FEATURE_PAGE_COUNT) {
      setPage((current) => current + 1);
      return;
    }
    router.push("/analysis");
  }

  function goPrev() {
    setPage((current) => Math.max(0, current - 1));
  }

  const FeaturePage = page > 0 ? FEATURE_PAGES[page - 1] : null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-black">
      <div className="min-h-0 flex-1 overflow-hidden">
        {page === 0 ? (
          <HomeHeroSection onGetStarted={() => setPage(1)} />
        ) : (
          FeaturePage && (
            <div className="flex h-full w-full flex-col items-center justify-center px-2 pt-2">
              <FeaturePage />
            </div>
          )
        )}
      </div>

      {page > 0 && (
        <HomePageNav
          currentStep={page}
          totalSteps={PAGE_COUNT}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </div>
  );
}

export function HomeOnboardingPager() {
  return (
    <>
      <div className="h-full lg:hidden">
        <HomeOnboardingPagerMobile />
      </div>
      <div className="hidden min-h-0 lg:block">
        <HomeOnboardingScroll />
      </div>
    </>
  );
}
