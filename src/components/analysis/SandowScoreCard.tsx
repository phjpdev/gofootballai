import { figmaAsset } from "@/lib/figma-assets";

const CHEVRON = figmaAsset("a86a39395c1147b5e058f0c0f73491f1aac0eecb");

export function SandowScoreCard({ score = 61 }: { score?: number }) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex size-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[#fb923c] bg-[#f97316] p-2">
        <p className="w-full text-center text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white">
          {score}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="w-full text-base font-bold leading-[22px] tracking-[-0.112px] text-white">
          Sandow Score
        </p>
        <div className="flex w-full items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="relative size-5 shrink-0">
              <div className="absolute inset-[13.09%_4.47%_9.1%_4.48%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("d730a779051682dbcb81c6e58b599a9f1febcc31")}
                  className="absolute inset-0 block size-full max-w-none"
                />
              </div>
            </div>
            <p className="text-sm font-normal leading-[1.6] text-white whitespace-nowrap">
              Average Fitness
            </p>
          </div>
          <div className="relative size-1.5 shrink-0">
            <div className="absolute inset-[16.67%] rounded-full bg-white/30" />
          </div>
          <div className="flex items-center gap-1">
            <div className="relative size-5 shrink-0">
              <div className="absolute inset-[1.97%_6.74%_7.5%_7.5%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("5a02b4f874787724fbd43c3c7828ada9850b2670")}
                  className="absolute inset-0 block size-full max-w-none"
                />
              </div>
            </div>
            <p className="text-sm font-normal leading-[1.6] text-white whitespace-nowrap">
              plus
            </p>
          </div>
        </div>
      </div>

      <div className="relative size-6 shrink-0">
        <div className="absolute inset-[12.84%_28.44%_12.84%_31.69%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={CHEVRON}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
