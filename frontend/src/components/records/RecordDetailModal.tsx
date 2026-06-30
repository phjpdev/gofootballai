"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Star, Trash2, X } from "lucide-react";
import { RecordVideo } from "@/components/records/RecordVideo";
import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/context/PostsContext";
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
  const { isAdmin } = useAuth();
  const { retranscodePost } = usePosts();
  const [activePost, setActivePost] = useState<Post | null>(post);
  const [videoIssue, setVideoIssue] = useState<"decode" | "network" | null>(
    null,
  );
  const [retranscoding, setRetranscoding] = useState(false);
  const [retranscodeError, setRetranscodeError] = useState("");

  useEffect(() => {
    setActivePost(post);
    setVideoIssue(null);
    setRetranscodeError("");
  }, [post]);

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

  if (!post || !activePost) return null;

  const hasMedia =
    (activePost.type === "photo" || activePost.type === "video") &&
    !!activePost.mediaUrl;

  async function handleRetranscode() {
    if (!activePost) return;
    setRetranscoding(true);
    setRetranscodeError("");
    try {
      const record = await retranscodePost(activePost.id);
      setActivePost(record);
      setVideoIssue(null);
    } catch (error) {
      setRetranscodeError(
        error instanceof Error ? error.message : "影片轉換失敗",
      );
    } finally {
      setRetranscoding(false);
    }
  }

  return (
    <div className="fixed inset-x-0 top-[var(--header-total)] bottom-[var(--mobile-nav-total)] z-40 flex flex-col bg-gray-100 lg:bottom-0">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-90 px-4 py-3">
        <time className="text-sm text-gray-40">
          {formatDisplayDate(activePost)}
        </time>
        <div className="flex items-center gap-2">
          {showAdminActions && onEdit && (
            <button
              type="button"
              aria-label="編輯紀錄"
              onClick={() => onEdit(activePost)}
              className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-white"
            >
              <Pencil className="size-4" strokeWidth={2} />
            </button>
          )}
          {showAdminActions && onDelete && (
            <button
              type="button"
              aria-label="刪除紀錄"
              onClick={() => onDelete(activePost.id)}
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
        {activePost.type === "photo" && activePost.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activePost.mediaUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        )}

        {activePost.type === "video" && activePost.mediaUrl && !videoIssue && (
          <RecordVideo
            src={activePost.mediaUrl}
            mode="player"
            onError={() => setVideoIssue("network")}
            onDecodeIssue={() => setVideoIssue("decode")}
            className="h-full w-full max-h-full max-w-full object-contain"
          />
        )}

        {activePost.type === "video" && videoIssue && (
          <div className="flex max-w-sm flex-col items-center gap-4 px-6 text-center">
            <p className="text-sm text-gray-30">
              {videoIssue === "decode"
                ? "此影片為 iPhone HEVC 格式，Chrome 無法播放。請轉換為 H.264 後再試。"
                : "無法載入影片，請檢查網路或稍後再試。"}
            </p>
            {isAdmin && (
              <button
                type="button"
                disabled={retranscoding}
                onClick={() => void handleRetranscode()}
                className="flex items-center gap-2 rounded-full bg-orange-50 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {retranscoding && <Loader2 className="size-4 animate-spin" />}
                {retranscoding ? "轉換中…" : "轉換為可播放格式"}
              </button>
            )}
            {retranscodeError && (
              <p className="text-xs text-orange-50">{retranscodeError}</p>
            )}
          </div>
        )}

        {!hasMedia && (
          <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto px-5 py-12 text-center">
            <h2 className="text-2xl font-bold leading-snug text-white">
              {activePost.title}
            </h2>
            {activePost.content && (
              <p className="max-w-lg whitespace-pre-wrap text-base leading-[1.7] text-gray-20">
                {activePost.content}
              </p>
            )}
            {activePost.starRating !== undefined && (
              <div className="flex items-center gap-1.5">
                <Star className="size-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-white">
                  {activePost.starRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
