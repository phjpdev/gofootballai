import {
  matchAnalysisSchema,
  type MatchAnalysisData,
} from "./analysis-schema.js";
import { normalizeGrokAnalysis } from "./normalize-analysis.js";
import {
  buildMatchAnalysisUserPrompt,
  MATCH_ANALYSIS_SYSTEM_PROMPT,
} from "./prompts/match-analysis-v1.js";

const XAI_API_URL = "https://api.x.ai/v1/chat/completions";
const GROK_TIMEOUT_MS = Number(process.env.XAI_TIMEOUT_MS ?? 12_000);

type GrokResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

export type GrokAnalysisResult = {
  analysis: MatchAnalysisData;
  rawResponse: unknown;
  model: string;
};

function getApiKey(): string {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    throw new Error("XAI_API_KEY is not configured");
  }
  return key;
}

function getModel(): string {
  return process.env.XAI_MODEL ?? "grok-3-fast-latest";
}

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new Error("Grok response did not contain JSON");
}

async function callGrok(matchOddsBlock: string): Promise<GrokAnalysisResult> {
  const model = getModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROK_TIMEOUT_MS);

  try {
    const response = await fetch(XAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: MATCH_ANALYSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: buildMatchAnalysisUserPrompt(matchOddsBlock),
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Grok API error ${response.status}: ${body}`);
    }

    const payload = (await response.json()) as GrokResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Grok returned empty content");
    }

    const parsed = extractJson(content);
    const analysis = matchAnalysisSchema.parse(normalizeGrokAnalysis(parsed));

    return {
      analysis,
      rawResponse: payload,
      model,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Grok API 逾時，請稍後再試");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateMatchAnalysis(
  matchOddsBlock: string,
): Promise<GrokAnalysisResult> {
  return callGrok(matchOddsBlock);
}
