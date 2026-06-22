import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

type HomeAiCoachSectionProps = {
  reverse?: boolean;
};

export function HomeAiCoachSection({ reverse }: HomeAiCoachSectionProps) {
  return (
    <HomeDesktopSectionShell index={3} reverse={reverse}>
      <HomeSectionHeader
        title="會員營利紀錄"
        description="實會員投注紀錄與盈利統計透明呈現，見證穩定回報，讓你更有信心跟隨專業分析前進。"
      />

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center lg:h-[min(560px,65vh)] lg:flex-none">
        <div className="relative h-full w-full max-w-[343px] lg:max-w-none">
          <Image
            src={homeAsset("section-5-records.png")}
            alt="會員營利紀錄預覽"
            fill
            className="object-contain object-center lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </HomeDesktopSectionShell>
  );
}
