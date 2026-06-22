import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeDailySection() {
  return (
    <section className="flex h-full w-full flex-col items-center gap-4">
      <HomeSectionHeader
        title="覆蓋全球多國聯賽"
        description="各大賽事每日即時更新，無論主流聯賽還是冷門比賽都能輕鬆掌握。"
      />

      <div className="relative min-h-0 w-full flex-1">
        <Image
          src={homeAsset("section-3-matches.png")}
          alt="全球聯賽賽事列表預覽"
          fill
          className="object-contain object-center shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)]"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
