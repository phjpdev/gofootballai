import Image from "next/image";
import { LedBorder } from "@/components/motion/LedBorder";
import type { AnalysisPick } from "@/types/analysis";

type PredictionPickCardProps = {
  pick: AnalysisPick;
  matchId: string;
};

function splitPickSelection(selection: string): { label: string; value: string } {
  const normalized = selection.trim();
  const handicapMatch = normalized.match(/^([\u4e00-\u9fff]+)\s*([-+]?[\d./]+.*)$/);
  if (handicapMatch?.[2]) {
    return { label: handicapMatch[1], value: handicapMatch[2].trim() };
  }
  const ouMatch = normalized.match(/^([大小])\s*(.+)$/);
  if (ouMatch?.[2]) {
    return { label: ouMatch[1], value: ouMatch[2].trim() };
  }
  return { label: normalized, value: "" };
}

export function PredictionPickCard({ pick }: PredictionPickCardProps) {
  const { label, value } = splitPickSelection(pick.selection);

  return (
    <LedBorder
      className="aspect-square h-[173px] min-w-0 flex-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] lg:aspect-auto lg:h-full lg:min-h-[346px] lg:w-full"
      borderWidth={3}
      borderRadius={16}
    >
      <div
        aria-label={`預測 ${pick.selection}`}
        className="relative block h-full w-full bg-gray-90 text-left"
      >
        <Image
          src="/images/prediction-hero.png"
          alt=""
          fill
          sizes="(max-width: 375px) 45vw, 200px"
          className="object-cover object-[center_20%]"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center text-white">
          <p className="mt-3 rounded-xl bg-black/50 px-3 py-1 text-sm font-bold leading-none">
            預測:
          </p>
          <div className="flex flex-1 items-center justify-center px-2">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-black/50 px-3 py-2.5 text-center sm:px-4 sm:py-3">
              <span className="max-w-full text-[28px] font-bold leading-tight tracking-tight sm:text-[32px] lg:text-5xl">
                {label}
              </span>
              {value && (
                <span className="max-w-full text-[22px] font-bold leading-none tracking-tight text-orange-30 sm:text-2xl lg:text-4xl">
                  {value}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </LedBorder>
  );
}
