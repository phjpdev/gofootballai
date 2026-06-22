import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

type HomeDailySectionProps = {
  reverse?: boolean;
};

export function HomeDailySection({ reverse }: HomeDailySectionProps) {
  return (
    <HomeDesktopSectionShell index={1} reverse={reverse}>
      <HomeSectionHeader
        title="覆蓋全球多國聯賽"
        description="各大賽事每日即時更新，無論主流聯賽還是冷門比賽都能輕鬆掌握。"
      />

      <div className="relative min-h-0 w-full flex-1 lg:h-[min(560px,65vh)] lg:flex-none">
        <Image
          src={homeAsset("section-3-matches.png")}
          alt="全球聯賽賽事列表預覽"
          fill
          className="object-contain object-center shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)] lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </HomeDesktopSectionShell>
  );
}
