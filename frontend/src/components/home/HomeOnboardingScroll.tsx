import { HomeDesktopCta } from "@/components/home/HomeDesktopCta";
import { HomeAiCoachSection } from "@/components/home/sections/HomeAiCoachSection";
import { HomeCoachSection } from "@/components/home/sections/HomeCoachSection";
import { HomeDailySection } from "@/components/home/sections/HomeDailySection";
import { HomeHeroSection } from "@/components/home/sections/HomeHeroSection";
import { HomeMetricsSection } from "@/components/home/sections/HomeMetricsSection";
import { HomeScoreSection } from "@/components/home/sections/HomeScoreSection";

export function HomeOnboardingScroll() {
  return (
    <div className="bg-black lg:rounded-t-[24px]">
      <HomeHeroSection />
      <div className="flex flex-col">
        <HomeScoreSection />
        <HomeDailySection reverse />
        <HomeMetricsSection />
        <HomeAiCoachSection reverse />
        <HomeCoachSection />
      </div>
      <HomeDesktopCta />
    </div>
  );
}
