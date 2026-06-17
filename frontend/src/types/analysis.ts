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
  selection: string;
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
};

export type PrewarmResult = {
  matchId: string;
  status: AnalysisStatus;
  confidenceScore?: number;
};
