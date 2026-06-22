"use client";

import { useEffect, useState } from "react";
import { SubNav } from "@/components/layout/SubNav";
import { TopMatchPreviewCard } from "@/components/analysis/TopMatchPreviewCard";
import { useAuth } from "@/context/AuthContext";
import { findTopConfidenceMatchIds } from "@/lib/top-match";
import { fetchHkjcMatchesFromApi } from "@/lib/hkjc/matches-api";

const PREVIEW_COUNT = 4;

export function TopMatchPreviewSection() {
  const { token, isAuthenticated, isMember, isAdmin, isLoading: authLoading } =
    useAuth();
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const canAccess = isAuthenticated && (isMember || isAdmin);

  useEffect(() => {
    if (authLoading) return;

    if (!canAccess || !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchHkjcMatchesFromApi();
        const fallbackId = data.matches[0]?.id ?? "";
        const ids = await findTopConfidenceMatchIds(
          token,
          fallbackId,
          PREVIEW_COUNT,
        );
        if (!cancelled) {
          setMatchIds(ids.slice(0, PREVIEW_COUNT));
        }
      } catch {
        if (!cancelled) {
          setMatchIds([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, canAccess, token]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[360px] animate-pulse rounded-[24px] bg-gray-90"
          />
        ))}
      </div>
    );
  }

  if (!canAccess) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <SubNav title="AI 精選預測" count={matchIds.length} />
      <div className="flex flex-col gap-4">
        {matchIds.map((matchId, index) => (
          <TopMatchPreviewCard
            key={matchId}
            matchId={matchId}
            delay={index * 120}
          />
        ))}
      </div>
    </section>
  );
}
