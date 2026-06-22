"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import type { FeaturedItem } from "@/lib/data/featured";
import {
  resolveFeaturedImageUrl,
  updateFeaturedItem,
  type FeaturedItemInput,
} from "@/lib/featured-api";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type CardDraft = FeaturedItemInput & {
  previewUrl: string;
};

function createDraft(item: FeaturedItem): CardDraft {
  return {
    title: item.title,
    tag: item.tag,
    duration: item.duration,
    stat: item.stat,
    previewUrl: resolveFeaturedImageUrl(item.imageSrc),
  };
}

function FeaturedCardEditor({
  label,
  draft,
  onChange,
}: {
  label: string;
  draft: CardDraft;
  onChange: (next: CardDraft) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-gray-80 bg-gray-100/40 p-4">
      <h3 className="text-sm font-bold text-white">{label}</h3>

      <label className="flex flex-col gap-2 text-sm text-gray-30">
        標籤
        <input
          className={fieldClass}
          value={draft.tag}
          onChange={(e) => onChange({ ...draft, tag: e.target.value })}
          placeholder="例如：小組賽"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-gray-30">
        標題
        <input
          className={fieldClass}
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="例如：揭幕戰精選"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-gray-30">
        時長
        <input
          className={fieldClass}
          value={draft.duration}
          onChange={(e) => onChange({ ...draft, duration: e.target.value })}
          placeholder="例如：90分鐘"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-gray-30">
        描述標籤
        <input
          className={fieldClass}
          value={draft.stat}
          onChange={(e) => onChange({ ...draft, stat: e.target.value })}
          placeholder="例如：AI 預測"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-30">背景圖片</span>
        <div className="relative aspect-[261/225] overflow-hidden rounded-[16px] bg-gray-80">
          {draft.previewUrl ? (
            <Image
              src={draft.previewUrl}
              alt=""
              fill
              unoptimized={draft.previewUrl.includes("/uploads/")}
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-40">
              <ImageIcon className="size-8" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onChange({
              ...draft,
              file: file ?? undefined,
              previewUrl: file ? URL.createObjectURL(file) : draft.previewUrl,
            });
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-gray-70 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-80"
        >
          <Upload className="size-4" />
          上傳圖片
        </button>
      </div>
    </div>
  );
}

type EditFeaturedModalProps = {
  open: boolean;
  items: FeaturedItem[];
  token: string;
  onClose: () => void;
  onSaved: (items: FeaturedItem[]) => void;
};

export function EditFeaturedModal({
  open,
  items,
  token,
  onClose,
  onSaved,
}: EditFeaturedModalProps) {
  const [drafts, setDrafts] = useState<CardDraft[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDrafts(items.map(createDraft));
    setError("");
  }, [open, items]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (drafts.some((draft) => !draft.title.trim() || !draft.tag.trim() || !draft.duration.trim() || !draft.stat.trim())) {
      setError("請填寫所有文字欄位");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updated = await Promise.all(
        items.map((item, index) => {
          const draft = drafts[index];
          return updateFeaturedItem(token, item.id, {
            title: draft.title.trim(),
            tag: draft.tag.trim(),
            duration: draft.duration.trim(),
            stat: draft.stat.trim(),
            file: draft.file,
          });
        }),
      );
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

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">編輯精選賽事</h2>
            <p className="text-xs text-gray-40">
              更新精選卡片的文字與背景圖片，所有用戶將會看到最新內容。
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

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-5 overflow-y-auto p-5">
            {drafts.map((draft, index) => (
              <FeaturedCardEditor
                key={items[index]?.id ?? index}
                label={`卡片 ${index + 1}`}
                draft={draft}
                onChange={(next) => {
                  setDrafts((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? next : item,
                    ),
                  );
                }}
              />
            ))}
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
              disabled={submitting}
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
