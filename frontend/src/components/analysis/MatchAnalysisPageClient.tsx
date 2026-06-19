"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MatchAnalysisClient } from "@/components/analysis/MatchAnalysisClient";
import { getMatchById } from "@/lib/data/matches";
import { hkjcMatchToLegacy } from "@/lib/hkjc/fetch-matches";
import { fetchHkjcMatchByIdFromApi } from "@/lib/hkjc/matches-api";
import type { Match } from "@/types";
import { ChevronLeft } from "lucide-react";

type MatchAnalysisPageClientProps = {
  matchId: string;
};

export function MatchAnalysisPageClient({ matchId }: MatchAnalysisPageClientProps) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);

      try {
        const hkjcMatch = await fetchHkjcMatchByIdFromApi(matchId);
        if (cancelled) return;

        if (hkjcMatch) {
          setMatch(hkjcMatchToLegacy(hkjcMatch));
          return;
        }

        const fallback = getMatchById(matchId);
        if (fallback) {
          setMatch(fallback);
          return;
        }

        setNotFound(true);
      } catch {
        if (!cancelled) {
          const fallback = getMatchById(matchId);
          if (fallback) {
            setMatch(fallback);
          } else {
            setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/analysis"
          className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40"
        >
          <ChevronLeft className="size-4" />
          返回賽事分析
        </Link>
        <div className="h-[180px] animate-pulse rounded-[24px] bg-gray-90" />
        <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" />
      </div>
    );
  }

  if (notFound || !match) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/analysis"
          className="flex w-fit items-center gap-1 text-sm font-medium text-gray-40 hover:text-white"
        >
          <ChevronLeft className="size-4" />
          返回賽事分析
        </Link>
        <div className="rounded-[24px] bg-gray-90 p-8 text-center">
          <p className="text-sm text-gray-40">找不到此賽事，可能已結束或下架。</p>
          <Link
            href="/analysis"
            className="mt-4 inline-block text-sm font-medium text-orange-50"
          >
            返回賽事列表
          </Link>
        </div>
      </div>
    );
  }

  return <MatchAnalysisClient match={match} />;
}
