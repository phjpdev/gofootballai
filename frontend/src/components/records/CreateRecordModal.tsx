"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload, Video, X } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import type { Post, PostType } from "@/types";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "text", label: "文字" },
  { value: "photo", label: "相片" },
  { value: "video", label: "影片" },
];

const TYPE_LABEL: Record<PostType, string> = {
  text: "文字",
  photo: "相片",
  video: "影片",
};

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
  const [type, setType] = useState<PostType>("photo");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setType(record.type);
      setTitle(record.title);
      setContent(record.content ?? "");
      setFile(null);
      setPreviewUrl(record.mediaUrl ?? null);
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setType("photo");
    setTitle("");
    setContent("");
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

  function handleTypeChange(nextType: PostType) {
    setType(nextType);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file && record?.mediaUrl && nextType === record.type) {
      setPreviewUrl(record.mediaUrl);
    } else if (nextType === "text") {
      setPreviewUrl(null);
    } else if (!file) {
      setPreviewUrl(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const needsNewFile =
      (type === "photo" || type === "video") &&
      !file &&
      (!isEditing || !record?.mediaUrl || type !== record.type);

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

  const accept =
    type === "photo" ? "image/*" : type === "video" ? "video/*" : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex items-center justify-between border-b border-gray-80 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditing ? "編輯紀錄" : "新增紀錄"}
            </h2>
            <p className="text-xs text-gray-40">
              {isEditing
                ? "更新標題、描述或媒體內容。"
                : "上傳相片、影片或文字公告予會員。"}
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
          className="flex flex-col gap-4 overflow-y-auto p-5"
        >
          <div className="flex gap-2">
            {POST_TYPES.map(({ value, label }) => (
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
            className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
          />

          <textarea
            placeholder="描述（選填）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
          />

          {(type === "photo" || type === "video") && (
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
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
                      : `點擊上傳${TYPE_LABEL[type]}`}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-40">
                  <Upload className="size-3" />
                  上限 50 MB
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
          )}

          {error && <p className="text-xs text-orange-50">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-14 rounded-[19px] bg-white text-base font-semibold tracking-[-0.048px] text-gray-100 disabled:opacity-60"
          >
            {isEditing ? "儲存變更" : "發佈至紀錄"}
          </button>
        </form>
      </div>
    </div>
  );
}
