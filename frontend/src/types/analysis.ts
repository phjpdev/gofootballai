export type AnalysisDimensions = {
  attack: number;
  possession: number;
  defense: number;
  fitness: number;
  tactics: number;
  morale: number;
};

export type AnalysisGoalProbabilities = {
  under2: number;
  exactly2: number;
  over2: number;
};

export type AnalysisPick = {
  market: string;
  /** Always Chinese (it is flipped/overridden as Chinese); format for display. */
  selection: string;
  /** AI translation of `selection`, used only when it can't be mapped in code. */
  selectionEn?: string;
  odds: number;
  ev: string;
};

export type MatchAnalysisResult = {
  confidenceScore: number;
  dimensions: AnalysisDimensions;
  recommendationLevel: number;
  recommendationLabel: string;
  goalProbabilities: AnalysisGoalProbabilities;
  roi: number;
  pick: AnalysisPick;
  riskFlags: string[];
  narrative: string;
  momentum: number[];
  scoreTrend: number[];
};

export type AnalysisStatus = "pending" | "completed" | "failed" | "missing";

export type AnalysisResponse = {
  matchId: string;
  status: AnalysisStatus;
  analysis: MatchAnalysisResult | null;
  error?: string;
  expiresAt?: string;
  /** Language of the text fields. "zh-HK" when English was requested but translation failed. */
  language?: "zh-HK" | "en";
};

export type PrewarmResult = {
  matchId: string;
  status: AnalysisStatus;
  confidenceScore?: number;
};
