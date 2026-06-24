"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  DEFAULT_TOP_MATCH_PREVIEWS,
  PREVIEW_SLOT_LABELS,
  sortPreviewSlots,
  type TopMatchPreviewId,
  type TopMatchPreviewSlot,
} from "@/lib/data/top-match-previews";
import { updateTopMatchPreviews } from "@/lib/top-match-previews-api";
import { fetchHkjcMatchByIdFromApi } from "@/lib/hkjc/matches-api";
import { fetchMatchAnalysis } from "@/lib/analyses-api";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type EditTopMatchPreviewModalProps = {
  open: boolean;
  slots: TopMatchPreviewSlot[];
  resolvedMatchIds: string[];
  token: string;
  onClose: () => void;
  onSaved: (slots: TopMatchPreviewSlot[]) => void;
};

async function hydrateSlot(
  slot: TopMatchPreviewSlot,
  matchId: string,
  token: string,
): Promise<TopMatchPreviewSlot> {
  if (!matchId) return { ...slot, matchId: "" };

  try {
    const [match, analysisResponse] = await Promise.all([
      fetchHkjcMatchByIdFromApi(matchId),
      fetchMatchAnalysis(token, matchId).catch(() => null),
    ]);

    return {
      ...slot,
      matchId,
      homeTeam: slot.homeTeam || match?.homeTeam || "",
      awayTeam: slot.awayTeam || match?.awayTeam || "",
      pickSelection:
        slot.pickSelection || analysisResponse?.analysis?.pick.selection || "",
    };
  } catch {
    return { ...slot, matchId };
  }
}

export function EditTopMatchPreviewModal({
  open,
  slots,
  resolvedMatchIds,
  token,
  onClose,
  onSaved,
}: EditTopMatchPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<TopMatchPreviewId>("preview-1");
  const [drafts, setDrafts] = useState<TopMatchPreviewSlot[]>(
    DEFAULT_TOP_MATCH_PREVIEWS,
  );
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setActiveTab("preview-1");
    setError("");
    setHydrating(true);

    const ordered = sortPreviewSlots(slots);

    void Promise.all(
      ordered.map((slot, index) =>
        hydrateSlot(slot, resolvedMatchIds[index] ?? slot.matchId, token),
      ),
    )
      .then((hydrated) => {
        if (!cancelled) {
          setDrafts(hydrated);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, slots, resolvedMatchIds, token]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const activeDraft = drafts.find((slot) => slot.id === activeTab) ?? drafts[0];

  function updateActiveDraft(patch: Partial<TopMatchPreviewSlot>) {
    setDrafts((current) =>
      current.map((slot) =>
        slot.id === activeTab ? { ...slot, ...patch } : slot,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const updated = await updateTopMatchPreviews(token, drafts);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">編輯 AI 精選預測</h2>
            <p className="text-xs text-gray-40">
              編輯每個精選卡片的隊伍名稱及預測結果。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-gray-80 text-gray-20"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-80 px-5 py-3">
          {drafts.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setActiveTab(slot.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === slot.id
                  ? "bg-orange-50 text-white"
                  : "bg-gray-80 text-gray-30 hover:text-white"
              }`}
            >
              {PREVIEW_SLOT_LABELS[slot.id]}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-4 overflow-y-auto p-5">
            {hydrating ? (
              <div className="space-y-3">
                <div className="h-12 animate-pulse rounded-[14px] bg-gray-80" />
                <div className="h-12 animate-pulse rounded-[14px] bg-gray-80" />
                <div className="h-12 animate-pulse rounded-[14px] bg-gray-80" />
              </div>
            ) : (
              <>
                <div className="rounded-[16px] border border-gray-80 bg-gray-100/40 px-4 py-3">
                  <p className="text-xs text-gray-40">目前賽事</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {activeDraft?.homeTeam || "主隊"} vs{" "}
                    {activeDraft?.awayTeam || "客隊"}
                  </p>
                </div>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  主隊名稱
                  <input
                    className={fieldClass}
                    value={activeDraft?.homeTeam ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ homeTeam: e.target.value })
                    }
                    placeholder="例如：波斯尼亞"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  客隊名稱
                  <input
                    className={fieldClass}
                    value={activeDraft?.awayTeam ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ awayTeam: e.target.value })
                    }
                    placeholder="例如：卡塔爾"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  預測結果
                  <input
                    className={fieldClass}
                    value={activeDraft?.pickSelection ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ pickSelection: e.target.value })
                    }
                    placeholder="例如：小 3.5"
                  />
                </label>
              </>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex shrink-0 gap-3 border-t border-gray-80 p-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[14px] border border-gray-70 px-4 py-3 text-sm font-semibold text-white"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting || hydrating}
              className="flex-1 rounded-[14px] bg-orange-50 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "儲存中…" : "儲存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
