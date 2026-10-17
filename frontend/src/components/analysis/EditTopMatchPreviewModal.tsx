"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  DEFAULT_TOP_MATCH_PREVIEWS,
  previewSlotNumber,
  sortPreviewSlots,
  type TopMatchPreviewId,
  type TopMatchPreviewSlot,
} from "@/lib/data/top-match-previews";
import { updateTopMatchPreviews } from "@/lib/top-match-previews-api";
import { fetchHkjcMatchByIdFromApi } from "@/lib/hkjc/matches-api";
import { fetchMatchAnalysis } from "@/lib/analyses-api";
import { flipOverUnderPickSelection } from "@/lib/analysis-pick-display";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  containsCjk,
  formatPickSelection,
  localizedTeamName,
} from "@/lib/i18n/localized";
import type { HkjcMatch } from "@/types/hkjc";

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

type HydratedSlot = {
  slot: TopMatchPreviewSlot;
  /** HKJC match the slot points at; only used to show English fallbacks. */
  match: HkjcMatch | null;
};

/** Same rule as the preview card: HKJC English only while the Chinese name is unchanged. */
function fallbackTeamEn(
  draftZh: string | undefined,
  matchZh: string | undefined,
  matchEn: string | undefined,
): string | undefined {
  const chinese = draftZh?.trim();
  if (!chinese || chinese === matchZh?.trim()) return matchEn || undefined;
  return undefined;
}

async function hydrateSlot(
  slot: TopMatchPreviewSlot,
  matchId: string,
  token: string,
  locale: Locale,
): Promise<HydratedSlot> {
  if (!matchId) return { slot: { ...slot, matchId: "" }, match: null };

  try {
    const [match, analysisResponse] = await Promise.all([
      fetchHkjcMatchByIdFromApi(matchId),
      fetchMatchAnalysis(token, matchId, locale).catch(() => null),
    ]);

    return {
      slot: {
        ...slot,
        matchId,
        homeTeam: slot.homeTeam || match?.homeTeam || "",
        awayTeam: slot.awayTeam || match?.awayTeam || "",
        pickSelection:
          slot.pickSelection || analysisResponse?.analysis?.pick.selection || "",
      },
      match,
    };
  } catch {
    return { slot: { ...slot, matchId }, match: null };
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
  const { locale, t } = useI18n();
  const [activeTab, setActiveTab] = useState<TopMatchPreviewId>("preview-1");
  const [drafts, setDrafts] = useState<TopMatchPreviewSlot[]>(
    DEFAULT_TOP_MATCH_PREVIEWS,
  );
  const [linkedMatches, setLinkedMatches] = useState<
    Partial<Record<TopMatchPreviewId, HkjcMatch | null>>
  >({});
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const text = t.analysis.editTopPreview;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setActiveTab("preview-1");
    setError("");
    setHydrating(true);

    const ordered = sortPreviewSlots(slots);

    void Promise.all(
      ordered.map((slot, index) =>
        hydrateSlot(
          slot,
          resolvedMatchIds[index] ?? slot.matchId,
          token,
          locale,
        ),
      ),
    )
      .then((hydrated) => {
        if (!cancelled) {
          setDrafts(hydrated.map((item) => item.slot));
          setLinkedMatches(
            Object.fromEntries(
              hydrated.map((item) => [item.slot.id, item.match]),
            ),
          );
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
  }, [open, slots, resolvedMatchIds, token, locale]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const activeDraft = drafts.find((slot) => slot.id === activeTab) ?? drafts[0];
  const activeMatch = activeDraft ? linkedMatches[activeDraft.id] : null;

  // What English readers see when the English fields are left blank.
  const fallbackHomeEn = fallbackTeamEn(
    activeDraft?.homeTeam,
    activeMatch?.homeTeam,
    activeMatch?.homeTeamEn,
  );
  const fallbackAwayEn = fallbackTeamEn(
    activeDraft?.awayTeam,
    activeMatch?.awayTeam,
    activeMatch?.awayTeamEn,
  );
  const homeEn = activeDraft?.homeTeamEn?.trim() || fallbackHomeEn;
  const awayEn = activeDraft?.awayTeamEn?.trim() || fallbackAwayEn;
  // The English pick is only a fallback for picks that can't be translated.
  const autoPickEn = activeDraft?.pickSelection.trim()
    ? formatPickSelection(
        flipOverUnderPickSelection(activeDraft.pickSelection),
        "en",
        {
          homeTeam: activeDraft.homeTeam,
          awayTeam: activeDraft.awayTeam,
          homeTeamEn: homeEn,
          awayTeamEn: awayEn,
        },
      )
    : "";

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
      const updated = await updateTopMatchPreviews(
        token,
        // "" clears a previously saved English override.
        drafts.map((slot) => ({
          ...slot,
          homeTeamEn: slot.homeTeamEn?.trim() ?? "",
          awayTeamEn: slot.awayTeamEn?.trim() ?? "",
          pickSelectionEn: slot.pickSelectionEn?.trim() ?? "",
        })),
      );
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.analysis.saveFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.common.close}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">{text.title}</h2>
            <p className="text-xs text-gray-40">{text.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
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
              {text.slotLabel(previewSlotNumber(slot.id))}
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
                  <p className="text-xs text-gray-40">{text.currentMatch}</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {localizedTeamName(locale, activeDraft?.homeTeam, homeEn) ||
                      text.homeFallback}{" "}
                    {text.vs}{" "}
                    {localizedTeamName(locale, activeDraft?.awayTeam, awayEn) ||
                      text.awayFallback}
                  </p>
                </div>

                <p className="text-xs text-gray-40">{text.englishHint}</p>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {text.homeTeam}
                  <input
                    className={fieldClass}
                    value={activeDraft?.homeTeam ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ homeTeam: e.target.value })
                    }
                    placeholder={text.homeTeamPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {text.homeTeamEn}
                  <input
                    className={fieldClass}
                    value={activeDraft?.homeTeamEn ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ homeTeamEn: e.target.value })
                    }
                    placeholder={fallbackHomeEn || text.teamEnPlaceholder}
                    lang="en"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {text.awayTeam}
                  <input
                    className={fieldClass}
                    value={activeDraft?.awayTeam ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ awayTeam: e.target.value })
                    }
                    placeholder={text.awayTeamPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {text.awayTeamEn}
                  <input
                    className={fieldClass}
                    value={activeDraft?.awayTeamEn ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ awayTeamEn: e.target.value })
                    }
                    placeholder={fallbackAwayEn || text.teamEnPlaceholder}
                    lang="en"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {text.pick}
                  <input
                    className={fieldClass}
                    value={activeDraft?.pickSelection ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ pickSelection: e.target.value })
                    }
                    placeholder={text.pickPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {text.pickEn}
                  <input
                    className={fieldClass}
                    value={activeDraft?.pickSelectionEn ?? ""}
                    onChange={(e) =>
                      updateActiveDraft({ pickSelectionEn: e.target.value })
                    }
                    placeholder={text.pickEnPlaceholder}
                    lang="en"
                  />
                  {autoPickEn && (
                    <span className="text-xs text-gray-40">
                      {containsCjk(autoPickEn)
                        ? text.pickEnManual
                        : text.pickEnAuto(autoPickEn)}
                    </span>
                  )}
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
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || hydrating}
              className="flex-1 rounded-[14px] bg-orange-50 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? t.common.saving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
