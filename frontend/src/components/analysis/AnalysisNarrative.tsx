import type { ReactNode } from "react";

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
};

export function AnalysisNarrative({
  narrative,
  riskFlags = [],
}: AnalysisNarrativeProps) {
  const paragraphs = narrative.split(/\n\n+/);

  return (
    <section className="flex w-full flex-col gap-3 rounded-[24px] bg-gray-90 p-4">
      <h2 className="text-base font-bold text-white">AI 量化覆盤</h2>

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

      <div className="flex flex-col gap-3 text-sm leading-[1.7] text-gray-40">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{renderInlineMarkdown(paragraph)}</p>
        ))}
      </div>
    </section>
  );
}
