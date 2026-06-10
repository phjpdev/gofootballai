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
        "relative w-full overflow-hidden rounded-[16px] bg-white text-gray-900 shadow-sm lg:rounded-[20px]",
        onOpen && "cursor-pointer transition-transform hover:scale-[1.01]",
      )}
    >
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

      {post.type === "photo" && post.mediaUrl && (
        <div className="w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt={post.title}
            className={cn(
              "w-full object-cover",
              compact
                ? "aspect-[3/4] max-h-[200px] lg:max-h-none"
                : "aspect-[4/5] max-h-[420px] object-contain",
            )}
          />
        </div>
      )}

      {post.type === "video" && post.mediaUrl && (
        <div className="w-full bg-black">
          <video
            src={post.mediaUrl}
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full",
              compact
                ? "aspect-[3/4] max-h-[200px] object-cover lg:max-h-none"
                : "aspect-[4/5] max-h-[420px] object-contain",
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col",
          compact
            ? "gap-1.5 px-3 pb-3 pt-2 lg:gap-2 lg:px-3 lg:pb-3 lg:pt-2"
            : "gap-3 px-5 pb-5 pt-4",
          !hasMedia && showAdminActions && "pt-12",
        )}
      >
        <time
          className={cn(
            "text-gray-500",
            compact ? "text-[10px] leading-tight lg:text-[11px]" : "text-sm",
          )}
        >
          {formatRecordDate(post.createdAt)}
        </time>

        <h3
          className={cn(
            "font-bold leading-snug text-gray-900",
            compact ? "line-clamp-2 text-xs lg:text-sm" : "text-lg",
          )}
        >
          {post.title}
        </h3>

        {previewContent && (
          <p
            className={cn(
              "whitespace-pre-wrap text-gray-700",
              compact
                ? "line-clamp-2 text-[10px] leading-snug lg:text-[11px]"
                : "text-sm leading-[1.7]",
            )}
          >
            {previewContent}
          </p>
        )}
      </div>
    </article>
  );
}
