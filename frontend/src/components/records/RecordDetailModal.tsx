"use client";

import { useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

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

  const hasMedia =
    (post.type === "photo" || post.type === "video") && !!post.mediaUrl;

  return (
    <div className="fixed inset-x-0 top-[72px] bottom-20 z-40 flex flex-col bg-gray-100 lg:top-24 lg:bottom-0">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-90 px-4 py-3">
        <time className="text-sm text-gray-40">
          {formatRecordDate(post.createdAt)}
        </time>
        <div className="flex items-center gap-2">
          {showAdminActions && onEdit && (
            <button
              type="button"
              aria-label="編輯紀錄"
              onClick={() => onEdit(post)}
              className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-white"
            >
              <Pencil className="size-4" strokeWidth={2} />
            </button>
          )}
          {showAdminActions && onDelete && (
            <button
              type="button"
              aria-label="刪除紀錄"
              onClick={() => onDelete(post.id)}
              className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-white"
            >
              <Trash2 className="size-4" strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            aria-label="關閉"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-gray-90 text-white"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden",
          !hasMedia && "bg-gray-90",
        )}
      >
        {post.type === "photo" && post.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {post.type === "video" && post.mediaUrl && (
          <video
            src={post.mediaUrl}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {hasMedia && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
            aria-hidden
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 overflow-y-auto px-5 pb-12 pt-6 text-center">
          <h2 className="text-2xl font-bold leading-snug text-white">
            {post.title}
          </h2>
          {post.content && (
            <p
              className={cn(
                "max-w-lg whitespace-pre-wrap text-base leading-[1.7]",
                hasMedia ? "text-white/90" : "text-gray-20",
              )}
            >
              {post.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
