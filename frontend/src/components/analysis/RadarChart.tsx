import { figmaAsset } from "@/lib/figma-assets";
import type { AnalysisDimensions } from "@/types/analysis";

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

const AXES: Array<{ key: keyof AnalysisDimensions; label: string; angle: number }> = [
  { key: "attack", label: "進攻", angle: -90 },
  { key: "possession", label: "控球", angle: -30 },
  { key: "defense", label: "防守", angle: 30 },
  { key: "tactics", label: "戰術", angle: 90 },
  { key: "morale", label: "士氣", angle: 150 },
  { key: "fitness", label: "體能", angle: 210 },
];

const CENTER = 91;
const MAX_RADIUS = 68;

function polarToCartesian(angleDeg: number, radius: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

function buildPolygonPoints(dimensions: AnalysisDimensions): string {
  return AXES.map(({ key, angle }) => {
    const value = dimensions[key] / 100;
    const { x, y } = polarToCartesian(angle, MAX_RADIUS * value);
    return `${x},${y}`;
  }).join(" ");
}

type RadarChartProps = {
  dimensions: AnalysisDimensions;
};

export function RadarChart({ dimensions }: RadarChartProps) {
  const dataPoints = buildPolygonPoints(dimensions);

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

      <div className="absolute left-[calc(50%-7.25px)] top-[calc(50%+6.5px)] h-[217px] w-[228.5px] -translate-x-1/2 -translate-y-1/2">
        <svg
          viewBox="0 0 182 182"
          className="size-full origin-center animate-[radar-in_0.6s_ease-out]"
          aria-hidden
        >
          <polygon
            points={dataPoints}
            fill="rgba(249, 115, 22, 0.42)"
            stroke="#f97316"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
