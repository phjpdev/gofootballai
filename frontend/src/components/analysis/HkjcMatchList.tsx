"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DatePicker } from "@/components/layout/DatePicker";
import { SubNav } from "@/components/layout/SubNav";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { HkjcMatchCard } from "@/components/cards/HkjcMatchCard";
import { filterMatchesByDate } from "@/lib/hkjc/transform";
import { fetchAnalysisScores, prewarmAnalyses } from "@/lib/analyses-api";
import {
  fetchArchivedDates,
  fetchArchivedMatches,
} from "@/lib/hkjc/archived-matches-api";
import { enrichArchivedMatches } from "@/lib/hkjc/enrich-archived-logos";
import {
  ADMIN_PAST_TAB_COUNT,
  buildAdminPastDateItems,
} from "@/lib/hkjc/past-dates";
import { fetchHkjcMatchesFromApi } from "@/lib/hkjc/matches-api";
import { useAuth } from "@/context/AuthContext";
import type { HkjcDateItem, HkjcMatch, HkjcMatchesResponse } from "@/types/hkjc";

type HkjcContextValue = {
  data: HkjcMatchesResponse | null;
  loading: boolean;
  error: string | null;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  reload: (refresh?: boolean) => Promise<void>;
  archivedDates: HkjcDateItem[];
  archivedMatchesByDate: Record<string, HkjcMatch[]>;
  archivedLoading: boolean;
  adminPastTabCount: number;
};

const HkjcContext = createContext<HkjcContextValue | null>(null);

export function HkjcProvider({ children }: { children: React.ReactNode }) {
  const { token, isAdmin, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<HkjcMatchesResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archivedHasEventByKey, setArchivedHasEventByKey] = useState<
    Record<string, boolean>
  >({});
  const [archivedMatchesByDate, setArchivedMatchesByDate] = useState<
    Record<string, HkjcMatch[]>
  >({});
  const [loadedArchivedDateKeys, setLoadedArchivedDateKeys] = useState<
    Set<string>
  >(() => new Set());

  const adminPastTabCount =
    !authLoading && isAdmin ? ADMIN_PAST_TAB_COUNT : 0;

  const clientPastDates = useMemo(() => {
    if (adminPastTabCount === 0) return [] as HkjcDateItem[];
    return buildAdminPastDateItems(ADMIN_PAST_TAB_COUNT);
  }, [adminPastTabCount]);

  const archivedDates = useMemo(
    () =>
      clientPastDates.map((date) => ({
        ...date,
        hasEvent:
          archivedHasEventByKey[date.key] ??
          (archivedMatchesByDate[date.key]?.length ?? 0) > 0,
      })),
    [clientPastDates, archivedHasEventByKey, archivedMatchesByDate],
  );

  const reload = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchHkjcMatchesFromApi({ refresh });
      setData(json);
      if (json.total === 0 && !refresh) {
        const retry = await fetchHkjcMatchesFromApi({ refresh: true });
        setData(retry);
      }
    } catch {
      setData((current) => {
        if (current?.total) {
          setError("無法更新賽事資料，顯示上次快取結果。");
        } else {
          setError("無法載入馬會賽事資料，請稍後再試。");
        }
        return current;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin || !token) {
      setArchivedHasEventByKey({});
      setArchivedMatchesByDate({});
      setLoadedArchivedDateKeys(new Set());
    }
  }, [authLoading, isAdmin, token]);

  useEffect(() => {
    if (authLoading || !isAdmin || !token) return;

    let cancelled = false;

    void fetchArchivedDates(token)
      .then((dates) => {
        if (cancelled) return;
        const next: Record<string, boolean> = {};
        for (const date of dates) {
          next[date.key] = date.hasEvent;
        }
        setArchivedHasEventByKey(next);
      })
      .catch(() => {
        // Keep client-side tabs; hasEvent falls back to loaded match counts.
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAdmin, token, data?.updatedAt]);

  useEffect(() => {
    if (!isAdmin || !token || adminPastTabCount === 0) return;

    const pendingKeys = clientPastDates
      .map((date) => date.key)
      .filter((key) => key && !loadedArchivedDateKeys.has(key));

    if (pendingKeys.length === 0) return;

    let cancelled = false;

    void Promise.all(
      pendingKeys.map((dateKey) =>
        fetchArchivedMatches(token, dateKey)
          .then((matches) => ({ dateKey, matches }))
          .catch(() => ({ dateKey, matches: [] as HkjcMatch[] })),
      ),
    )
      .then((results) => {
        if (cancelled) return;

        setArchivedMatchesByDate((current) => {
          const next = { ...current };
          for (const { dateKey, matches } of results) {
            next[dateKey] = enrichArchivedMatches(matches);
          }
          return next;
        });
        setLoadedArchivedDateKeys((current) => {
          const next = new Set(current);
          for (const { dateKey } of results) {
            next.add(dateKey);
          }
          return next;
        });
      });

    return () => {
      cancelled = true;
    };
  }, [
    isAdmin,
    token,
    adminPastTabCount,
    clientPastDates,
    loadedArchivedDateKeys,
  ]);

  const archivedLoading = useMemo(() => {
    if (
      adminPastTabCount === 0 ||
      selectedIndex === 0 ||
      selectedIndex > adminPastTabCount
    ) {
      return false;
    }
    const dateKey = archivedDates[selectedIndex - 1]?.key;
    return Boolean(dateKey && !loadedArchivedDateKeys.has(dateKey));
  }, [
    adminPastTabCount,
    selectedIndex,
    archivedDates,
    loadedArchivedDateKeys,
  ]);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      selectedIndex,
      setSelectedIndex,
      reload,
      archivedDates,
      archivedMatchesByDate,
      archivedLoading,
      adminPastTabCount,
    }),
    [
      data,
      loading,
      error,
      selectedIndex,
      reload,
      archivedDates,
      archivedMatchesByDate,
      archivedLoading,
      adminPastTabCount,
    ],
  );

  return <HkjcContext.Provider value={value}>{children}</HkjcContext.Provider>;
}

function useHkjc() {
  const context = useContext(HkjcContext);
  if (!context) {
    throw new Error("useHkjc must be used within HkjcProvider");
  }
  return context;
}

export function HkjcDatePicker() {
  const {
    data,
    loading,
    selectedIndex,
    setSelectedIndex,
    archivedDates,
    adminPastTabCount,
  } = useHkjc();

  const datePickerItems = useMemo(
    () => {
      const liveItems = (data?.dates ?? []).map((date) => ({
        day: date.day,
        date: date.date,
        hasEvent: date.hasEvent,
      }));

      if (adminPastTabCount === 0) {
        return liveItems;
      }

      const archivedItems = archivedDates.map((date) => ({
        day: date.day,
        date: date.date,
        hasEvent: date.hasEvent,
      }));

      return [...archivedItems, ...liveItems];
    },
    [data?.dates, archivedDates, adminPastTabCount],
  );

  if (loading || datePickerItems.length === 0) {
    return <div className="h-[88px] animate-pulse rounded-[19px] bg-gray-90" />;
  }

  return (
    <DatePicker
      dates={datePickerItems}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      showAll
    />
  );
}

export function HkjcMatchesSection({
  mode = "default",
}: {
  mode?: "default" | "top-picks";
}) {
  const {
    data,
    loading,
    error,
    selectedIndex,
    reload,
    archivedDates,
    archivedMatchesByDate,
    archivedLoading,
    adminPastTabCount,
  } = useHkjc();
  const { token, isAuthenticated, isMember, isAdmin, isLoading: authLoading } =
    useAuth();
  const [analysisScores, setAnalysisScores] = useState<Record<string, number>>(
    {},
  );
  const [scoresLoading, setScoresLoading] = useState(false);
  const isTopPicks = mode === "top-picks";
  const listKey = `${mode}-${selectedIndex}-${data?.updatedAt ?? "loading"}-${archivedLoading}`;

  const matches = useMemo(() => {
    if (selectedIndex === 0) {
      return data?.matches ?? [];
    }

    if (adminPastTabCount > 0 && selectedIndex <= adminPastTabCount) {
      const dateKey = archivedDates[selectedIndex - 1]?.key;
      return dateKey ? archivedMatchesByDate[dateKey] ?? [] : [];
    }

    if (!data) return [] as HkjcMatch[];
    const liveIndex = selectedIndex - 1 - adminPastTabCount;
    const selectedDateKey = data.dates[liveIndex]?.key;
    if (!selectedDateKey) return [] as HkjcMatch[];
    return filterMatchesByDate(data.matches, selectedDateKey);
  }, [
    data,
    selectedIndex,
    adminPastTabCount,
    archivedDates,
    archivedMatchesByDate,
  ]);

  const viewingArchived =
    adminPastTabCount > 0 &&
    selectedIndex > 0 &&
    selectedIndex <= adminPastTabCount;

  const canAccessPicks = isAuthenticated && (isMember || isAdmin);
  const canPrewarm = canAccessPicks && Boolean(token);

  useEffect(() => {
    if (!canPrewarm || !token || matches.length === 0) return;

    const limit = isTopPicks ? data?.matches.length ?? 24 : 6;
    const matchIds = matches.slice(0, limit).map((match) => match.id);
    setScoresLoading(isTopPicks);

    void fetchAnalysisScores(token, matchIds)
      .then((results) => {
        const scores: Record<string, number> = {};
        for (const result of results) {
          if (result.confidenceScore !== undefined && result.confidenceScore > 0) {
            scores[result.matchId] = result.confidenceScore;
          }
        }
        setAnalysisScores((prev) => ({ ...prev, ...scores }));
      })
      .catch(() => {
        // score lookup is best-effort
      })
      .finally(() => {
        setScoresLoading(false);
      });

    if (!viewingArchived) {
      void prewarmAnalyses(token, matchIds)
        .then((results) => {
          const scores: Record<string, number> = {};
          for (const result of results) {
            if (result.confidenceScore !== undefined && result.confidenceScore > 0) {
              scores[result.matchId] = result.confidenceScore;
            }
          }
          if (Object.keys(scores).length > 0) {
            setAnalysisScores((prev) => ({ ...prev, ...scores }));
          }
        })
        .catch(() => {
          // prewarm is best-effort
        });
    }
  }, [
    canPrewarm,
    token,
    matches,
    isTopPicks,
    data?.matches.length,
    viewingArchived,
  ]);

  const displayMatches = useMemo(() => {
    if (!isTopPicks) return matches;

    return [...matches].sort((a, b) => {
      const scoreA = analysisScores[a.id] ?? 0;
      const scoreB = analysisScores[b.id] ?? 0;
      return scoreB - scoreA;
    });
  }, [matches, isTopPicks, analysisScores]);

  if (loading || (isTopPicks && authLoading) || (viewingArchived && archivedLoading)) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[84px] animate-pulse rounded-[16px] bg-gray-90"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] bg-gray-90 p-6 text-center">
        <p className="text-sm text-gray-40">{error}</p>
        <button
          type="button"
          onClick={() => void reload(true)}
          className="mt-3 text-sm font-medium text-orange-50"
        >
          重試
        </button>
      </div>
    );
  }

  if (isTopPicks && !canAccessPicks) {
    return null;
  }

  const scoredCount = displayMatches.filter(
    (match) => (analysisScores[match.id] ?? 0) > 0,
  ).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <SubNav
          title={isTopPicks ? "AI 精選預測" : "賽事列表"}
          count={isTopPicks ? scoredCount || displayMatches.length : matches.length}
        />
        {data?.updatedAt && (
          <p className="pb-0.5 text-[10px] font-medium text-gray-60">
            {viewingArchived
              ? `資料庫 · ${matches.length} 場過往賽事`
              : isTopPicks
                ? `按 AI 評分排序 · ${scoredCount} 場`
                : `馬會 · ${data.total} 場進行中`}
          </p>
        )}
      </div>

      {isTopPicks && scoresLoading && (
        <p className="text-xs text-gray-40">正在載入 AI 評分…</p>
      )}

      {displayMatches.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center">
          <p className="text-sm text-gray-40">
            {viewingArchived ? "此日期暫無已儲存的過往賽事。" : "此日期暫無馬會賽事。"}
          </p>
          <button
            type="button"
            onClick={() => void reload(true)}
            className="mt-3 text-sm font-medium text-orange-50"
          >
            重新載入
          </button>
        </div>
      ) : (
        <div key={listKey} className="flex flex-col gap-2.5">
          {displayMatches.map((match, index) => (
            <AnimateIn
              key={match.id}
              variant="slide-right"
              delay={Math.min(index * 270, 2360)}
            >
              <HkjcMatchCard
                match={match}
                href={`/analysis/${match.id}`}
                analysisScore={analysisScores[match.id]}
              />
            </AnimateIn>
          ))}
        </div>
      )}
    </section>
  );
}
