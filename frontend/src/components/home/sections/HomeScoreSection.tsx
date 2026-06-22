import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

type HomeScoreSectionProps = {
  reverse?: boolean;
};

export function HomeScoreSection({ reverse }: HomeScoreSectionProps) {
  return (
    <HomeDesktopSectionShell index={0} reverse={reverse}>
      <HomeSectionHeader
        title="精準計算每一場賽事"
        description="為你提供詳細專業分析與高準確率信心指數（90%+），助你找出真正價值投注機會。"
      />

      <div className="relative min-h-0 w-full flex-1 lg:h-[min(560px,65vh)] lg:flex-none">
        <Image
          src={homeAsset("section-2-analysis.png")}
          alt="AI 賽事分析預覽"
          fill
          className="object-contain object-center drop-shadow-[0px_9.637px_10.708px_rgba(31,41,55,0.05)] lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </HomeDesktopSectionShell>
  );
}
