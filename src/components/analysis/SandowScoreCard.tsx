import Image from "next/image";
import { figmaAsset } from "@/lib/figma-assets";

export function SandowScoreCard({ score = 61 }: { score?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[#fb923c] bg-orange-50 p-2">
        <span className="text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white">
          {score}
        </span>
      </div>
      <div className="min-w-0 flex-1 flex-col gap-2">
        <p className="text-base font-bold leading-[22px] tracking-[-0.112px] text-white">
          Sandow Score
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Image
              src={figmaAsset("d730a779051682dbcb81c6e58b599a9f1febcc31")}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            <span className="text-sm leading-[1.6] text-white">Average Fitness</span>
          </div>
          <span className="size-1.5 rounded-full bg-white/30" />
          <div className="flex items-center gap-1">
            <Image
              src={figmaAsset("5a02b4f874787724fbd43c3c7828ada9850b2670")}
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
            <span className="text-sm leading-[1.6] text-white">plus</span>
          </div>
        </div>
      </div>
      <Image
        src={figmaAsset("a86a39395c1147b5e058f0c0f73491f1aac0eecb")}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
      />
    </div>
  );
}
