function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function toPercent(value: unknown): number {
  const n = toNumber(value);
  if (n === null) return 0;
  if (n >= 0 && n <= 1) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function formatEv(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  const n = toNumber(value);
  if (n === null) return "+EV";
  if (n > 0 && n <= 1) return `+${Math.round(n * 100)}%`;
  if (n > 0) return `+${n}%`;
  return `${n}%`;
}

function averageDimensionScore(
  dimensions: Record<string, number>,
): number | null {
  const values = Object.values(dimensions).filter(
    (value) => typeof value === "number" && !Number.isNaN(value),
  );
  if (values.length === 0) return null;
  const avg = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  return avg > 0 ? avg : null;
}

export function resolveConfidenceScore(input: {
  confidenceScore?: unknown;
  dimensions: Record<string, number>;
  recommendationLevel: number;
}): number {
  const raw = toNumber(input.confidenceScore);
  if (raw !== null && raw > 0) {
    return Math.min(100, Math.max(0, Math.round(raw)));
  }

  const fromDimensions = averageDimensionScore(input.dimensions);
  if (fromDimensions !== null) return fromDimensions;

  return Math.min(100, Math.max(1, input.recommendationLevel * 20));
}

function normalizeGoalProbabilities(raw: Record<string, unknown>) {
  const source =
    asRecord(raw.goalProbabilities) ??
    asRecord(raw.goal_probabilities) ??
    asRecord(raw.probabilities);

  if (!source) {
    return { under2: 33, exactly2: 34, over2: 33 };
  }

  return {
    under2: toPercent(
      source.under2 ??
        source.under_2 ??
        source["0-1 goals"] ??
        source["0-1球"] ??
        source.under,
    ),
    exactly2: toPercent(
      source.exactly2 ??
        source.exactly_2 ??
        source["exactly 2 goals"] ??
        source["剛好2球"] ??
        source.exactly,
    ),
    over2: toPercent(
      source.over2 ??
        source.over_2 ??
        source["3+ goals"] ??
        source["3球或以上"] ??
        source.over,
    ),
  };
}

function normalizePick(raw: Record<string, unknown>) {
  const pick = asRecord(raw.pick);
  if (!pick) {
    return {
      market: "HAD",
      selection: "待定",
      odds: 1.01,
      ev: "+EV",
    };
  }

  const odds = toNumber(pick.odds) ?? 1.01;
  return {
    market: String(pick.market ?? pick.type ?? "HAD"),
    selection: String(pick.selection ?? pick.side ?? pick.bet ?? "待定"),
    odds: odds > 0 ? odds : 1.01,
    ev: formatEv(pick.ev ?? pick.expectedValue ?? pick.expected_value),
  };
}

function normalizeSeries(
  value: unknown,
  fallback: number[],
  scaleSmallDecimals = false,
): number[] {
  if (!Array.isArray(value) || value.length < 3) return fallback;

  const numbers = value
    .map(toNumber)
    .filter((entry): entry is number => entry !== null);
  if (numbers.length < 3) return fallback;

  if (scaleSmallDecimals && numbers.every((n) => n >= 0 && n <= 10)) {
    return numbers.map((n) => Math.round(n * 100));
  }

  return numbers;
}

export function normalizeGrokAnalysis(raw: unknown): unknown {
  const input = asRecord(raw);
  if (!input) return raw;

  const dimensions = asRecord(input.dimensions) ?? {};
  const normalizedDimensions = {
    attack: toNumber(dimensions.attack) ?? 50,
    possession: toNumber(dimensions.possession) ?? 50,
    defense: toNumber(dimensions.defense) ?? 50,
    fitness: toNumber(dimensions.fitness) ?? 50,
    tactics: toNumber(dimensions.tactics) ?? 50,
    morale: toNumber(dimensions.morale) ?? 50,
  };

  const recommendationLevel = Math.min(
    5,
    Math.max(1, Math.round(toNumber(input.recommendationLevel) ?? 3)),
  );

  const confidenceScore = resolveConfidenceScore({
    confidenceScore: input.confidenceScore ?? input.confidence_score,
    dimensions: normalizedDimensions,
    recommendationLevel,
  });

  const roiRaw = toNumber(input.roi);
  const roi =
    roiRaw === null
      ? 0
      : roiRaw > 0 && roiRaw <= 1
        ? Math.round(roiRaw * 1000) / 10
        : roiRaw;

  return {
    confidenceScore,
    dimensions: normalizedDimensions,
    recommendationLevel,
    recommendationLabel: String(
      input.recommendationLabel ?? input.recommendation_label ?? "戰術觀望",
    ),
    goalProbabilities: normalizeGoalProbabilities(input),
    roi,
    pick: normalizePick(input),
    riskFlags: Array.isArray(input.riskFlags)
      ? input.riskFlags.map(String)
      : Array.isArray(input.risk_flags)
        ? input.risk_flags.map(String)
        : [],
    narrative: String(input.narrative ?? input.summary ?? "暫無分析摘要"),
    momentum: normalizeSeries(input.momentum, [45, 50, 55, 60, 58, 62, 65]),
    scoreTrend: normalizeSeries(
      input.scoreTrend ?? input.score_trend,
      [400, 450, 520, 580, 540, 610, 650],
      true,
    ),
  };
}
