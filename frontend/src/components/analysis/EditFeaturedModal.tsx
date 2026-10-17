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
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type CardDraft = FeaturedItemInput & {
  previewUrl: string;
};

type TextField = "tag" | "title" | "duration" | "stat";
type EnglishField = `${TextField}En`;

const TEXT_FIELDS: TextField[] = ["tag", "title", "duration", "stat"];

function createDraft(item: FeaturedItem): CardDraft {
  return {
    title: item.title,
    tag: item.tag,
    duration: item.duration,
    stat: item.stat,
    titleEn: item.titleEn ?? "",
    tagEn: item.tagEn ?? "",
    durationEn: item.durationEn ?? "",
    statEn: item.statEn ?? "",
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
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const text = t.analysis.editFeatured;
  const fieldText: Record<
    TextField,
    { label: string; placeholder: string; labelEn: string; placeholderEn: string }
  > = {
    tag: {
      label: text.tag,
      placeholder: text.tagPlaceholder,
      labelEn: text.tagEn,
      placeholderEn: text.tagEnPlaceholder,
    },
    title: {
      label: text.itemTitle,
      placeholder: text.itemTitlePlaceholder,
      labelEn: text.itemTitleEn,
      placeholderEn: text.itemTitleEnPlaceholder,
    },
    duration: {
      label: text.duration,
      placeholder: text.durationPlaceholder,
      labelEn: text.durationEn,
      placeholderEn: text.durationEnPlaceholder,
    },
    stat: {
      label: text.stat,
      placeholder: text.statPlaceholder,
      labelEn: text.statEn,
      placeholderEn: text.statEnPlaceholder,
    },
  };

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-gray-80 bg-gray-100/40 p-4">
      <h3 className="text-sm font-bold text-white">{label}</h3>

      {TEXT_FIELDS.map((field) => {
        const englishField: EnglishField = `${field}En`;
        return (
          <div key={field} className="flex flex-col gap-2">
            <label className="flex flex-col gap-2 text-sm text-gray-30">
              {fieldText[field].label}
              <input
                className={fieldClass}
                value={draft[field]}
                onChange={(e) => onChange({ ...draft, [field]: e.target.value })}
                placeholder={fieldText[field].placeholder}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-30">
              {fieldText[field].labelEn}
              <input
                className={fieldClass}
                value={draft[englishField] ?? ""}
                onChange={(e) =>
                  onChange({ ...draft, [englishField]: e.target.value })
                }
                placeholder={fieldText[field].placeholderEn}
                lang="en"
              />
            </label>
          </div>
        );
      })}

      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-30">{text.backgroundImage}</span>
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
          {text.uploadImage}
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
  const { t } = useI18n();
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
      setError(t.analysis.editFeatured.requiredFields);
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
            // "" clears a previously saved English override.
            titleEn: draft.titleEn?.trim() ?? "",
            tagEn: draft.tagEn?.trim() ?? "",
            durationEn: draft.durationEn?.trim() ?? "",
            statEn: draft.statEn?.trim() ?? "",
            file: draft.file,
          });
        }),
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

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">
              {t.analysis.editFeatured.title}
            </h2>
            <p className="text-xs text-gray-40">
              {t.analysis.editFeatured.description}
            </p>
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

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-5 overflow-y-auto p-5">
            <p className="text-xs text-gray-40">{t.common.englishFallbackHint}</p>
            {drafts.map((draft, index) => (
              <FeaturedCardEditor
                key={items[index]?.id ?? index}
                label={t.analysis.editFeatured.cardLabel(index + 1)}
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
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
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
