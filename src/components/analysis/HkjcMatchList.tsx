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
import { HkjcMatchCard } from "@/components/cards/HkjcMatchCard";
import { filterMatchesByDate } from "@/lib/hkjc/transform";
import type { HkjcDateItem, HkjcMatch, HkjcMatchesResponse } from "@/types/hkjc";

type HkjcContextValue = {
  data: HkjcMatchesResponse | null;
  loading: boolean;
  error: string | null;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  reload: () => Promise<void>;
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

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/hkjc/matches");
      if (!response.ok) throw new Error("Failed to load matches");
      const json = (await response.json()) as HkjcMatchesResponse;
      setData(json);
      setSelectedIndex(findDefaultDateIndex());
    } catch {
      setError("Unable to load HKJC matches. Please try again.");
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

  const matches = useMemo(() => {
    if (!data) return [] as HkjcMatch[];
    if (selectedIndex === 0) return data.matches;
    const selectedDateKey = data.dates[selectedIndex - 1]?.key;
    if (!selectedDateKey) return [] as HkjcMatch[];
    return filterMatchesByDate(data.matches, selectedDateKey);
  }, [data, selectedIndex]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[104px] animate-pulse rounded-[32px] bg-gray-90"
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
          onClick={() => void reload()}
          className="mt-3 text-sm font-medium text-orange-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <SubNav title="Matches" count={matches.length} />
        {data?.updatedAt && (
          <p className="pb-0.5 text-[10px] font-medium text-gray-60">
            HKJC · {data.total} active
          </p>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center">
          <p className="text-sm text-gray-40">No HKJC matches on this date.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((match) => (
            <HkjcMatchCard
              key={match.id}
              match={match}
              href={`/analysis/${match.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
