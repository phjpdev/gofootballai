import Image from "next/image";
import type { AnalysisPick } from "@/types/analysis";

type PredictionPickCardProps = {
  pick: AnalysisPick;
};

function splitPickSelection(selection: string): { label: string; value: string } {
  const normalized = selection.trim();
  const match = normalized.match(/^([\u4e00-\u9fff]+)\s*(.*)$/);
  if (match?.[2]) {
    return { label: match[1], value: match[2].trim() };
  }
  return { label: normalized, value: "" };
}

export function PredictionPickCard({ pick }: PredictionPickCardProps) {
  const { label, value } = splitPickSelection(pick.selection);

  return (
    <div className="relative aspect-square h-[173px] min-w-0 flex-1 overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <Image
        src="/images/prediction-hero.png"
        alt=""
        fill
        sizes="(max-width: 375px) 45vw, 200px"
        className="object-cover object-[center_20%]"
        priority
      />
      <div className="absolute inset-0 flex flex-col items-center text-white">
        <p
          className="pt-3 text-sm font-bold leading-none"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.75)" }}
        >
          預測:
        </p>
        <div className="flex flex-1 items-center justify-center gap-1.5 px-2">
          <span
            className="text-[40px] font-bold leading-none tracking-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
          >
            {label}
          </span>
          {value && (
            <span
              className="text-[40px] font-bold leading-none tracking-tight"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
            >
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
