"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updateMatchPickOverride } from "@/lib/match-pick-overrides-api";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type EditMatchPickModalProps = {
  open: boolean;
  matchId: string;
  token: string;
  initialPickSelection: string;
  onClose: () => void;
  onSaved: (pickSelection: string) => void;
};

export function EditMatchPickModal({
  open,
  matchId,
  token,
  initialPickSelection,
  onClose,
  onSaved,
}: EditMatchPickModalProps) {
  const [pickSelection, setPickSelection] = useState(initialPickSelection);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPickSelection(initialPickSelection);
    setError("");
  }, [open, initialPickSelection]);

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmed = pickSelection.trim();
    if (!trimmed) {
      setError("請輸入預測結果");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const saved = await updateMatchPickOverride(token, matchId, trimmed);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
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
              編輯預測結果
            </h2>
            <p className="mt-1 text-xs text-gray-40">
              修改賽事覆盤頁面顯示的預測文字，例如「大 2.5」。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-80 text-gray-40 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-white">預測結果</span>
          <input
            type="text"
            value={pickSelection}
            onChange={(e) => setPickSelection(e.target.value)}
            placeholder="例如：大 2.5"
            className={fieldClass}
            maxLength={80}
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[14px] bg-gray-80 py-3 text-sm font-semibold text-white"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="flex-1 rounded-[14px] bg-orange-50 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "儲存中…" : "儲存"}
          </button>
        </div>
      </div>
    </div>
  );
}
