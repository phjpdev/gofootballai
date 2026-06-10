"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

const CONTENT_PREVIEW_LENGTH = 80;

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

export function RecordCard({
  post,
  compact = false,
  showAdminActions,
  onOpen,
  onEdit,
  onDelete,
}: {
  post: Post;
  compact?: boolean;
  showAdminActions?: boolean;
  onOpen?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}) {
  const hasMedia =
    (post.type === "photo" || post.type === "video") && !!post.mediaUrl;
  const previewContent =
    post.content && post.content.length > CONTENT_PREVIEW_LENGTH
      ? `${post.content.slice(0, CONTENT_PREVIEW_LENGTH).trim()}…`
      : post.content;

  function handleCardClick() {
    onOpen?.(post);
  }

  return (
    <article
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen ? handleCardClick : undefined}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      className={cn(
        "relative w-full overflow-hidden rounded-[8px] shadow-sm",
        compact ? "aspect-[3/4]" : "aspect-[4/5]",
        onOpen && "cursor-pointer transition-transform hover:scale-[1.01]",
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
          playsInline
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {hasMedia && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
          aria-hidden
        />
      )}

      {showAdminActions && (onEdit || onDelete) && (
        <div className="absolute right-2 top-2 z-10 flex gap-1.5">
          {onEdit && (
            <button
              type="button"
              aria-label="編輯紀錄"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post);
              }}
              className={cn(
                "flex items-center justify-center rounded-full bg-orange-50 text-white shadow-lg",
                compact ? "size-7 lg:size-8" : "size-9",
              )}
            >
              <Pencil
                className={compact ? "size-3 lg:size-3.5" : "size-4"}
                strokeWidth={2}
              />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="刪除紀錄"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post.id);
              }}
              className={cn(
                "flex items-center justify-center rounded-full bg-orange-50 text-white shadow-lg",
                compact ? "size-7 lg:size-8" : "size-9",
              )}
            >
              <Trash2
                className={compact ? "size-3 lg:size-3.5" : "size-4"}
                strokeWidth={2}
              />
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center overflow-hidden text-center",
          compact ? "h-[44%] gap-1 px-3 pb-4 pt-2" : "h-[40%] gap-1.5 px-5 pb-6 pt-3",
        )}
      >
        <time
          className={cn(
            "shrink-0",
            hasMedia ? "text-white/80" : "text-gray-500",
            compact ? "text-[10px] leading-tight lg:text-[11px]" : "text-sm",
          )}
        >
          {formatRecordDate(post.createdAt)}
        </time>

        <h3
          className={cn(
            "shrink-0 font-bold leading-snug",
            hasMedia ? "text-white" : "text-gray-900",
            compact ? "line-clamp-2 text-xs lg:text-sm" : "text-lg",
          )}
        >
          {post.title}
        </h3>

        {previewContent && (
          <p
            className={cn(
              "min-h-0 flex-1 overflow-hidden whitespace-pre-wrap",
              hasMedia ? "text-white/90" : "text-gray-700",
              compact
                ? "line-clamp-3 text-[10px] leading-snug lg:text-[11px]"
                : "line-clamp-4 text-sm leading-[1.7]",
            )}
          >
            {previewContent}
          </p>
        )}
      </div>
    </article>
  );
}
