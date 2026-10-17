"use client";

import Image from "next/image";
import { LedBorder } from "@/components/motion/LedBorder";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { formatPickSelection, type PickContext } from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";
import type { AnalysisPick } from "@/types/analysis";

type PredictionPickCardProps = {
  pick: AnalysisPick;
  /** Team names (and the AI's English wording, if it applies) for the English pick. */
  pickContext?: PickContext;
  matchId: string;
};

/** Labels longer than this get a smaller font so English team names fit the card. */
const LONG_LABEL_CHARS = 9;

function splitPickSelection(
  selection: string,
  locale: Locale,
): { label: string; value: string } {
  const normalized = selection.trim();
  if (locale === "en") {
    // "Over 2.5", "Home -0.5/-1", "Germany -1"
    const lineMatch = normalized.match(/^(.+?)\s+([-+]?\d[\d./+-]*)$/);
    if (lineMatch?.[2]) {
      return { label: lineMatch[1], value: lineMatch[2] };
    }
    return { label: normalized, value: "" };
  }
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

export function PredictionPickCard({ pick, pickContext }: PredictionPickCardProps) {
  const { locale, t } = useI18n();
  const selection = formatPickSelection(pick.selection, locale, pickContext);
  const { label, value } = splitPickSelection(selection, locale);
  const longLabel = locale === "en" && label.length > LONG_LABEL_CHARS;

  return (
    <LedBorder
      className="aspect-square h-[173px] min-w-0 flex-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] lg:aspect-auto lg:h-full lg:min-h-[346px] lg:w-full"
      borderWidth={3}
      borderRadius={16}
    >
      <div
        aria-label={t.matchDetail.pick.ariaLabel(selection)}
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
            {t.matchDetail.pick.heading}
          </p>
          <div className="flex min-w-0 max-w-full flex-1 items-center justify-center px-2">
            <div className="flex min-w-0 max-w-full flex-col items-center gap-1 rounded-xl bg-black/50 px-3 py-2.5 text-center sm:px-4 sm:py-3">
              <span
                className={cn(
                  "max-w-full text-[28px] font-bold leading-tight tracking-tight sm:text-[32px] lg:text-5xl",
                  longLabel &&
                    "break-words text-lg leading-snug sm:text-xl lg:text-3xl",
                )}
              >
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
