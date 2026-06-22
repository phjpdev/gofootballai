import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeDailySection() {
  return (
    <section className="flex w-full flex-col items-center gap-6">
      <HomeSectionHeader
        title="覆蓋全球多國聯賽"
        description="各大賽事每日即時更新，無論主流聯賽還是冷門比賽都能輕鬆掌握。"
      />

      <div className="relative flex h-[min(58dvh,540px)] w-full items-center justify-center">
        <div className="relative h-full w-full max-w-[343px] shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)]">
          <Image
            src={homeAsset("section-3-matches.png")}
            alt="全球聯賽賽事列表預覽"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, 343px"
          />
        </div>
      </div>
    </section>
  );
}
