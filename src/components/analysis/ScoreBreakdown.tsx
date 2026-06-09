import { RadarChart } from "@/components/analysis/RadarChart";
import { figmaAsset } from "@/lib/figma-assets";

function FixedSlider({ position }: { position: "left" | "right" }) {
  const isRight = position === "right";
  const bg = isRight
    ? figmaAsset("7f62f2c2e0885f01f93a1cc770f8eaeaee147b6f")
    : figmaAsset("1dd8e863240a20f9206f08935ae6fb9af83130d7");
  const chevron = isRight
    ? figmaAsset("f21b9afd456a7326f85bcdc1cc13c90e47cc6df6")
    : figmaAsset("e3334ea356798cd9673ba24f76ad966e06241f88");

  return (
    <div
      className={`absolute top-[322px] z-10 h-[158px] w-[46px] ${isRight ? "right-0" : "left-0"}`}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div
          className={`relative h-full w-full ${isRight ? "-rotate-180 -scale-x-100" : "rotate-180"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={bg}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      </div>
      <div className="absolute inset-[42.41%_23.91%]">
        <div
          className={`absolute ${isRight ? "inset-[12.84%_28.44%_12.84%_31.69%]" : "inset-[12.84%_31.69%_12.84%_28.43%]"} relative`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={chevron}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color }: { color: string }) {
  return (
    <div className="relative size-[10px] shrink-0">
      <div
        className="absolute inset-[10%] rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

const LEGEND = [
  { label: "Strength", color: "#f97316" },
  { label: "Agility", color: "#2563eb" },
  { label: "Endurance", color: "#d4d4d8" },
] as const;

export function ScoreBreakdown({ score = 61 }: { score?: number }) {
  return (
    <section className="relative -mx-4 w-[calc(100%+2rem)] overflow-visible bg-black">
      <div className="relative mx-auto w-[343px]">
        <RadarChart />
      </div>

      <FixedSlider position="left" />
      <FixedSlider position="right" />

      <div className="mx-auto flex w-[343px] flex-col items-center gap-8 pt-16 pb-2">
        <div className="flex flex-col items-center gap-2 text-white">
          <p className="text-[96px] font-bold leading-[104px] tracking-[-2.88px]">
            {score}
          </p>
          <p className="w-[343px] text-center text-xl font-medium leading-7 tracking-[-0.2px]">
            You are a healthy individual.
          </p>
        </div>

        <div className="flex w-[343px] items-center justify-center gap-8">
          {LEGEND.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <LegendDot color={color} />
              <span className="text-base font-normal leading-[22px] tracking-[-0.112px] text-[#d4d4d8]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
