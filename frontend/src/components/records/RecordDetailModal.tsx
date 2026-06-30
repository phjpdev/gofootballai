"use client";

import { useEffect, useState } from "react";
import { Pencil, Star, Trash2, X } from "lucide-react";
import { RecordVideo } from "@/components/records/RecordVideo";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

function formatDisplayDate(post: Post): string {
  const source = post.displayDate ?? post.createdAt;
  const date = post.displayDate
    ? new Date(`${post.displayDate}T12:00:00`)
    : new Date(source);
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
  const [videoError, setVideoError] = useState(false);

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

  useEffect(() => {
    setVideoError(false);
  }, [post?.mediaUrl]);

  if (!post) return null;

  const hasMedia =
    (post.type === "photo" || post.type === "video") && !!post.mediaUrl;

  return (
    <div className="fixed inset-x-0 top-[var(--header-total)] bottom-[var(--mobile-nav-total)] z-40 flex flex-col bg-gray-100 lg:bottom-0">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-90 px-4 py-3">
        <time className="text-sm text-gray-40">
          {formatDisplayDate(post)}
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
          "relative flex min-h-0 flex-1 items-center justify-center overflow-hidden",
          hasMedia ? "bg-black" : "bg-gray-90",
        )}
      >
        {post.type === "photo" && post.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        )}

        {post.type === "video" && post.mediaUrl && !videoError && (
          <RecordVideo
            src={post.mediaUrl}
            mode="player"
            onError={() => setVideoError(true)}
            className="h-full w-full max-h-full max-w-full object-contain"
          />
        )}

        {post.type === "video" && videoError && (
          <p className="px-6 text-center text-sm text-gray-30">
            無法播放此影片。請刪除後重新上傳，系統會自動轉換為相容格式。
          </p>
        )}

        {!hasMedia && (
          <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-12 text-center">
            <h2 className="text-2xl font-bold leading-snug text-white">
              {post.title}
            </h2>
            {post.content && (
              <p className="max-w-lg whitespace-pre-wrap text-base leading-[1.7] text-gray-20">
                {post.content}
              </p>
            )}
            {post.starRating !== undefined && (
              <div className="flex items-center gap-1.5">
                <Star className="size-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-white">
                  {post.starRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
