import { createFootballAPI } from "./hkjc/graphql-client.js";
import type { MatchScore } from "./pick-settlement.js";

type HkjcCombination = {
  str?: string;
  status?: string;
  selections?: Array<{ str?: string; name_ch?: string }>;
};

type HkjcPool = {
  oddsType?: string;
  lines?: Array<{ combinations?: HkjcCombination[] }>;
};

export type HkjcSettlementData = {
  score: MatchScore | null;
  totalGoals: number | null;
  pools: HkjcPool[];
};

const settlementCache = new Map<
  string,
  { data: HkjcSettlementData | null; expiresAt: number }
>();
const SETTLEMENT_CACHE_TTL_MS = Number(
  process.env.WIN_RATE_SETTLEMENT_CACHE_MS ?? 30 * 60 * 1000,
);

function parseScoreString(value: string | undefined): MatchScore | null {
  if (!value) return null;
  const normalized = value.replace(/^0+(\d)/, "$1");
  const match = normalized.match(/(\d+)\s*[:：]\s*(\d+)/);
  if (!match?.[1] || !match[2]) return null;
  const homeGoals = Number.parseInt(match[1], 10);
  const awayGoals = Number.parseInt(match[2], 10);
  if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return null;
  return { homeGoals, awayGoals };
}

function parseTotalGoals(value: string | undefined): number | null {
  if (!value) return null;
  if (value.endsWith("+")) {
    const base = Number.parseInt(value.slice(0, -1), 10);
    return Number.isFinite(base) ? base : null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function findWinningCombination(pool: HkjcPool | undefined): HkjcCombination | null {
  for (const line of pool?.lines ?? []) {
    for (const combo of line.combinations ?? []) {
      if (combo.status === "WIN") return combo;
    }
  }
  return null;
}

function findCombination(
  pool: HkjcPool | undefined,
  combStr: string,
): HkjcCombination | null {
  for (const line of pool?.lines ?? []) {
    for (const combo of line.combinations ?? []) {
      if (combo.str === combStr) return combo;
    }
  }
  return null;
}

export function parseSettlementFromPools(pools: HkjcPool[]): HkjcSettlementData {
  const crsPool = pools.find((pool) => pool.oddsType === "CRS");
  const ttgPool = pools.find((pool) => pool.oddsType === "TTG");

  const crsWin = findWinningCombination(crsPool);
  const crsScore =
    parseScoreString(crsWin?.selections?.[0]?.str) ??
    parseScoreString(crsWin?.str);

  const ttgWin = findWinningCombination(ttgPool);
  const totalGoals = parseTotalGoals(ttgWin?.str ?? ttgWin?.selections?.[0]?.str);

  return {
    score: crsScore,
    totalGoals,
    pools,
  };
}

export async function fetchHkjcSettlementData(
  matchId: string,
): Promise<HkjcSettlementData | null> {
  const cached = settlementCache.get(matchId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const api = createFootballAPI();
  try {
    const detail = (await api.getHistoricFootballMatchDetails(matchId, [
      "HAD",
      "HDC",
      "HIL",
      "CRS",
      "TTG",
    ])) as { foPools?: HkjcPool[]; additionalResults?: { results?: Array<{ homeResult?: string | number; awayResult?: string | number; resultType?: number }> } } | null;

    if (!detail) {
      settlementCache.set(matchId, {
        data: null,
        expiresAt: Date.now() + SETTLEMENT_CACHE_TTL_MS,
      });
      return null;
    }

    const fromPools = parseSettlementFromPools(detail.foPools ?? []);
    const additional = detail.additionalResults?.results ?? [];
    const fullTime =
      additional.find((result) => result.resultType === 1) ??
      additional[additional.length - 1];
    const homeGoals = Number(fullTime?.homeResult);
    const awayGoals = Number(fullTime?.awayResult);
    const fromAdditional =
      Number.isFinite(homeGoals) && Number.isFinite(awayGoals)
        ? { homeGoals, awayGoals }
        : null;

    const data: HkjcSettlementData = {
      score: fromAdditional ?? fromPools.score,
      totalGoals:
        fromPools.totalGoals ??
        (fromAdditional
          ? fromAdditional.homeGoals + fromAdditional.awayGoals
          : null),
      pools: detail.foPools ?? [],
    };

    settlementCache.set(matchId, {
      data,
      expiresAt: Date.now() + SETTLEMENT_CACHE_TTL_MS,
    });
    return data;
  } catch (error) {
    console.warn(`HKJC settlement fetch failed for ${matchId}:`, error);
    settlementCache.set(matchId, {
      data: null,
      expiresAt: Date.now() + 60_000,
    });
    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker(),
  );
  await Promise.all(workers);
  return results;
}

export async function resolveHkjcSettlementBatch(
  matchIds: string[],
): Promise<Map<string, HkjcSettlementData>> {
  const uniqueIds = [...new Set(matchIds)];
  const results = new Map<string, HkjcSettlementData>();
  const missing: string[] = [];

  for (const matchId of uniqueIds) {
    const cached = settlementCache.get(matchId);
    if (cached && cached.expiresAt > Date.now() && cached.data) {
      results.set(matchId, cached.data);
      continue;
    }
    missing.push(matchId);
  }

  const concurrency = Number(process.env.WIN_RATE_FETCH_CONCURRENCY ?? 8);
  const fetched = await mapWithConcurrency(missing, concurrency, async (matchId) => {
    const data = await fetchHkjcSettlementData(matchId);
    return { matchId, data };
  });

  for (const entry of fetched) {
    if (entry.data) {
      results.set(entry.matchId, entry.data);
    }
  }

  return results;
}

export function mapHkjcCombinationStatus(
  status: string | undefined,
): "won" | "lost" | "push" | null {
  if (!status) return null;
  if (
    status === "WIN" ||
    (status.startsWith("HALF") && status.includes("WIN"))
  ) {
    return "won";
  }
  if (
    status === "LOSE" ||
    (status.startsWith("HALF") && status.includes("LOSE"))
  ) {
    return "lost";
  }
  if (status === "DRAW") return "push";
  return null;
}

export function findHadCombinationStatus(
  pools: HkjcPool[],
  combStr: "H" | "D" | "A",
): "won" | "lost" | "push" | null {
  const hadPool = pools.find((pool) => pool.oddsType === "HAD");
  const combo = findCombination(hadPool, combStr);
  return mapHkjcCombinationStatus(combo?.status);
}

export function findHilCombinationStatus(
  pools: HkjcPool[],
  combStr: "H" | "L",
  lineIndex = 0,
): "won" | "lost" | "push" | null {
  const hilPool = pools.find((pool) => pool.oddsType === "HIL");
  const line = hilPool?.lines?.[lineIndex];
  const combo = line?.combinations?.find((entry) => entry.str === combStr);
  return mapHkjcCombinationStatus(combo?.status);
}

export function findHdcCombinationStatus(
  pools: HkjcPool[],
  combStr: "H" | "A",
  lineIndex = 0,
): "won" | "lost" | "push" | null {
  const hdcPool = pools.find((pool) => pool.oddsType === "HDC");
  const line = hdcPool?.lines?.[lineIndex];
  const combo = line?.combinations?.find((entry) => entry.str === combStr);
  return mapHkjcCombinationStatus(combo?.status);
}
