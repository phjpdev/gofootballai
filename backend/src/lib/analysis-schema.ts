import { z } from "zod";

export const matchAnalysisSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  dimensions: z.object({
    attack: z.number().min(0).max(100),
    possession: z.number().min(0).max(100),
    defense: z.number().min(0).max(100),
    fitness: z.number().min(0).max(100),
    tactics: z.number().min(0).max(100),
    morale: z.number().min(0).max(100),
  }),
  recommendationLevel: z.number().min(1).max(5),
  recommendationLabel: z.string().min(1),
  goalProbabilities: z.object({
    under2: z.number().min(0).max(100),
    exactly2: z.number().min(0).max(100),
    over2: z.number().min(0).max(100),
  }),
  roi: z.number(),
  pick: z.object({
    market: z.string().min(1),
    selection: z.string().min(1),
    odds: z.number().positive(),
    ev: z.string().min(1),
  }),
  riskFlags: z.array(z.string()),
  narrative: z.string().min(1),
  momentum: z.array(z.number()).min(3).max(12),
  scoreTrend: z.array(z.number()).min(3).max(12),
});

export type MatchAnalysisData = z.infer<typeof matchAnalysisSchema>;

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    confidenceScore: { type: "number" },
    dimensions: {
      type: "object",
      properties: {
        attack: { type: "number" },
        possession: { type: "number" },
        defense: { type: "number" },
        fitness: { type: "number" },
        tactics: { type: "number" },
        morale: { type: "number" },
      },
      required: [
        "attack",
        "possession",
        "defense",
        "fitness",
        "tactics",
        "morale",
      ],
    },
    recommendationLevel: { type: "number" },
    recommendationLabel: { type: "string" },
    goalProbabilities: {
      type: "object",
      properties: {
        under2: { type: "number" },
        exactly2: { type: "number" },
        over2: { type: "number" },
      },
      required: ["under2", "exactly2", "over2"],
    },
    roi: { type: "number" },
    pick: {
      type: "object",
      properties: {
        market: { type: "string" },
        selection: { type: "string" },
        odds: { type: "number" },
        ev: { type: "string" },
      },
      required: ["market", "selection", "odds", "ev"],
    },
    riskFlags: { type: "array", items: { type: "string" } },
    narrative: { type: "string" },
    momentum: { type: "array", items: { type: "number" } },
    scoreTrend: { type: "array", items: { type: "number" } },
  },
  required: [
    "confidenceScore",
    "dimensions",
    "recommendationLevel",
    "recommendationLabel",
    "goalProbabilities",
    "roi",
    "pick",
    "riskFlags",
    "narrative",
    "momentum",
    "scoreTrend",
  ],
};
