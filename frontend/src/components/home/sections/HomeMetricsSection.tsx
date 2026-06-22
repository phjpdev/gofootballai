import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

const ACTIVITY_COLORS = [
  { bg: "bg-[#3b82f6]", icon: "baa3934bf4299be88d0de959806a0b0e748ce844.svg", inset: "inset-[9.93%_12.96%_8.94%_12.96%]" },
  { bg: "bg-[#f43f5e]", icon: "6609157f6cf0a717c90a3eeba302b19375e896f4.svg", inset: "inset-[12.75%_4.69%]" },
  { bg: "bg-[#65a30d]", icon: "4adc59fe4c4318feeaecc58edef36de2885c526d.svg", inset: "inset-[12.93%_12.93%_9.55%_9.55%]" },
  { bg: "bg-[#52525b]", icon: "4deb1dbc7a60ee311af544663d42a9bc079d208b.svg", inset: "inset-[9.33%_6.15%_9.71%_6.16%]" },
  { bg: "bg-[#a855f7]", icon: "140fefd846f4e3d459c125e20149d0343cc35ba6.svg", inset: "inset-y-1/4 inset-x-[8.33%]" },
] as const;

const STEP_BARS = [50, 31.87, 74.69, 91.87, 40, 22.5, 40] as const;
const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function MetricCard({
  iconSrc,
  title,
  value,
  unit,
  subtitle,
  chart,
}: {
  iconSrc: string;
  title: string;
  value: string;
  unit: string;
  subtitle: string;
  chart: React.ReactNode;
}) {
  return (
    <div className="flex h-32 w-full flex-col gap-3 rounded-[18px] border border-[#3f3f46]/75 bg-[#18181b] p-4">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <div className="relative size-4 shrink-0">
            <div className="absolute inset-[13.09%_4.47%_9.1%_4.48%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={homeAsset(iconSrc)}
                className="absolute inset-0 size-full max-w-none"
              />
            </div>
          </div>
          <p className="min-w-0 flex-1 text-xs font-bold leading-4 tracking-[-0.06px] text-white">
            {title}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <p className="text-xs leading-4 tracking-[-0.06px] text-[#d4d4d8]">今日</p>
          <div className="relative size-[15px]">
            <div className="absolute inset-[12.84%_28.44%_12.84%_31.69%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={homeAsset("d87db11452471298c220b035ad87bbd08b64a0ea.svg")}
                className="absolute inset-0 size-full max-w-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-end gap-1">
            <p className="text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white">
              {value}
            </p>
            <p className="pb-1 text-sm leading-5 tracking-[-0.084px] text-[#d4d4d8]">
              {unit}
            </p>
          </div>
          <p className="text-xs leading-4 tracking-[-0.06px] text-[#d4d4d8]">
            {subtitle}
          </p>
        </div>
        {chart}
      </div>
    </div>
  );
}

export function HomeMetricsSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="堅持專業分析"
        description="拒絕代投注、毒會等不良誘惑，只提供純粹數據驅動的理性建議，幫助你建立長期穩定優勢。"
      />

      <div className="flex h-[340px] w-full max-w-[343px] flex-col justify-center gap-4">
        <MetricCard
          iconSrc="390d6f492341fb8e98d295e5c61ca5cc43aed35e.svg"
          title="進攻威脅"
          value="72"
          unit="xG"
          subtitle="預期進球值"
          chart={
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="relative min-h-0 flex-1">
                <div className="absolute inset-[0_-0.5%_-1.5%_-0.5%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={homeAsset("5d2740731ab112400146f12d5045539f523843b3.svg")}
                    className="block size-full max-w-none"
                  />
                </div>
              </div>
              <div className="flex justify-between px-px text-[10px] leading-[14px] tracking-[-0.04px] text-[#27272a]">
                {WEEK_LABELS.map((label, i) => (
                  <span key={`${label}-${i}`} className="w-[6.75px] text-center">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          }
        />

        <div className="flex w-full gap-2">
          {ACTIVITY_COLORS.map(({ bg, icon, inset }) => (
            <div
              key={icon}
              className={`flex h-8 min-w-0 flex-1 items-center justify-center rounded-xl ${bg}`}
            >
              <div className="relative size-5">
                <div className={`absolute ${inset}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={homeAsset(icon)}
                    className="absolute inset-0 size-full max-w-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <MetricCard
          iconSrc="69fb31220bf0ee024e2026080b5b873e480b8059.svg"
          title="控球率"
          value="58"
          unit="%"
          subtitle="本場平均"
          chart={
            <div className="flex h-[58px] w-[147.5px] shrink-0 items-center justify-between">
              {STEP_BARS.map((fill, index) => (
                <div key={index} className="flex w-3 flex-col items-center gap-1">
                  <div className="flex h-10 w-2 items-center justify-center">
                    <div className="-rotate-90">
                      <div className="relative h-2 w-10 overflow-hidden rounded-lg bg-[#3f3f46]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg bg-[#3b82f6]"
                          style={{ width: `${fill}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p
                    className={`text-[10px] leading-[14px] tracking-[-0.04px] ${
                      index === 0 ? "text-white" : "text-[#d4d4d8]"
                    }`}
                  >
                    {WEEK_LABELS[index]}
                  </p>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </section>
  );
}
