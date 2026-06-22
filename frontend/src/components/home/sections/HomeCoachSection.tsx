import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

type HomeCoachSectionProps = {
  reverse?: boolean;
};

export function HomeCoachSection({ reverse = true }: HomeCoachSectionProps) {
  return (
    <HomeDesktopSectionShell index={4} reverse={reverse}>
      <div className="relative flex h-[min(36dvh,280px)] w-full shrink-0 items-center justify-center lg:h-[min(420px,55vh)] lg:flex-none">
        <div className="relative h-full w-full max-w-[320px] lg:max-w-none">
          <Image
            src={homeAsset("section-6-rating.png")}
            alt="5星級評分"
            fill
            className="object-contain object-center lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 1024px) 80vw, 50vw"
          />
        </div>
      </div>

      <HomeSectionHeader
        title="簡單易用 · 5星級投注體驗"
        description="簡潔直觀介面、智慧推薦、讓你隨時隨地都能享受專業、高效且愉快的分析體驗。"
      />
    </HomeDesktopSectionShell>
  );
}
