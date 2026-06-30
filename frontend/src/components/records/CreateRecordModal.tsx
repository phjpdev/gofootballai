"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Star, Upload, Video, X } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import type { Post } from "@/types";

const MEDIA_TYPES: { value: "photo" | "video"; label: string }[] = [
  { value: "photo", label: "相片" },
  { value: "video", label: "影片" },
];

const fieldClass =
  "shrink-0 rounded-[14px] bg-gray-80 px-4 py-3 text-sm leading-normal text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40";

const TYPE_LABEL: Record<"photo" | "video", string> = {
  photo: "相片",
  video: "影片",
};

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const VIDEO_ACCEPT =
  "video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.m4v,.webm,.avi,.mkv,.3gp";

const FILE_ACCEPT = `image/*,${VIDEO_ACCEPT}`;

function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|mov|webm|m4v|avi|mkv|mpeg|mpg|3gp|3g2|wmv)$/i.test(file.name);
}

function isPhotoFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|heic|heif|bmp|avif)$/i.test(file.name);
}

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveDisplayDate(record?: Post | null): string {
  if (record?.displayDate) return record.displayDate;
  if (record?.createdAt) return record.createdAt.slice(0, 10);
  return todayDateInputValue();
}

export function CreateRecordModal({
  open,
  onClose,
  record,
}: {
  open: boolean;
  onClose: () => void;
  record?: Post | null;
}) {
  const { addPost, editPost } = usePosts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!record;
  const [type, setType] = useState<"photo" | "video">("photo");
  const [title, setTitle] = useState("");
  const [displayDate, setDisplayDate] = useState(todayDateInputValue());
  const [content, setContent] = useState("");
  const [starRating, setStarRating] = useState("5.0");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setType(record.type === "video" ? "video" : "photo");
      setTitle(record.title);
      setDisplayDate(resolveDisplayDate(record));
      setContent(record.content ?? "");
      setStarRating(
        record.starRating !== undefined ? String(record.starRating) : "0",
      );
      setFile(null);
      setPreviewUrl(record.mediaUrl ?? null);
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setType("photo");
    setTitle("");
    setDisplayDate(todayDateInputValue());
    setContent("");
    setStarRating("5.0");
    setFile(null);
    setPreviewUrl(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, record]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function handleClose() {
    onClose();
  }

  function handleTypeChange(nextType: "photo" | "video") {
    setType(nextType);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file && record?.mediaUrl && nextType === record.type) {
      setPreviewUrl(record.mediaUrl);
    } else if (!file) {
      setPreviewUrl(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.size > MAX_UPLOAD_BYTES) {
      setError(`檔案大小不能超過 ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (isVideoFile(selected)) {
      if (type !== "video") setType("video");
    } else if (isPhotoFile(selected)) {
      if (type !== "photo") setType("photo");
    } else {
      setError("請選擇有效的圖片或影片檔案（例如 JPG、PNG、MP4、MOV）");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selected);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const rating = Number(starRating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("請填寫 0 至 5 的星級評分");
      return;
    }

    const needsNewFile =
      !file && (!isEditing || !record?.mediaUrl || type !== record.type);

    if (needsNewFile) {
      setError(`請選擇要上傳的${TYPE_LABEL[type]}檔案`);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        type,
        title: title.trim(),
        content: content.trim() || undefined,
        displayDate,
        starRating: Math.round(rating * 10) / 10,
        file: file ?? undefined,
      };

      if (isEditing && record) {
        await editPost(record.id, payload);
      } else {
        await addPost(payload);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存紀錄失敗");
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
        onClick={handleClose}
      />

      <div className="relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:max-h-[90vh] sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditing ? "編輯紀錄" : "新增紀錄"}
            </h2>
            <p className="text-xs text-gray-40">
              {isEditing
                ? "更新標題、日期、描述、星級或媒體內容。"
                : "上傳相片或影片，並填寫標題、日期、描述與星級。"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
            <div className="flex gap-2">
              {MEDIA_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={`flex-1 rounded-[14px] px-3 py-2 text-xs font-bold tracking-[-0.018px] ${
                    type === value
                      ? "bg-orange-50 text-white"
                      : "bg-gray-80 text-gray-40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="標題"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={fieldClass}
            />

            <label className="flex shrink-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-30">日期</span>
              <input
                type="date"
                value={displayDate}
                onChange={(e) => setDisplayDate(e.target.value)}
                required
                className={`${fieldClass} [color-scheme:dark]`}
              />
            </label>

            <label className="flex shrink-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-30">描述</span>
              <textarea
                placeholder="描述"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className={`${fieldClass} min-h-[6.5rem] resize-none`}
              />
            </label>

            <label className="flex shrink-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-30">星級（0–5）</span>
              <div className="flex min-h-12 shrink-0 items-center gap-3 rounded-[14px] bg-gray-80 px-4 py-3">
                <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={starRating}
                  onChange={(e) => setStarRating(e.target.value)}
                  required
                  className="min-h-6 w-full bg-transparent py-0 text-sm leading-normal text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </label>

            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-70 bg-gray-80 px-4 py-8 text-gray-30"
              >
                {type === "photo" ? (
                  <ImageIcon className="size-6 text-orange-50" />
                ) : (
                  <Video className="size-6 text-orange-50" />
                )}
                <span className="text-sm font-medium">
                  {file
                    ? file.name
                    : isEditing && record?.mediaUrl && type === record.type
                      ? "點擊以替換現有檔案"
                      : `點擊上傳${TYPE_LABEL[type]}（或選擇其他媒體類型）`}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-40">
                  <Upload className="size-3" />
                  上限 100 MB
                </span>
              </button>

              {previewUrl && type === "photo" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="預覽"
                  className="max-h-48 w-full rounded-[14px] object-contain"
                />
              )}

              {previewUrl && type === "video" && (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-48 w-full rounded-[14px] object-contain"
                />
              )}
            </div>

            {error && <p className="text-xs text-orange-50">{error}</p>}
          </div>

          <div className="shrink-0 border-t border-gray-80 bg-gray-90 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="submit"
              disabled={submitting}
              className="h-14 w-full rounded-[19px] bg-white text-base font-semibold tracking-[-0.048px] text-gray-100 disabled:opacity-60"
            >
              {isEditing ? "儲存變更" : "發佈至紀錄"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
