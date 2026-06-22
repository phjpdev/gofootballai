import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

type ActivityCardProps = {
  title: string;
  intensity: string;
  intensityColor: string;
  iconSrc: string;
  className: string;
};

function ActivityCard({
  title,
  intensity,
  intensityColor,
  iconSrc,
  className,
}: ActivityCardProps) {
  return (
    <div
      className={`absolute h-[124px] w-[104px] overflow-hidden rounded-2xl border border-[#3f3f46]/50 bg-[#18181b] shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)] ${className}`}
    >
      <div className="absolute left-[7.5px] top-[7.5px] size-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={iconSrc} className="absolute inset-0 size-full max-w-none" />
      </div>
      <div className="absolute left-[7.5px] top-[82.5px] flex w-[88px] flex-col gap-1">
        <p className="text-xs font-bold leading-4 tracking-[-0.144px] text-white">
          {title}
        </p>
        <div className="flex items-center gap-1">
          <div className="relative size-3.5">
            <div className="absolute inset-[13.09%_4.47%_9.1%_4.48%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={homeAsset("95103b8e2c480e6b133437335c368f911062b923.svg")}
                className="absolute inset-0 size-full max-w-none"
              />
            </div>
          </div>
          <p
            className="flex-1 text-[10px] font-normal leading-[14px] tracking-[-0.1px]"
            style={{ color: intensityColor }}
          >
            {intensity}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HomeDailySection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="每日賽事推薦"
        description="根據 AI 模型分析，為你精選每日最值得關注的世界盃賽事。"
      />

      <div className="relative h-[340px] w-full max-w-[343px]">
        <ActivityCard
          title="強隊對決"
          intensity="高關注"
          intensityColor="#c2410c"
          iconSrc={homeAsset("467ad96733de9c59f8f82d3275c66e1f8c1d9d06.svg")}
          className="left-[205px] top-0"
        />
        <ActivityCard
          title="戰術焦點"
          intensity="深度"
          intensityColor="#2563eb"
          iconSrc={homeAsset("34bc79675fcc17f2e9daf9fc501998597b2989d3.svg")}
          className="left-[34px] top-[216px]"
        />
        <ActivityCard
          title="冷門之選"
          intensity="輕量"
          intensityColor="#f97316"
          iconSrc={homeAsset("395270dae707dcccf5a308c936ba0b2076a0823d.svg")}
          className="left-0 top-[calc(50%-62px)] -translate-y-1/2"
        />
        <ActivityCard
          title="即時追蹤"
          intensity="中等"
          intensityColor="#be123c"
          iconSrc={homeAsset("65c0f92c80d10bb20fc931a485f6e091691a60da.svg")}
          className="right-0 top-[calc(50%+62px)] -translate-y-1/2"
        />

        <div className="absolute left-1/2 top-[calc(50%-10px)] h-[276px] w-[264px] -translate-x-1/2 -translate-y-1/2 shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)]">
          <Image
            src={homeAsset("smart-watch.png")}
            alt=""
            fill
            className="object-cover"
            sizes="264px"
          />
        </div>
      </div>
    </section>
  );
}
