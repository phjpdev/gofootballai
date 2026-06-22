import { PostFeed } from "@/components/home/PostFeed";
import { HomeAiCoachSection } from "@/components/home/sections/HomeAiCoachSection";
import { HomeCoachSection } from "@/components/home/sections/HomeCoachSection";
import { HomeDailySection } from "@/components/home/sections/HomeDailySection";
import { HomeHeroSection } from "@/components/home/sections/HomeHeroSection";
import { HomeMetricsSection } from "@/components/home/sections/HomeMetricsSection";
import { HomeScoreSection } from "@/components/home/sections/HomeScoreSection";

export default function HomePage() {
  return (
    <div className="-mx-4 flex flex-col bg-black lg:mx-0 lg:overflow-hidden lg:rounded-[24px]">
      <HomeHeroSection />

      <div className="flex flex-col gap-12 px-4 py-12 lg:gap-16 lg:px-8 lg:py-16">
        <HomeScoreSection />
        <HomeDailySection />
        <HomeMetricsSection />
        <HomeAiCoachSection />
        <HomeCoachSection />
        <PostFeed />
      </div>
    </div>
  );
}
