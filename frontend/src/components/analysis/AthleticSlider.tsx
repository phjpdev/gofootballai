"use client";

import Image from "next/image";
import { figmaAsset } from "@/lib/figma-assets";

export function AthleticSlider() {
  return (
    <div className="flex flex-col items-center gap-8">
      <p className="w-full text-center text-sm font-extrabold uppercase leading-5 tracking-[1.4px] text-orange-50">
        等級 4
      </p>

      <div className="relative h-9 w-[343px] rounded-2xl bg-[#27272a] shadow-[0px_4px_4px_rgba(15,23,42,0.03),0px_8px_8px_rgba(15,23,42,0.02)]">
        <div className="absolute left-[-0.5px] top-0 h-9 w-[260px] rounded-full bg-gradient-to-l from-[#65a30d] via-[51.5%] via-[#f59e0b] to-[#f43f5e]" />

        {[27.5, 96.5, 165.5, 234.5, 302.5].map((left) => (
          <div
            key={left}
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white/15 bg-black/15"
            style={{ left }}
          />
        ))}

        {[68.6, 137.2, 205.8, 274.4].map((left) => (
          <div key={left} className="absolute top-1.5 h-6 w-px" style={{ left }}>
            <Image
              src={figmaAsset("e846a61a46a2f19efabea4f8eedab39d3d4abd0e")}
              alt=""
              width={1}
              height={24}
              className="h-6 w-px"
            />
          </div>
        ))}

        <div className="absolute left-[220px] top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#27272a] bg-[#65a30d] shadow-[0px_12px_8px_rgba(15,23,42,0.08),0px_4px_3px_rgba(15,23,42,0.03)]">
          <Image
            src={figmaAsset("c0a7f3ab63a4cfce1ab9283bc6f2badc153496f3")}
            alt=""
            width={20}
            height={20}
            className="size-5 -rotate-90"
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <p className="w-full text-center text-[36px] font-bold leading-[44px] tracking-[-0.504px] text-white">
          戰術強度
        </p>
        <p className="w-full text-center text-base leading-[1.6] text-[#d4d4d8]">
          球隊具備應對高強度對抗的戰術能力
        </p>
        <div className="flex items-center justify-center gap-2">
          <Image
            src={figmaAsset("1f69d9de72d939fe5a8e4f19976aacac9dc61091")}
            alt=""
            width={20}
            height={20}
            className="size-5"
          />
          <p className="text-sm leading-5 tracking-[-0.084px] text-[#d4d4d8]">
            拖曳滑桿以調整預測參數
          </p>
        </div>
      </div>
    </div>
  );
}
