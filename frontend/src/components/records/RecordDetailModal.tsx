"use client";

import { useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import type { Post } from "@/types";

function formatRecordDate(iso: string): string {
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat("zh-HK", { weekday: "short" }).format(
    date,
  );
  const formatted = new Intl.DateTimeFormat("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  return `${formatted}(${weekday})`;
}

export function RecordDetailModal({
  post,
  onClose,
  showAdminActions,
  onEdit,
  onDelete,
}: {
  post: Post | null;
  onClose: () => void;
  showAdminActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}) {
  useEffect(() => {
    if (!post) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">
      <div className="flex items-center justify-between gap-3 border-b border-gray-90 px-4 py-3">
        <time className="text-sm text-gray-40">
          {formatRecordDate(post.createdAt)}
        </time>
        <div className="flex items-center gap-2">
          {showAdminActions && onEdit && (
            <button
              type="button"
              aria-label="Edit record"
              onClick={() => onEdit(post)}
              className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-white"
            >
              <Pencil className="size-4" strokeWidth={2} />
            </button>
          )}
          {showAdminActions && onDelete && (
            <button
              type="button"
              aria-label="Delete record"
              onClick={() => onDelete(post.id)}
              className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-white"
            >
              <Trash2 className="size-4" strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-gray-90 text-white"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {post.type === "photo" && post.mediaUrl && (
          <div className="flex min-h-[40vh] w-full items-center justify-center bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
        )}

        {post.type === "video" && post.mediaUrl && (
          <div className="flex min-h-[40vh] w-full items-center justify-center bg-black">
            <video
              src={post.mediaUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
        )}

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-6">
          <h2 className="text-2xl font-bold leading-snug text-white">
            {post.title}
          </h2>
          {post.content && (
            <p className="whitespace-pre-wrap text-base leading-[1.7] text-gray-20">
              {post.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
