import type { HkjcInputSnapshot } from "./hkjc/types.js";

export type PickOutcome = "won" | "lost" | "push";

export type MatchScore = {
  homeGoals: number;
  awayGoals: number;
};

export type AiPick = {
  market: string;
  selection: string;
};

const PENDING_SELECTIONS = new Set(["", "待定", "TBD", "N/A"]);

function parseSignedNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSideAndLines(selection: string): {
  side: "home" | "away" | "draw";
  lines: number[];
} | null {
  const normalized = selection.trim();
  if (!normalized) return null;

  if (normalized === "主" || normalized === "和" || normalized === "客") {
    return {
      side:
        normalized === "主" ? "home" : normalized === "客" ? "away" : "draw",
      lines: [0],
    };
  }

  const sideLineMatch = normalized.match(
    /^([\u4e00-\u9fff]+)\s*([-+]?[\d./]+.*)$/,
  );
  if (sideLineMatch?.[1] && sideLineMatch[2]) {
    const label = sideLineMatch[1];
    const side =
      label === "主" ? "home" : label === "客" ? "away" : label === "和" ? "draw" : null;
    if (!side) return null;

    const lines = sideLineMatch[2]
      .split("/")
      .map((part) => parseSignedNumber(part))
      .filter((line): line is number => line !== null);
    if (lines.length === 0) return null;
    return { side, lines };
  }

  return null;
}

function parseOverUnderLines(selection: string): number[] {
  const ouMatch = selection.trim().match(/^([大小])\s*([\d./]+.*)$/);
  if (!ouMatch?.[2]) return [];

  return ouMatch[2]
    .split("/")
    .map((part) => parseSignedNumber(part))
    .filter((line): line is number => line !== null);
}

function settleHad(
  side: "home" | "away" | "draw",
  score: MatchScore,
): PickOutcome {
  const { homeGoals, awayGoals } = score;
  if (homeGoals > awayGoals) {
    return side === "home" ? "won" : "lost";
  }
  if (homeGoals < awayGoals) {
    return side === "away" ? "won" : "lost";
  }
  return side === "draw" ? "won" : "lost";
}

function settleSingleHandicap(
  score: MatchScore,
  side: "home" | "away",
  line: number,
): PickOutcome {
  const pickedGoals = side === "home" ? score.homeGoals : score.awayGoals;
  const opponentGoals = side === "home" ? score.awayGoals : score.homeGoals;
  const adjusted = pickedGoals + line;

  if (adjusted > opponentGoals) return "won";
  if (adjusted < opponentGoals) return "lost";
  return "push";
}

function combineSplitOutcomes(outcomes: PickOutcome[]): PickOutcome {
  if (outcomes.length === 0) return "push";
  if (outcomes.every((outcome) => outcome === "won")) return "won";
  if (outcomes.every((outcome) => outcome === "lost")) return "lost";
  if (outcomes.includes("won")) return "won";
  if (outcomes.includes("lost")) return "lost";
  return "push";
}

function settleHdc(
  side: "home" | "away",
  lines: number[],
  score: MatchScore,
): PickOutcome {
  const outcomes = lines.map((line) =>
    settleSingleHandicap(score, side, line),
  );
  return combineSplitOutcomes(outcomes);
}

function settleHil(
  selection: string,
  lines: number[],
  score: MatchScore,
  fallbackLine?: string,
): PickOutcome | null {
  const isOver = selection.startsWith("大");
  const isUnder = selection.startsWith("小");
  if (!isOver && !isUnder) return null;

  const effectiveLines =
    lines.length > 0
      ? lines
      : fallbackLine
        ? fallbackLine
            .split("/")
            .map((part) => parseSignedNumber(part))
            .filter((line): line is number => line !== null)
        : [];

  if (effectiveLines.length === 0) return null;

  const totalGoals = score.homeGoals + score.awayGoals;
  const outcomes = effectiveLines.map((line) => {
    if (isOver) {
      if (totalGoals > line) return "won";
      if (totalGoals < line) return "lost";
      return "push";
    }
    if (totalGoals < line) return "won";
    if (totalGoals > line) return "lost";
    return "push";
  });

  return combineSplitOutcomes(outcomes);
}

export function settleAiPick(
  pick: AiPick,
  score: MatchScore,
  snapshot?: HkjcInputSnapshot | null,
): PickOutcome | null {
  const selection = pick.selection.trim();
  if (PENDING_SELECTIONS.has(selection)) return null;

  const market = pick.market.trim().toUpperCase();
  const parsed = parseSideAndLines(selection);

  if (market === "HAD") {
    if (selection === "和") return settleHad("draw", score);
    if (selection === "主") return settleHad("home", score);
    if (selection === "客") return settleHad("away", score);
    if (!parsed || parsed.lines[0] !== 0) return null;
    return settleHad(parsed.side, score);
  }

  if (market === "HDC") {
    if (!parsed || parsed.side === "draw") return null;
    return settleHdc(parsed.side, parsed.lines, score);
  }

  if (market === "HIL" || selection.startsWith("大") || selection.startsWith("小")) {
    const lines = parseOverUnderLines(selection);
    return settleHil(selection, lines, score, snapshot?.hilOdds?.line);
  }

  if (!parsed) return null;

  if (parsed.side === "home" || parsed.side === "away") {
    return settleHdc(parsed.side, parsed.lines, score);
  }

  if (parsed.side === "draw") {
    return settleHad("draw", score);
  }

  return null;
}

export function isPickSettlable(kickOffTime: string): boolean {
  const kickOff = new Date(kickOffTime).getTime();
  if (Number.isNaN(kickOff)) return false;
  const settleAfterMs = 105 * 60 * 1000;
  return Date.now() >= kickOff + settleAfterMs;
}
