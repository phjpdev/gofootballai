import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeMetricsSection() {
  return (
    <section className="flex w-full flex-col items-center gap-6">
      <HomeSectionHeader
        title="堅持專業分析"
        description="拒絕代投注、毒會等不良誘惑，只提供純粹數據驅動的理性建議，幫助你建立長期穩定優勢。"
      />

      <div className="relative flex h-[min(58dvh,540px)] w-full items-center justify-center">
        <div className="relative h-full w-full max-w-[343px]">
          <Image
            src={homeAsset("section-4-metrics.png")}
            alt="賽事數據分析預覽"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, 343px"
          />
        </div>
      </div>
    </section>
  );
}
