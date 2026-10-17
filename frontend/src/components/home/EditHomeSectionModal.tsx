"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHomeSections } from "@/context/HomeSectionsContext";
import {
  homeSectionEnglish,
  type HomeSection,
  type HomeSectionTextField,
} from "@/lib/data/home-sections";
import {
  resolveHomeSectionImageUrl,
  updateHomeSection,
} from "@/lib/home-sections-api";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type SectionDraft = {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  loginPrompt: string;
  loginLinkText: string;
  eyebrowEn: string;
  titleEn: string;
  descriptionEn: string;
  ctaTextEn: string;
  loginPromptEn: string;
  loginLinkTextEn: string;
  previewUrl: string;
  file?: File;
};

function createDraft(section: HomeSection): SectionDraft {
  const english = (field: HomeSectionTextField) =>
    homeSectionEnglish(section, field);
  return {
    eyebrow: section.eyebrow ?? "",
    title: section.title,
    description: section.description,
    ctaText: section.ctaText ?? "",
    loginPrompt: section.loginPrompt ?? "",
    loginLinkText: section.loginLinkText ?? "",
    eyebrowEn: english("eyebrow"),
    titleEn: english("title"),
    descriptionEn: english("description"),
    ctaTextEn: english("ctaText"),
    loginPromptEn: english("loginPrompt"),
    loginLinkTextEn: english("loginLinkText"),
    previewUrl: resolveHomeSectionImageUrl(section.imageSrc),
  };
}

export function EditHomeSectionModal() {
  const { token } = useAuth();
  const { t } = useI18n();
  const copy = t.home.editor;
  const { editingId, closeEditor, sections, updateSection } = useHomeSections();
  const [draft, setDraft] = useState<SectionDraft | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const section = editingId ? sections[editingId] : null;
  const isHero = editingId === "hero";

  useEffect(() => {
    if (!editingId || !section) {
      setDraft(null);
      setError("");
      return;
    }
    setDraft(createDraft(section));
    setError("");
  }, [editingId, section]);

  useEffect(() => {
    if (!editingId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeEditor();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingId, closeEditor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !draft || !token) return;

    if (!draft.title.trim() || !draft.description.trim()) {
      setError(copy.errors.titleAndDescription);
      return;
    }

    if (
      isHero &&
      (!draft.eyebrow.trim() ||
        !draft.ctaText.trim() ||
        !draft.loginPrompt.trim() ||
        !draft.loginLinkText.trim())
    ) {
      setError(copy.errors.heroFields);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updated = await updateHomeSection(token, editingId, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        eyebrow: isHero ? draft.eyebrow.trim() : undefined,
        ctaText: isHero ? draft.ctaText.trim() : undefined,
        loginPrompt: isHero ? draft.loginPrompt.trim() : undefined,
        loginLinkText: isHero ? draft.loginLinkText.trim() : undefined,
        // English is optional; "" clears a previously saved override.
        titleEn: draft.titleEn.trim(),
        descriptionEn: draft.descriptionEn.trim(),
        eyebrowEn: isHero ? draft.eyebrowEn.trim() : undefined,
        ctaTextEn: isHero ? draft.ctaTextEn.trim() : undefined,
        loginPromptEn: isHero ? draft.loginPromptEn.trim() : undefined,
        loginLinkTextEn: isHero ? draft.loginLinkTextEn.trim() : undefined,
        file: draft.file,
      });
      updateSection(updated);
      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errors.saveFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (!editingId || !draft || !section) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.common.close}
        className="absolute inset-0 bg-black/70"
        onClick={closeEditor}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">
              {copy.heading(t.home.sectionLabels[editingId])}
            </h2>
            <p className="text-xs text-gray-40">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={closeEditor}
            className="flex size-9 items-center justify-center rounded-full bg-gray-80 text-gray-20"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-4 overflow-y-auto p-5">
            <p className="text-xs text-gray-40">
              {t.common.englishFallbackHint}
            </p>

            {isHero && (
              <>
                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.eyebrow}
                  <input
                    className={fieldClass}
                    value={draft.eyebrow}
                    onChange={(e) =>
                      setDraft({ ...draft, eyebrow: e.target.value })
                    }
                    placeholder={copy.eyebrowPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.eyebrowEn}
                  <input
                    className={fieldClass}
                    value={draft.eyebrowEn}
                    onChange={(e) =>
                      setDraft({ ...draft, eyebrowEn: e.target.value })
                    }
                    placeholder={copy.eyebrowEnPlaceholder}
                    lang="en"
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-2 text-sm text-gray-30">
              {copy.title}
              <input
                className={fieldClass}
                value={draft.title}
                onChange={(e) =>
                  setDraft({ ...draft, title: e.target.value })
                }
                placeholder={copy.titlePlaceholder}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-30">
              {copy.titleEn}
              <input
                className={fieldClass}
                value={draft.titleEn}
                onChange={(e) =>
                  setDraft({ ...draft, titleEn: e.target.value })
                }
                placeholder={copy.titleEnPlaceholder}
                lang="en"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-30">
              {copy.description}
              <textarea
                className={`${fieldClass} min-h-[96px] resize-y`}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder={copy.descriptionPlaceholder}
                rows={4}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-30">
              {copy.descriptionEn}
              <textarea
                className={`${fieldClass} min-h-[96px] resize-y`}
                value={draft.descriptionEn}
                onChange={(e) =>
                  setDraft({ ...draft, descriptionEn: e.target.value })
                }
                placeholder={copy.descriptionEnPlaceholder}
                rows={4}
                lang="en"
              />
            </label>

            {isHero && (
              <>
                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.ctaText}
                  <input
                    className={fieldClass}
                    value={draft.ctaText}
                    onChange={(e) =>
                      setDraft({ ...draft, ctaText: e.target.value })
                    }
                    placeholder={copy.ctaTextPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.ctaTextEn}
                  <input
                    className={fieldClass}
                    value={draft.ctaTextEn}
                    onChange={(e) =>
                      setDraft({ ...draft, ctaTextEn: e.target.value })
                    }
                    placeholder={copy.ctaTextEnPlaceholder}
                    lang="en"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.loginPrompt}
                  <input
                    className={fieldClass}
                    value={draft.loginPrompt}
                    onChange={(e) =>
                      setDraft({ ...draft, loginPrompt: e.target.value })
                    }
                    placeholder={copy.loginPromptPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.loginPromptEn}
                  <input
                    className={fieldClass}
                    value={draft.loginPromptEn}
                    onChange={(e) =>
                      setDraft({ ...draft, loginPromptEn: e.target.value })
                    }
                    placeholder={copy.loginPromptEnPlaceholder}
                    lang="en"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.loginLinkText}
                  <input
                    className={fieldClass}
                    value={draft.loginLinkText}
                    onChange={(e) =>
                      setDraft({ ...draft, loginLinkText: e.target.value })
                    }
                    placeholder={copy.loginLinkTextPlaceholder}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  {copy.loginLinkTextEn}
                  <input
                    className={fieldClass}
                    value={draft.loginLinkTextEn}
                    onChange={(e) =>
                      setDraft({ ...draft, loginLinkTextEn: e.target.value })
                    }
                    placeholder={copy.loginLinkTextEnPlaceholder}
                    lang="en"
                  />
                </label>
              </>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-30">{copy.image}</span>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-gray-80">
                {draft.previewUrl ? (
                  <Image
                    src={draft.previewUrl}
                    alt=""
                    fill
                    unoptimized={draft.previewUrl.includes("/uploads/")}
                    className="object-contain"
                    sizes="400px"
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
                  setDraft({
                    ...draft,
                    file: file ?? undefined,
                    previewUrl: file
                      ? URL.createObjectURL(file)
                      : draft.previewUrl,
                  });
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-gray-70 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-80"
              >
                <Upload className="size-4" />
                {copy.upload}
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex shrink-0 gap-3 border-t border-gray-80 p-5">
            <button
              type="button"
              onClick={closeEditor}
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
