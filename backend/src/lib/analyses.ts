import { randomUUID } from "node:crypto";
import type { MatchAnalysisData } from "./analysis-schema.js";
import { resolveConfidenceScore } from "./normalize-analysis.js";
import { query } from "./db.js";
import type { HkjcInputSnapshot } from "./hkjc/types.js";
import { MATCH_ANALYSIS_PROMPT_VERSION } from "./prompts/match-analysis-v1.js";

export type AnalysisStatus = "pending" | "completed" | "failed";

export type MatchAnalysisRow = {
  id: string;
  hkjc_match_id: string;
  front_end_id: string | null;
  status: AnalysisStatus;
  model: string | null;
  prompt_version: string;
  input_snapshot: HkjcInputSnapshot | null;
  analysis: MatchAnalysisData | null;
  raw_response: unknown | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
  expires_at: Date | null;
};

function computeExpiresAt(kickOffTime: string): Date {
  const kickOff = new Date(kickOffTime);
  const fourHoursAfterKickOff = new Date(
    (Number.isNaN(kickOff.getTime()) ? Date.now() : kickOff.getTime()) +
      4 * 60 * 60 * 1000,
  );
  const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return fourHoursAfterKickOff > twentyFourHoursFromNow
    ? fourHoursAfterKickOff
    : twentyFourHoursFromNow;
}

const PENDING_STALE_MS = Number(process.env.ANALYSIS_PENDING_STALE_MS ?? 45_000);

export function isPendingStale(row: MatchAnalysisRow): boolean {
  if (row.status !== "pending") return false;
  return Date.now() - new Date(row.updated_at).getTime() > PENDING_STALE_MS;
}

export function isAnalysisStale(row: MatchAnalysisRow): boolean {
  if (row.status === "completed") return false;
  if (row.status === "pending") return isPendingStale(row);
  if (row.status === "failed") return true;
  if (!row.expires_at) return true;
  return row.expires_at.getTime() <= Date.now();
}

export function needsAnalysis(row: MatchAnalysisRow | null): boolean {
  if (!row) return true;
  if (row.status === "completed") return false;
  if (row.status === "pending" && !isPendingStale(row)) return false;
  return true;
}

export async function getAnalysisByMatchId(
  matchId: string,
  promptVersion = MATCH_ANALYSIS_PROMPT_VERSION,
): Promise<MatchAnalysisRow | null> {
  const result = await query<MatchAnalysisRow>(
    `SELECT *
     FROM match_analyses
     WHERE hkjc_match_id = $1 AND prompt_version = $2
     ORDER BY updated_at DESC
     LIMIT 1`,
    [matchId, promptVersion],
  );
  return result.rows[0] ?? null;
}

const MAX_SCORE_LOOKUP = Number(process.env.ANALYSIS_SCORE_LOOKUP_MAX ?? 100);

export async function getAnalysisScoresByMatchIds(
  matchIds: string[],
  promptVersion = MATCH_ANALYSIS_PROMPT_VERSION,
): Promise<
  Array<{
    matchId: string;
    status: "pending" | "completed" | "failed" | "missing";
    confidenceScore?: number;
  }>
> {
  const uniqueIds = [...new Set(matchIds)].slice(0, MAX_SCORE_LOOKUP);
  if (uniqueIds.length === 0) return [];

  const result = await query<
    Pick<MatchAnalysisRow, "hkjc_match_id" | "status" | "analysis">
  >(
    `SELECT hkjc_match_id, status, analysis
     FROM match_analyses
     WHERE prompt_version = $1
       AND hkjc_match_id = ANY($2::text[])`,
    [promptVersion, uniqueIds],
  );

  const rowById = new Map(
    result.rows.map((row) => [row.hkjc_match_id, row]),
  );

  return uniqueIds.map((matchId) => {
    const row = rowById.get(matchId);
    if (!row) {
      return { matchId, status: "missing" as const };
    }

    return {
      matchId,
      status: row.status,
      confidenceScore: row.analysis
        ? patchAnalysisConfidence(row.analysis).confidenceScore
        : undefined,
    };
  });
}

export async function upsertPendingAnalysis(input: {
  matchId: string;
  frontEndId: string;
  snapshot: HkjcInputSnapshot;
  promptVersion?: string;
  resetCompleted?: boolean;
}): Promise<MatchAnalysisRow> {
  const promptVersion = input.promptVersion ?? MATCH_ANALYSIS_PROMPT_VERSION;
  const expiresAt = computeExpiresAt(input.snapshot.kickOffTime);
  const id = randomUUID();
  const resetCompleted = input.resetCompleted ?? false;

  const result = await query<MatchAnalysisRow>(
    `INSERT INTO match_analyses (
       id, hkjc_match_id, front_end_id, status, prompt_version,
       input_snapshot, expires_at
     )
     VALUES ($1, $2, $3, 'pending', $4, $5, $6)
     ON CONFLICT (hkjc_match_id, prompt_version)
     DO UPDATE SET
       status = CASE
         WHEN match_analyses.status = 'completed' AND NOT $7
         THEN match_analyses.status
         ELSE 'pending'
       END,
       front_end_id = EXCLUDED.front_end_id,
       input_snapshot = EXCLUDED.input_snapshot,
       expires_at = EXCLUDED.expires_at,
       updated_at = NOW(),
       error_message = NULL
     RETURNING *`,
    [
      id,
      input.matchId,
      input.frontEndId,
      promptVersion,
      JSON.stringify(input.snapshot),
      expiresAt.toISOString(),
      resetCompleted,
    ],
  );

  return result.rows[0];
}

export async function markAnalysisCompleted(input: {
  matchId: string;
  promptVersion: string;
  model: string;
  snapshot: HkjcInputSnapshot;
  analysis: MatchAnalysisData;
  rawResponse: unknown;
}): Promise<MatchAnalysisRow> {
  const expiresAt = computeExpiresAt(input.snapshot.kickOffTime);

  const result = await query<MatchAnalysisRow>(
    `UPDATE match_analyses
     SET status = 'completed',
         model = $3,
         input_snapshot = $4,
         analysis = $5,
         raw_response = $6,
         error_message = NULL,
         expires_at = $7,
         updated_at = NOW()
     WHERE hkjc_match_id = $1 AND prompt_version = $2
     RETURNING *`,
    [
      input.matchId,
      input.promptVersion,
      input.model,
      JSON.stringify(input.snapshot),
      JSON.stringify(input.analysis),
      JSON.stringify(input.rawResponse),
      expiresAt.toISOString(),
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Analysis row not found for completion");
  }

  return result.rows[0];
}

export async function markAnalysisFailed(input: {
  matchId: string;
  promptVersion: string;
  errorMessage: string;
}): Promise<MatchAnalysisRow | null> {
  const result = await query<MatchAnalysisRow>(
    `UPDATE match_analyses
     SET status = 'failed',
         error_message = $3,
         updated_at = NOW()
     WHERE hkjc_match_id = $1 AND prompt_version = $2
     RETURNING *`,
    [input.matchId, input.promptVersion, input.errorMessage],
  );
  return result.rows[0] ?? null;
}

export function patchAnalysisConfidence(
  analysis: MatchAnalysisData,
): MatchAnalysisData {
  const confidenceScore = resolveConfidenceScore({
    confidenceScore: analysis.confidenceScore,
    dimensions: analysis.dimensions,
    recommendationLevel: analysis.recommendationLevel,
  });

  if (confidenceScore === analysis.confidenceScore) {
    return analysis;
  }

  return { ...analysis, confidenceScore };
}

export function toPublicAnalysis(row: MatchAnalysisRow | null) {
  if (!row) {
    return {
      matchId: "",
      status: "missing" as const,
      analysis: null,
    };
  }

  const analysis = row.analysis ? patchAnalysisConfidence(row.analysis) : null;

  return {
    matchId: row.hkjc_match_id,
    status: row.status,
    analysis,
    error: row.error_message ?? undefined,
    expiresAt: row.expires_at?.toISOString(),
  };
}
