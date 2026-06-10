import { figmaAsset } from "@/lib/figma-assets";

function PolygonLayer({
  className,
  inset,
  src,
}: {
  className: string;
  inset: string;
  src: string;
}) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${className}`}
    >
      <div className={`absolute ${inset}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={figmaAsset(src)}
          className="block size-full max-w-none"
        />
      </div>
    </div>
  );
}

export function RadarChart() {
  return (
    <div className="relative h-[346px] w-[343px] shrink-0">
      <div className="absolute left-1/2 top-[calc(50%-0.5px)] h-[315px] w-[409.382px] -translate-x-1/2 -translate-y-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={figmaAsset("4b90dcaf1103218008dc906f6310d409368c1c46")}
          className="absolute inset-0 block size-full max-w-none"
        />
      </div>

      <PolygonLayer
        className="left-[calc(50%+0.5px)] top-[calc(50%-1px)] size-[248px]"
        inset="inset-[3.49%_6.7%]"
        src="b7b04f5ef41e7352991e8a800a990759988c867c"
      />
      <PolygonLayer
        className="left-[calc(50%+0.5px)] top-[calc(50%-1px)] size-[180px]"
        inset="inset-[4.13%_6.7%]"
        src="7804db50398c60ad88ddf7e66de8a0515e63d4af"
      />
      <PolygonLayer
        className="left-[calc(50%+0.5px)] top-[calc(50%-1px)] size-[316px]"
        inset="inset-[2.35%_6.7%]"
        src="7e46019c30ded6ded28695c208e0e6f6720691a3"
      />
      <PolygonLayer
        className="left-[calc(50%+0.5px)] top-[calc(50%-1px)] size-[114px]"
        inset="inset-[4.34%_6.7%]"
        src="dd4858f0717b99d9c013d229cd5201ea04199a88"
      />
      <PolygonLayer
        className="left-[calc(50%+0.5px)] top-[calc(50%-1px)] size-[46px]"
        inset="inset-[4.04%_6.7%]"
        src="af06526cbf3389e656a7453b0e9c7db61ae43e0a"
      />
      <PolygonLayer
        className="left-[calc(50%-3.5px)] top-[calc(50%-10px)] h-[136px] w-[116px]"
        inset="inset-[4.27%_4.26%_5.61%_3.5%]"
        src="0900f56137d3f4296df2a6655bede09adc649da9"
      />
      <PolygonLayer
        className="left-[calc(50%-3.5px)] top-[calc(50%-10px)] h-[136px] w-[116px]"
        inset="inset-[4.27%_4.26%_5.61%_3.5%]"
        src="9773ef9e5952306356b7e56b2fdffcc6dcbbe174"
      />

      <p className="absolute left-[150.5px] top-0 text-xs font-medium leading-4 tracking-[-0.06px] text-[#d4d4d8] whitespace-nowrap">
        進攻
      </p>
      <p className="absolute left-0 top-[78px] text-xs font-medium leading-4 tracking-[-0.06px] text-[#d4d4d8] whitespace-nowrap">
        控球
      </p>
      <p className="absolute left-[343px] top-[78px] -translate-x-full text-right text-xs font-medium leading-4 tracking-[-0.06px] text-[#d4d4d8] whitespace-nowrap">
        防守
      </p>
      <p className="absolute left-0 top-[252px] text-xs font-medium leading-4 tracking-[-0.06px] text-[#d4d4d8] whitespace-nowrap">
        體能
      </p>
      <p className="absolute left-[343px] top-[252px] -translate-x-full text-right text-xs font-medium leading-4 tracking-[-0.06px] text-[#d4d4d8] whitespace-nowrap">
        戰術
      </p>
      <p className="absolute left-[171.5px] top-[330px] -translate-x-1/2 text-center text-xs font-medium leading-4 tracking-[-0.06px] text-[#d4d4d8] whitespace-nowrap">
        士氣
      </p>

      <PolygonLayer
        className="left-[calc(50%-13.5px)] top-[calc(50%-22.75px)] h-[241.5px] w-[182px]"
        inset="inset-[3.95%_1.87%_3.88%_1.18%]"
        src="a4b589eabc9d5864138c4c9dd26db7c209076bd8"
      />
      <PolygonLayer
        className="left-[calc(50%-13.5px)] top-[calc(50%-22.75px)] h-[241.5px] w-[182px]"
        inset="inset-[2.3%_-2.53%_-1.09%_-3.22%]"
        src="7ae2491599e832dfab93531cbe25d3fa01e563b6"
      />
      <PolygonLayer
        className="left-[calc(50%-7.25px)] top-[calc(50%+6.5px)] h-[217px] w-[228.5px]"
        inset="inset-[2.25%_4.97%_0.89%_0]"
        src="ed826fcbfb60674d8c17d8fa479a1d8f7c48e59b"
      />
      <PolygonLayer
        className="left-[calc(50%-7.25px)] top-[calc(50%+6.5px)] h-[217px] w-[228.5px]"
        inset="inset-[0.4%_1.47%_-4.64%_-3.5%]"
        src="82effc5ff846835a5d554968f6a7c575e140245f"
      />
    </div>
  );
}
