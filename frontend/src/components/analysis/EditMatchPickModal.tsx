"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updateMatchPickOverride } from "@/lib/match-pick-overrides-api";
import { flipOverUnderPickSelection } from "@/lib/analysis-pick-display";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  containsCjk,
  formatPickSelection,
  type PickContext,
} from "@/lib/i18n/localized";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type EditMatchPickModalProps = {
  open: boolean;
  matchId: string;
  token: string;
  initialPickSelection: string;
  /** Team names for the English preview, so team handicaps translate too. */
  pickContext?: Omit<PickContext, "fallbackEn">;
  onClose: () => void;
  onSaved: (pickSelection: string) => void;
};

export function EditMatchPickModal({
  open,
  matchId,
  token,
  initialPickSelection,
  pickContext,
  onClose,
  onSaved,
}: EditMatchPickModalProps) {
  const { locale, t } = useI18n();
  const [pickSelection, setPickSelection] = useState(initialPickSelection);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPickSelection(initialPickSelection);
    setError("");
  }, [open, initialPickSelection]);

  if (!open) return null;

  // The override is stored (and flipped for display) in Chinese; preview the English result.
  const englishPreview =
    locale === "en" && pickSelection.trim()
      ? formatPickSelection(
          flipOverUnderPickSelection(pickSelection.trim()),
          "en",
          pickContext,
        )
      : "";

  const handleSubmit = async () => {
    const trimmed = pickSelection.trim();
    if (!trimmed) {
      setError(t.analysis.editPick.required);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const saved = await updateMatchPickOverride(token, matchId, trimmed);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.analysis.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-[24px] border border-gray-80 bg-gray-90 p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-match-pick-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="edit-match-pick-title"
              className="text-base font-bold text-white"
            >
              {t.analysis.editPick.title}
            </h2>
            <p className="mt-1 text-xs text-gray-40">
              {t.analysis.editPick.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-80 text-gray-40 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-white">
            {t.analysis.editPick.label}
          </span>
          <input
            type="text"
            value={pickSelection}
            onChange={(e) => setPickSelection(e.target.value)}
            placeholder={t.analysis.editPick.placeholder}
            className={fieldClass}
            maxLength={80}
          />
        </label>

        {englishPreview && (
          <p className="mt-2 text-xs text-gray-40">
            {containsCjk(englishPreview)
              ? t.analysis.editPick.englishUntranslated
              : t.analysis.editPick.englishPreview(englishPreview)}
          </p>
        )}

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[14px] bg-gray-80 py-3 text-sm font-semibold text-white"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="flex-1 rounded-[14px] bg-orange-50 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? t.common.saving : t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
