"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHomeSections } from "@/context/HomeSectionsContext";
import {
  HOME_SECTION_LABELS,
  type HomeSection,
  type HomeSectionId,
} from "@/lib/data/home-sections";
import {
  resolveHomeSectionImageUrl,
  updateHomeSection,
} from "@/lib/home-sections-api";

const fieldClass =
  "w-full rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

type SectionDraft = {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  loginPrompt: string;
  loginLinkText: string;
  previewUrl: string;
  file?: File;
};

function createDraft(section: HomeSection): SectionDraft {
  return {
    eyebrow: section.eyebrow ?? "",
    title: section.title,
    description: section.description,
    ctaText: section.ctaText ?? "",
    loginPrompt: section.loginPrompt ?? "",
    loginLinkText: section.loginLinkText ?? "",
    previewUrl: resolveHomeSectionImageUrl(section.imageSrc),
  };
}

export function EditHomeSectionModal() {
  const { token } = useAuth();
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
      setError("請填寫標題與描述");
      return;
    }

    if (
      isHero &&
      (!draft.eyebrow.trim() ||
        !draft.ctaText.trim() ||
        !draft.loginPrompt.trim() ||
        !draft.loginLinkText.trim())
    ) {
      setError("請填寫首頁英雄區所有文字欄位");
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
        file: draft.file,
      });
      updateSection(updated);
      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSubmitting(false);
    }
  }

  if (!editingId || !draft || !section) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-black/70"
        onClick={closeEditor}
      />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">
              編輯{HOME_SECTION_LABELS[editingId]}
            </h2>
            <p className="text-xs text-gray-40">
              更新此區塊的文字與圖片，所有用戶將會看到最新內容。
            </p>
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
            {isHero && (
              <label className="flex flex-col gap-2 text-sm text-gray-30">
                副標題
                <input
                  className={fieldClass}
                  value={draft.eyebrow}
                  onChange={(e) =>
                    setDraft({ ...draft, eyebrow: e.target.value })
                  }
                  placeholder="例如：GO Football AI"
                />
              </label>
            )}

            <label className="flex flex-col gap-2 text-sm text-gray-30">
              標題
              <input
                className={fieldClass}
                value={draft.title}
                onChange={(e) =>
                  setDraft({ ...draft, title: e.target.value })
                }
                placeholder="區塊標題"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-30">
              描述
              <textarea
                className={`${fieldClass} min-h-[96px] resize-y`}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
                placeholder="區塊描述"
                rows={4}
              />
            </label>

            {isHero && (
              <>
                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  按鈕文字
                  <input
                    className={fieldClass}
                    value={draft.ctaText}
                    onChange={(e) =>
                      setDraft({ ...draft, ctaText: e.target.value })
                    }
                    placeholder="例如：立即開始"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  登入提示
                  <input
                    className={fieldClass}
                    value={draft.loginPrompt}
                    onChange={(e) =>
                      setDraft({ ...draft, loginPrompt: e.target.value })
                    }
                    placeholder="例如：已有帳戶？"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-gray-30">
                  登入連結文字
                  <input
                    className={fieldClass}
                    value={draft.loginLinkText}
                    onChange={(e) =>
                      setDraft({ ...draft, loginLinkText: e.target.value })
                    }
                    placeholder="例如：登入"
                  />
                </label>
              </>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-30">區塊圖片</span>
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
                上傳圖片
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
