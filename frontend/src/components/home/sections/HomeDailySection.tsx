import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeDailySection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="覆蓋全球多國聯賽"
        description="各大賽事每日即時更新，無論主流聯賽還是冷門比賽都能輕鬆掌握。"
      />

      <div className="relative flex h-[400px] w-full max-w-[343px] items-center justify-center">
        <div className="relative h-[326px] w-[260px] shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)]">
          <Image
            src={homeAsset("section-3-matches.png")}
            alt="全球聯賽賽事列表預覽"
            fill
            className="object-contain object-center"
            sizes="260px"
          />
        </div>
      </div>
    </section>
  );
}
