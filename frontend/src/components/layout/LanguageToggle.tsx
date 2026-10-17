"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * 中 / EN switch.
 * - "full" (desktop header): both labels, the active one highlighted.
 * - "compact" (mobile floating button): only the language you would switch to.
 */
export function LanguageToggle({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const next = locale === "en" ? "zh-HK" : "en";
  const { language } = t.layout;

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => setLocale(next)}
        aria-label={language.switchTo}
        title={language.switchTo}
        className={cn(
          "flex h-9 items-center gap-1 rounded-full border border-gray-80 bg-gray-90/90 px-3 text-xs font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur",
          className,
        )}
      >
        <Languages className="size-4 text-orange-50" aria-hidden />
        {next === "en" ? language.en : language.zh}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={language.switchTo}
      title={language.switchTo}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gray-90 px-2.5 text-xs font-semibold text-gray-40 transition-colors hover:text-white",
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      <span className={cn(locale === "zh-HK" && "text-orange-50")}>
        {language.zh}
      </span>
      <span aria-hidden className="text-gray-60">
        /
      </span>
      <span className={cn(locale === "en" && "text-orange-50")}>
        {language.en}
      </span>
    </button>
  );
}
