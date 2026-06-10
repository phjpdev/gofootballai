"use client";

import { TabGroup } from "@/components/ui/TabGroup";
import { figmaAsset } from "@/lib/figma-assets";

const GRID_LINE = figmaAsset("e25c974c2802bd011ac275d5ce0e1607fd6a5128");
const GRID_LABELS = ["900", "800", "700", "600", "500"] as const;

function ChartGridLine({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-1">
      <p className="w-5 shrink-0 text-[10px] font-medium leading-none tracking-[-0.01px] text-[#50535b]">
        {label}
      </p>
      <div className="relative min-w-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={GRID_LINE} className="block h-px w-full max-w-none" />
      </div>
    </div>
  );
}

function ChartTooltip({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-col items-center">
        <div className="rounded-[11px] bg-[#f97316] px-3 py-2">
          <p className="text-center text-xs font-bold leading-none tracking-[-0.018px] text-white">
            {value}
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
      <div className="relative size-4">
        <div className="absolute inset-[-20.63%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={figmaAsset("468237483a81672c3e0c0f987dc11600248f5679")}
            className="block size-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

export function ActivitiesChart() {
  return (
    <section className="flex w-full flex-col gap-2">
      <div className="flex h-6 w-full items-center justify-between">
        <p className="text-base font-bold leading-none tracking-[-0.048px] text-white">
          進攻趨勢
        </p>
        <button
          type="button"
          className="text-sm font-medium leading-none tracking-[-0.028px] text-[#f97316]"
        >
          查看全部
        </button>
      </div>

      <div className="flex w-full flex-col gap-4 overflow-hidden rounded-[32px] bg-[#24262b] p-4">
        <TabGroup variant="dark" />

        <div className="relative h-[140px] w-full max-w-[311px]">
          <div className="absolute inset-0 flex flex-col justify-between">
            {GRID_LABELS.map((label) => (
              <ChartGridLine key={label} label={label} />
            ))}
          </div>

          <div className="absolute left-6 top-0.5 h-[131.5px] w-[287px]">
            <div className="absolute inset-[-1.52%_0_0_0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={figmaAsset("1ef66f66664774db36159e73bc6d7c334340397e")}
                className="block size-full max-w-none"
              />
            </div>
          </div>

          <div className="absolute left-[199px] top-[35px]">
            <ChartTooltip value="880" />
          </div>
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[30px] font-bold leading-[38px] tracking-[-0.3px] text-white">
              1,548 kcal
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="relative size-5">
                  <div className="absolute inset-[14.2%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={figmaAsset(
                        "24d58182ee7a8c1433b74c29feb4b75efe65ee13",
                      )}
                      className="absolute inset-0 block size-full max-w-none"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium leading-none tracking-[-0.028px] text-[#d7d8d9]">
                  +285
                </p>
              </div>
              <div className="relative size-1">
                <div className="absolute inset-[7.54%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={figmaAsset(
                      "38863f004e120bc7e2a3988777460be003cd8a83",
                    )}
                    className="block size-full max-w-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative size-5">
                  <div className="absolute inset-[9.81%_26.27%_12.5%_26.27%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={figmaAsset(
                        "ba6248836ae38e79b03d5becca3926ac95068e7d",
                      )}
                      className="absolute inset-0 block size-full max-w-none"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium leading-none tracking-[-0.028px] text-[#d7d8d9]">
                  8 項建議
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="查看詳情"
            className="relative size-14 shrink-0 overflow-hidden rounded-[19px] bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
          >
            <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-[6.96%_19.43%_4.85%_11.42%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset(
                    "fc1cf382b524d47d494c4aa239c658b81ff7fa48",
                  )}
                  className="absolute inset-0 block size-full max-w-none"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
