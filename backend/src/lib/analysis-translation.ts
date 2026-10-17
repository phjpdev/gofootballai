import { createHash } from "node:crypto";
import { z } from "zod";
import type { MatchAnalysisData } from "./analysis-schema.js";
import type { MatchAnalysisRow } from "./analyses.js";
import { query } from "./db.js";
import { requestGrokJson } from "./grok.js";

/**
 * English for an analysis's AI-written text, produced on demand by translating
 * the Chinese analysis (not re-analysing), so both languages always show the
 * same pick and numbers. Cached in match_analyses.analysis_en.
 *
 * pick.selection itself stays Chinese everywhere: the frontend flips and
 * overrides it as Chinese and maps it to English for display. The AI's English
 * rendering is only kept as a display fallback (pickSelectionEn).
 */
export type AnalysisEnglish = {
  recommendationLabel: string;
  riskFlags: string[];
  narrative: string;
  pickSelection: string;
  /** Fingerprint of the Chinese text this was translated from. */
  sourceHash: string;
};

export type EnglishAnalysis = MatchAnalysisData & {
  pick: MatchAnalysisData["pick"] & { selectionEn?: string };
};

const translationSchema = z.object({
  recommendationLabel: z.string(),
  riskFlags: z.array(z.string()),
  narrative: z.string().min(1),
  pickSelection: z.string(),
});

const SYSTEM_PROMPT = `You translate football betting analysis from Traditional Chinese (Hong Kong) into natural, punchy English for Hong Kong football bettors.

Rules:
- Translate meaning, not word by word. Keep the confident, data-driven tone.
- Keep the Markdown in "narrative" exactly as structured: bold, lists, headings, line breaks.
- Keep all numbers, odds, percentages, scores and handicap lines exactly as written.
- Keep HKJC market codes as-is: HAD (home/draw/away), HDC (handicap), HIL (hi-lo goals).
- Use the English team and competition names provided; never leave Chinese characters in the output.
- 大 / 小 in goal lines = Over / Under (e.g. 大2.5 → Over 2.5). 主 / 客 / 和 = Home / Away / Draw. 讓 = handicap.
- Betting slang, translate idiomatically and consistently:
  奶力拉滿 → All-in confidence; 低賠毒藥 → Low-odds trap; 正期望值 (+EV) → Positive EV (+EV);
  熔斷 / 封殺 → Hard pass; 均衡盤 → Evenly matched line; 資訊盲區 → Information blind spot;
  強弱撕裂度 → Strength gap; 爆量穿盤 → Line-busting volume; 觀望 → Wait and see.
- "riskFlags" must have the same number of items in the same order.

Return strict JSON only, with exactly these keys:
{"recommendationLabel": string, "riskFlags": string[], "narrative": string, "pickSelection": string}`;

function sourceText(analysis: MatchAnalysisData) {
  return {
    recommendationLabel: analysis.recommendationLabel,
    riskFlags: analysis.riskFlags,
    narrative: analysis.narrative,
    pickSelection: analysis.pick.selection,
  };
}

export function analysisSourceHash(analysis: MatchAnalysisData): string {
  return createHash("sha1")
    .update(JSON.stringify(sourceText(analysis)))
    .digest("hex");
}

function buildUserPrompt(row: MatchAnalysisRow, analysis: MatchAnalysisData): string {
  const snapshot = row.input_snapshot;
  const names = snapshot
    ? [
        `Home team: ${snapshot.homeTeam} = ${snapshot.homeTeamEn || "(no English name)"}`,
        `Away team: ${snapshot.awayTeam} = ${snapshot.awayTeamEn || "(no English name)"}`,
        `Competition: ${snapshot.tournamentName} = ${snapshot.tournamentNameEn || "(no English name)"}`,
      ].join("\n")
    : "";
  return `${names}\n\nTranslate the values of this JSON into English:\n\n${JSON.stringify(sourceText(analysis))}`;
}

const TRANSLATE_ATTEMPTS = 2;

async function translate(
  row: MatchAnalysisRow,
  analysis: MatchAnalysisData,
): Promise<Omit<AnalysisEnglish, "sourceHash">> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= TRANSLATE_ATTEMPTS; attempt += 1) {
    try {
      const { json } = await requestGrokJson({
        system: SYSTEM_PROMPT,
        user: buildUserPrompt(row, analysis),
        temperature: 0.1,
        // English runs longer than Chinese in tokens; leave the narrative room.
        maxTokens: 1800,
      });
      return translationSchema.parse(json);
    } catch (error) {
      lastError = error;
      const transient =
        error instanceof Error &&
        (error.message.includes("逾時") ||
          error.message.includes("fetch failed") ||
          /Grok API error (?:429|5\d\d)/.test(error.message));
      if (!transient || attempt >= TRANSLATE_ATTEMPTS) break;
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}

const inFlight = new Map<string, Promise<AnalysisEnglish | null>>();

/** Recent failures, so a broken translation doesn't call Grok on every page view. */
const failedAt = new Map<string, number>();
const FAILURE_COOLDOWN_MS = Number(
  process.env.ANALYSIS_TRANSLATION_COOLDOWN_MS ?? 60_000,
);

/**
 * Cached English for a completed analysis, translating it now if needed.
 * Returns null when translation is unavailable; callers then serve Chinese.
 */
export async function getAnalysisEnglish(
  row: MatchAnalysisRow,
): Promise<AnalysisEnglish | null> {
  const analysis = row.analysis;
  if (!analysis) return null;

  const hash = analysisSourceHash(analysis);
  if (row.analysis_en?.sourceHash === hash) return row.analysis_en;

  const key = `${row.hkjc_match_id}:${row.prompt_version}:${hash}`;
  const lastFailure = failedAt.get(key);
  if (lastFailure && Date.now() - lastFailure < FAILURE_COOLDOWN_MS) {
    return null;
  }

  const pending = inFlight.get(key);
  if (pending) return pending;

  const task = (async () => {
    try {
      const english: AnalysisEnglish = {
        ...(await translate(row, analysis)),
        sourceHash: hash,
      };
      await query(
        `UPDATE match_analyses SET analysis_en = $3
         WHERE hkjc_match_id = $1 AND prompt_version = $2`,
        [row.hkjc_match_id, row.prompt_version, JSON.stringify(english)],
      );
      failedAt.delete(key);
      return english;
    } catch (error) {
      if (failedAt.size > 500) failedAt.clear();
      failedAt.set(key, Date.now());
      console.error(
        `Analysis translation failed for ${row.hkjc_match_id}:`,
        error instanceof Error ? error.message : error,
      );
      return null;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, task);
  return task;
}

export function applyAnalysisEnglish(
  analysis: MatchAnalysisData,
  english: AnalysisEnglish,
): EnglishAnalysis {
  return {
    ...analysis,
    recommendationLabel: english.recommendationLabel || analysis.recommendationLabel,
    riskFlags: english.riskFlags,
    narrative: english.narrative,
    pick: { ...analysis.pick, selectionEn: english.pickSelection || undefined },
  };
}
