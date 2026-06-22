import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeCoachSection() {
  return (
    <section className="flex w-full flex-col items-center gap-6">
      <div className="relative flex h-[min(36dvh,280px)] w-full items-center justify-center">
        <div className="relative h-full w-full max-w-[320px]">
          <Image
            src={homeAsset("section-6-rating.png")}
            alt="5星級評分"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 80vw, 320px"
          />
        </div>
      </div>

      <HomeSectionHeader
        title="簡單易用 · 5星級投注體驗"
        description="簡潔直觀介面、智慧推薦、讓你隨時隨地都能享受專業、高效且愉快的分析體驗。"
      />
    </section>
  );
}
