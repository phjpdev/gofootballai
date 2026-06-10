"use client";

import { TabGroup } from "@/components/ui/TabGroup";
import { figmaAsset } from "@/lib/figma-assets";

const GRID_LINE_TOP = figmaAsset("69924f3849c5c8526ac00831c57ba0941f64a0c9");
const GRID_LINE = figmaAsset("ebe324ca7d3b816a4e52b79cbfcc80a40a655666");

const Y_LABELS = ["1,000", "900", "800", "700", "600", "500"] as const;
const X_LABELS = ["11:00", "12:00", "13:00", "14:00", "15:00"] as const;

function ChartGridLine({
  label,
  lineSrc,
}: {
  label: string;
  lineSrc: string;
}) {
  return (
    <div className="flex w-full items-center gap-1">
      <p className="shrink-0 text-[10px] font-medium leading-none tracking-[-0.01px] text-[#676c75] whitespace-nowrap">
        {label}
      </p>
      <div className="relative min-w-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={lineSrc} className="block h-px w-full max-w-none" />
      </div>
    </div>
  );
}

export function StepsStatsChart() {
  return (
    <section className="flex w-full flex-col gap-2">
      <div className="flex h-6 w-full items-center justify-between">
        <p className="text-base font-bold leading-none tracking-[-0.048px] text-white">
          比分走勢
        </p>
        <button
          type="button"
          className="text-sm font-medium leading-none tracking-[-0.028px] text-[#f97316]"
        >
          查看全部
        </button>
      </div>

      <div className="w-full rounded-[32px] bg-[#24262b] p-4">
        <div className="flex flex-col gap-4">
          <TabGroup variant="darker" />

          <div className="relative h-[218px] w-full max-w-[311px]">
            <div className="absolute inset-0 flex flex-col items-end justify-center gap-2">
              <div className="flex h-[196px] w-full flex-col justify-between">
                {Y_LABELS.map((label, i) => (
                  <ChartGridLine
                    key={label}
                    label={label}
                    lineSrc={i === 0 ? GRID_LINE_TOP : GRID_LINE}
                  />
                ))}
              </div>
              <div className="flex w-[292px] items-start justify-between text-[10px] font-medium leading-none tracking-[-0.01px] text-[#676c75]">
                {X_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>

            <div className="absolute left-[191px] top-[70px] h-[120px] w-0">
              <div className="absolute inset-[0_-1px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("da318f84135a96d5c2865bdc7751c26f6e517d8b")}
                  className="block size-full max-w-none"
                />
              </div>
            </div>

            <div className="absolute left-[23px] top-4 flex h-[165px] w-[288px] items-center justify-center">
              <div className="-scale-y-100 rotate-180">
                <div className="relative h-[165px] w-[288px]">
                  <div className="absolute inset-[-3.64%_-3.27%_-8.13%_-2.78%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={figmaAsset(
                        "530e876853f9a63b85ec53e002fbf90446ea8de6",
                      )}
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-[23px] top-4 flex h-[173.5px] w-[288px] items-center justify-center">
              <div className="-scale-y-100 rotate-180">
                <div className="relative h-[173.5px] w-[288px]">
                  <div className="absolute inset-[-2.31%_-2.78%_-6.92%_-2.78%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={figmaAsset(
                        "c203a26e206115110a3b5ecaca4db1e24042156e",
                      )}
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-[183px] top-[62px] size-4">
              <div className="absolute inset-[-20.63%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("425be8b5c8efc5d3cd677263d83d829224a627a8")}
                  className="block size-full max-w-none"
                />
              </div>
            </div>

            <div className="absolute left-[23px] top-[66px] h-[84px] w-[288px]">
              <div className="absolute inset-[-7.14%_-2.78%_-16.67%_-2.78%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("09cfe02c2b78130de186ee0e9e8157d441c70b34")}
                  className="block size-full max-w-none"
                />
              </div>
            </div>

            <div className="absolute left-[23px] top-[66px] h-[124px] w-[288px]">
              <div className="absolute inset-[-3.23%_-2.78%_-9.68%_-2.78%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("76c2242ce4dbf6b074d62460a3f2bf76a00d08cc")}
                  className="block size-full max-w-none"
                />
              </div>
            </div>

            <div className="absolute left-[168px] top-[21px] flex flex-col items-center">
              <div className="rounded-[11px] bg-[#f97316] px-3 py-2">
                <p className="text-center text-xs font-bold leading-none tracking-[-0.018px] text-white">
                  825
                </p>
              </div>
              <div className="relative h-[7px] w-[14px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("31e0e304ac8dc63022efce89126c3bb04eb8625a")}
                  className="absolute inset-0 block size-full max-w-none"
                />
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="flex items-end">
              <p className="text-[36px] font-bold leading-[44px] tracking-[-0.432px] text-white">
                1,187
              </p>
              <p className="h-[27px] w-11 text-lg font-medium leading-none tracking-[-0.072px] text-[#9ea0a5]">
                總計
              </p>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex items-center gap-1">
                <div className="relative size-2">
                  <div className="absolute inset-[4.67%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={figmaAsset(
                        "39615eb904dd4db3a2486beaa57b925109643493",
                      )}
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
                <p className="text-xs font-medium leading-none tracking-[-0.018px] text-white">
                  本場
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative size-2">
                  <div className="absolute inset-[4.67%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={figmaAsset(
                        "1388bb961e978911ff4e719b8820cdd34856878f",
                      )}
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
                <p className="text-xs font-medium leading-none tracking-[-0.018px] text-white">
                  上場
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
