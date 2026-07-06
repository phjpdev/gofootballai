"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import { SubNav } from "@/components/layout/SubNav";
import { EditTopMatchPreviewModal } from "@/components/analysis/EditTopMatchPreviewModal";
import { TopMatchPreviewCard } from "@/components/analysis/TopMatchPreviewCard";
import { useAuth } from "@/context/AuthContext";
import {
  DEFAULT_TOP_MATCH_PREVIEWS,
  mergePreviewMatchIds,
  PREVIEW_SLOT_COUNT,
  sortPreviewSlots,
} from "@/lib/data/top-match-previews";
import { fetchTopMatchPreviews } from "@/lib/top-match-previews-api";
import { findTopConfidenceMatchIds, loadMatchesForDate, resolveTopPicksDateKey } from "@/lib/top-match";
import { getTodayDateKeyHk } from "@/lib/hkjc/past-dates";
import type { TopMatchPreviewSlot } from "@/lib/data/top-match-previews";

export function TopMatchPreviewSection() {
  const searchParams = useSearchParams();
  const dateKey = searchParams.get("date") ?? getTodayDateKeyHk();
  const { token, isAuthenticated, isMember, isAdmin, isLoading: authLoading } =
    useAuth();
  const [slots, setSlots] = useState<TopMatchPreviewSlot[]>(
    DEFAULT_TOP_MATCH_PREVIEWS,
  );
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const canAccess = isAuthenticated && (isMember || isAdmin);

  const loadPreview = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const effectiveDateKey = await resolveTopPicksDateKey(dateKey);
      const [configuredSlots, matches] = await Promise.all([
        fetchTopMatchPreviews().catch(() => DEFAULT_TOP_MATCH_PREVIEWS),
        loadMatchesForDate(effectiveDateKey, token, { upcomingOnly: true }),
      ]);

      setSlots(configuredSlots);

      const upcomingIds = new Set(matches.map((match) => match.id));
      const fallbackId = matches[0]?.id ?? "";
      const autoRanked = await findTopConfidenceMatchIds(
        token,
        fallbackId,
        PREVIEW_SLOT_COUNT,
        effectiveDateKey,
      );

      setMatchIds(
        mergePreviewMatchIds(configuredSlots, autoRanked, PREVIEW_SLOT_COUNT).filter(
          (matchId) => upcomingIds.has(matchId),
        ),
      );
    } catch {
      setMatchIds([]);
    } finally {
      setLoading(false);
    }
  }, [token, dateKey]);

  useEffect(() => {
    if (authLoading) return;

    if (!canAccess || !token) {
      setLoading(false);
      return;
    }

    void loadPreview();
  }, [authLoading, canAccess, token, loadPreview]);

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

  const orderedSlots = sortPreviewSlots(slots);

  return (
    <section className="flex flex-col gap-4">
      <SubNav
        title="AI 精選預測"
        count={matchIds.length}
        titleAction={
          isAdmin ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="編輯 AI 精選預測"
              className="flex size-8 shrink-0 items-center justify-center rounded-[12px] bg-gray-90 text-orange-50 transition-colors hover:bg-gray-80"
            >
              <Pencil className="size-4" strokeWidth={2.25} />
            </button>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-4">
        {matchIds.map((matchId, index) => (
          <TopMatchPreviewCard
            key={`${orderedSlots[index]?.id ?? index}-${matchId}`}
            matchId={matchId}
            slot={orderedSlots[index]}
            delay={index * 120}
          />
        ))}
      </div>

      {isAdmin && token && (
        <EditTopMatchPreviewModal
          open={modalOpen}
          slots={slots}
          resolvedMatchIds={matchIds}
          token={token}
          onClose={() => setModalOpen(false)}
          onSaved={(updated) => {
            setSlots(updated);
            void loadPreview();
          }}
        />
      )}
    </section>
  );
}
