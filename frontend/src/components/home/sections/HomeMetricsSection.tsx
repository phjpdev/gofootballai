import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

type HomeMetricsSectionProps = {
  reverse?: boolean;
};

export function HomeMetricsSection({ reverse }: HomeMetricsSectionProps) {
  return (
    <HomeDesktopSectionShell index={2} reverse={reverse}>
      <HomeSectionHeader
        title="堅持專業分析"
        description="拒絕代投注、毒會等不良誘惑，只提供純粹數據驅動的理性建議，幫助你建立長期穩定優勢。"
      />

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center lg:h-[min(560px,65vh)] lg:flex-none">
        <div className="relative h-full w-full max-w-[343px] lg:max-w-none">
          <Image
            src={homeAsset("section-4-metrics.png")}
            alt="賽事數據分析預覽"
            fill
            className="object-contain object-center lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </HomeDesktopSectionShell>
  );
}
