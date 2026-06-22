import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

export function HomeAiCoachSection() {
  return (
    <section className="flex w-full flex-col items-center gap-6">
      <HomeSectionHeader
        title="會員營利紀錄"
        description="實會員投注紀錄與盈利統計透明呈現，見證穩定回報，讓你更有信心跟隨專業分析前進。"
      />

      <div className="relative flex h-[min(58dvh,540px)] w-full items-center justify-center">
        <div className="relative h-full w-full max-w-[343px]">
          <Image
            src={homeAsset("section-5-records.png")}
            alt="會員營利紀錄預覽"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, 343px"
          />
        </div>
      </div>
    </section>
  );
}
