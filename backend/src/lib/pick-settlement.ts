import type { HkjcSettlementData } from "./hkjc-match-results.js";
import {
  findHadCombinationStatus,
  mapHkjcCombinationStatus,
} from "./hkjc-match-results.js";
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

const PENDING_SELECTIONS = new Set(["", "待定", "TBD", "N/A", "無"]);

function parseSignedNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLineParts(value: string): number[] {
  return value
    .split("/")
    .map((part) => parseSignedNumber(part))
    .filter((line): line is number => line !== null);
}

function teamNameMatches(candidate: string, teamName: string | undefined): boolean {
  if (!teamName) return false;
  const left = candidate.trim();
  const right = teamName.trim();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function resolveHadComb(
  selection: string,
  snapshot?: HkjcInputSnapshot | null,
): "H" | "D" | "A" | null {
  const normalized = selection.trim();
  if (
    normalized === "主" ||
    normalized === "主勝" ||
    normalized === "主隊勝" ||
    normalized.includes("主勝") ||
    normalized.includes("主隊")
  ) {
    return "H";
  }
  if (
    normalized === "客" ||
    normalized === "客勝" ||
    normalized === "客隊勝" ||
    normalized.includes("客勝") ||
    normalized.includes("客隊")
  ) {
    return "A";
  }
  if (normalized === "和") return "D";

  if (snapshot) {
    if (teamNameMatches(normalized, snapshot.homeTeam)) return "H";
    if (teamNameMatches(normalized, snapshot.awayTeam)) return "A";

    const withoutWin = normalized.replace(/勝$/, "").trim();
    if (teamNameMatches(withoutWin, snapshot.homeTeam)) return "H";
    if (teamNameMatches(withoutWin, snapshot.awayTeam)) return "A";
  }

  return null;
}

function parseSideAndLines(
  selection: string,
  snapshot?: HkjcInputSnapshot | null,
): {
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

  const bracketOnly = normalized.match(/^\[([-+]?[\d./]+)\]$/);
  if (bracketOnly?.[1]) {
    const lines = parseLineParts(bracketOnly[1]);
    if (lines.length === 0) return null;
    return { side: "home", lines };
  }

  const sideLineMatch = normalized.match(
    /^(主|客|和)\s*([-+]?[\d./]+.*)$/,
  );
  if (sideLineMatch?.[1] && sideLineMatch[2]) {
    const label = sideLineMatch[1];
    const side =
      label === "主" ? "home" : label === "客" ? "away" : "draw";
    const lines = parseLineParts(sideLineMatch[2]);
    if (lines.length === 0) return null;
    return { side, lines };
  }

  const teamLineMatch = normalized.match(/^(.+?)([-+]\d[\d./]*)$/);
  if (teamLineMatch?.[1] && teamLineMatch[2] && snapshot) {
    const name = teamLineMatch[1].trim();
    const lines = parseLineParts(teamLineMatch[2]);
    if (lines.length === 0) return null;
    if (teamNameMatches(name, snapshot.homeTeam)) {
      return { side: "home", lines };
    }
    if (teamNameMatches(name, snapshot.awayTeam)) {
      return { side: "away", lines };
    }
  }

  const hadComb = resolveHadComb(normalized, snapshot);
  if (hadComb === "H") return { side: "home", lines: [0] };
  if (hadComb === "A") return { side: "away", lines: [0] };
  if (hadComb === "D") return { side: "draw", lines: [0] };

  return null;
}

function parseOverUnderLines(selection: string): number[] {
  const ouMatch = selection.trim().match(/^([大小])\s*([\d./]+.*)$/);
  if (!ouMatch?.[2]) return [];
  return parseLineParts(ouMatch[2]);
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

function settleHilWithTotalGoals(
  selection: string,
  lines: number[],
  totalGoals: number,
  fallbackLine?: string,
): PickOutcome | null {
  const isOver = selection.startsWith("大");
  const isUnder = selection.startsWith("小");
  if (!isOver && !isUnder) return null;

  const effectiveLines =
    lines.length > 0
      ? lines
      : fallbackLine
        ? parseLineParts(fallbackLine.replace(/[[\]]/g, ""))
        : [];

  if (effectiveLines.length === 0) return null;

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

function settleFromScore(
  pick: AiPick,
  score: MatchScore,
  snapshot?: HkjcInputSnapshot | null,
): PickOutcome | null {
  const selection = pick.selection.trim();
  const market = pick.market.trim().toUpperCase();
  const parsed = parseSideAndLines(selection, snapshot);

  if (market === "HAD") {
    const hadComb = resolveHadComb(selection, snapshot);
    if (hadComb === "H") return settleHad("home", score);
    if (hadComb === "A") return settleHad("away", score);
    if (hadComb === "D") return settleHad("draw", score);
    if (!parsed || parsed.lines[0] !== 0) return null;
    return settleHad(parsed.side, score);
  }

  if (market === "HDC") {
    if (!parsed || parsed.side === "draw") return null;
    return settleHdc(parsed.side, parsed.lines, score);
  }

  if (market === "HIL" || selection.startsWith("大") || selection.startsWith("小")) {
    const lines = parseOverUnderLines(selection);
    return settleHilWithTotalGoals(
      selection,
      lines,
      score.homeGoals + score.awayGoals,
      snapshot?.hilOdds?.line,
    );
  }

  if (!parsed) return null;
  if (parsed.side === "home" || parsed.side === "away") {
    return settleHdc(parsed.side, parsed.lines, score);
  }
  if (parsed.side === "draw") return settleHad("draw", score);
  return null;
}

export function settleAiPickWithHkjc(
  pick: AiPick,
  data: HkjcSettlementData,
  snapshot?: HkjcInputSnapshot | null,
): PickOutcome | null {
  const selection = pick.selection.trim();
  if (PENDING_SELECTIONS.has(selection)) return null;

  const market = pick.market.trim().toUpperCase();

  if (market === "HAD") {
    const hadComb = resolveHadComb(selection, snapshot);
    if (hadComb) {
      const poolOutcome = findHadCombinationStatus(data.pools, hadComb);
      if (poolOutcome) return poolOutcome;
    }
  }

  if (data.score) {
    const fromScore = settleFromScore(pick, data.score, snapshot);
    if (fromScore) return fromScore;
  }

  if (
    (market === "HIL" || selection.startsWith("大") || selection.startsWith("小")) &&
    data.totalGoals !== null
  ) {
    const lines = parseOverUnderLines(selection);
    return settleHilWithTotalGoals(
      selection,
      lines,
      data.totalGoals,
      snapshot?.hilOdds?.line,
    );
  }

  return null;
}

export function settleAiPick(
  pick: AiPick,
  score: MatchScore,
  snapshot?: HkjcInputSnapshot | null,
): PickOutcome | null {
  return settleFromScore(pick, score, snapshot);
}

export function isPickSettlable(kickOffTime: string): boolean {
  const kickOff = new Date(kickOffTime).getTime();
  if (Number.isNaN(kickOff)) return false;
  const settleAfterMs = 105 * 60 * 1000;
  return Date.now() >= kickOff + settleAfterMs;
}

export { mapHkjcCombinationStatus };
