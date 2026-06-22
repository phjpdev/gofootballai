import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeScoreSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="精準計算每一場賽事"
        description="為你提供詳細專業分析與高準確率信心指數（90%+），助你找出真正價值投注機會。"
      />

      <div className="relative flex h-[340px] w-full max-w-[343px] items-center justify-center">
        <div className="relative h-full w-[220px] drop-shadow-[0px_9.637px_10.708px_rgba(31,41,55,0.05)]">
          <Image
            src={homeAsset("section-2-analysis.png")}
            alt="AI 賽事分析預覽"
            fill
            className="object-contain object-center"
            sizes="220px"
          />
        </div>
      </div>
    </section>
  );
}
