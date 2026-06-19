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
import { prewarmAnalyses } from "@/lib/analyses-api";
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
};

const HkjcContext = createContext<HkjcContextValue | null>(null);

function findDefaultDateIndex(): number {
  // index 0 is "All"
  return 0;
}

export function HkjcProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HkjcMatchesResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchHkjcMatchesFromApi({ refresh });
      setData(json);
      setSelectedIndex(findDefaultDateIndex());
      if (json.total === 0 && !refresh) {
        const retry = await fetchHkjcMatchesFromApi({ refresh: true });
        setData(retry);
      }
    } catch {
      if (data?.total) {
        setError("無法更新賽事資料，顯示上次快取結果。");
      } else {
        setError("無法載入馬會賽事資料，請稍後再試。");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      selectedIndex,
      setSelectedIndex,
      reload,
    }),
    [data, loading, error, selectedIndex, reload],
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
  const { data, loading, selectedIndex, setSelectedIndex } = useHkjc();

  const datePickerItems = useMemo(
    () =>
      (data?.dates ?? []).map((date) => ({
        day: date.day,
        date: date.date,
        hasEvent: date.hasEvent,
      })),
    [data?.dates],
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

export function HkjcMatchesSection() {
  const { data, loading, error, selectedIndex, reload } = useHkjc();
  const { token, isAuthenticated, isMember, isAdmin } = useAuth();
  const [analysisScores, setAnalysisScores] = useState<Record<string, number>>(
    {},
  );
  const listKey = `${selectedIndex}-${data?.updatedAt ?? "loading"}`;

  const matches = useMemo(() => {
    if (!data) return [] as HkjcMatch[];
    if (selectedIndex === 0) return data.matches;
    const selectedDateKey = data.dates[selectedIndex - 1]?.key;
    if (!selectedDateKey) return [] as HkjcMatch[];
    return filterMatchesByDate(data.matches, selectedDateKey);
  }, [data, selectedIndex]);

  const canPrewarm = isAuthenticated && (isMember || isAdmin) && Boolean(token);

  useEffect(() => {
    if (!canPrewarm || !token || matches.length === 0) return;

    const matchIds = matches.slice(0, 6).map((match) => match.id);
    void prewarmAnalyses(token, matchIds)
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
        // prewarm is best-effort
      });
  }, [canPrewarm, token, matches]);

  if (loading) {
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <SubNav title="賽事列表" count={matches.length} />
        {data?.updatedAt && (
          <p className="pb-0.5 text-[10px] font-medium text-gray-60">
            馬會 · {data.total} 場進行中
          </p>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center">
          <p className="text-sm text-gray-40">此日期暫無馬會賽事。</p>
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
          {matches.map((match, index) => (
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
