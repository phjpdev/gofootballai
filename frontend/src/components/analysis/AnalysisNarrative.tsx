"use client";

import type { ReactNode } from "react";
import { Languages, Loader2 } from "lucide-react";
import type { AnalysisLanguageStatus } from "@/components/analysis/MatchAnalysisView";
import { useI18n } from "@/lib/i18n/LocaleProvider";

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

type AnalysisNarrativeProps = {
  narrative: string;
  riskFlags?: string[];
  languageStatus?: AnalysisLanguageStatus;
};

export function AnalysisNarrative({
  narrative,
  riskFlags = [],
  languageStatus = null,
}: AnalysisNarrativeProps) {
  const { t } = useI18n();
  const paragraphs = narrative.split(/\n\n+/);

  return (
    <section className="flex w-full flex-col gap-3 rounded-[24px] bg-gray-90 p-4 lg:gap-4 lg:border lg:border-gray-80/80 lg:bg-gray-80/30 lg:p-6">
      <h2 className="text-base font-bold text-white lg:text-lg">
        {t.matchDetail.narrative.title}
      </h2>

      {languageStatus && (
        <p
          role="status"
          className="flex items-start gap-1.5 text-xs leading-[1.5] text-gray-40"
        >
          {languageStatus === "switching" ? (
            <Loader2 className="mt-px size-3.5 shrink-0 animate-spin text-orange-50" />
          ) : (
            <Languages className="mt-px size-3.5 shrink-0 text-gray-40" />
          )}
          {languageStatus === "switching"
            ? t.matchDetail.narrative.switching
            : t.matchDetail.narrative.untranslated}
        </p>
      )}

      {riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {riskFlags.map((flag) => (
            <span
              key={flag}
              className="rounded-lg bg-red-500/15 px-2 py-1 text-xs font-medium text-red-300"
            >
              {flag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 text-sm leading-[1.7] text-gray-40 lg:text-base lg:leading-[1.75]">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{renderInlineMarkdown(paragraph)}</p>
        ))}
      </div>
    </section>
  );
}
