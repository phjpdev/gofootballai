"use client";

import { Pencil, Star, Trash2 } from "lucide-react";
import { RecordVideo } from "@/components/records/RecordVideo";
import type { Post } from "@/types";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { localizedText } from "@/lib/i18n/localized";
import { getMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

const CONTENT_PREVIEW_LENGTH = 72;

/** "2026年9月28日(週一)" / "28 Sept 2026 (Mon)" */
export function formatRecordDate(post: Post, locale: Locale): string {
  // displayDate is a HK calendar day; noon keeps it on the same day in any zone.
  const date = post.displayDate
    ? `${post.displayDate}T12:00:00+08:00`
    : post.createdAt;
  const formatted = formatDate(date, locale, {
    year: "numeric",
    month: locale === "en" ? "short" : "long",
    day: "numeric",
  });
  const weekday = formatDate(date, locale, { weekday: "short" });
  return getMessages(locale).records.dateLabel(formatted, weekday);
}

function StarRating({
  rating,
  compact,
  inverted,
}: {
  rating: number;
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Star
        className={cn(
          "shrink-0 fill-amber-400 text-amber-400",
          compact ? "size-3.5" : "size-4",
        )}
      />
      <span
        className={cn(
          "font-bold leading-none",
          compact ? "text-sm" : "text-base",
          inverted ? "text-white" : "text-gray-900",
        )}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
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
  const { locale, t } = useI18n();
  const hasMedia =
    (post.type === "photo" || post.type === "video") && !!post.mediaUrl;
  const title = localizedText(locale, post.title, post.titleEn);
  const content = localizedText(locale, post.content, post.contentEn);
  const previewContent =
    content.length > CONTENT_PREVIEW_LENGTH
      ? `${content.slice(0, CONTENT_PREVIEW_LENGTH).trim()}…`
      : content;

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
        "relative w-full overflow-hidden rounded-[16px] shadow-sm",
        compact ? "aspect-[3/4]" : "aspect-[4/5]",
        onOpen && "cursor-pointer transition-transform hover:scale-[1.01]",
        !hasMedia && "bg-gray-90",
      )}
    >
      {post.type === "photo" && post.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.mediaUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {post.type === "video" && post.mediaUrl && (
        <RecordVideo
          src={post.mediaUrl}
          mode="preview"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {hasMedia && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15"
          aria-hidden
        />
      )}

      {showAdminActions && (onEdit || onDelete) && (
        <div className="absolute right-2 top-2 z-10 flex gap-1.5">
          {onEdit && (
            <button
              type="button"
              aria-label={t.records.card.edit}
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
              aria-label={t.records.card.delete}
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
          "absolute inset-x-0 bottom-0 z-[1] flex flex-col items-center text-center",
          compact ? "gap-1 px-3 pb-4 pt-8" : "gap-2 px-5 pb-6 pt-10",
        )}
      >
        <h3
          className={cn(
            "w-full shrink-0 font-bold leading-tight",
            hasMedia ? "text-white" : "text-gray-900",
            compact ? "line-clamp-2 text-lg lg:text-xl" : "line-clamp-2 text-2xl",
          )}
        >
          {title}
        </h3>

        <time
          className={cn(
            "shrink-0",
            hasMedia ? "text-white/80" : "text-gray-500",
            compact ? "text-[10px] lg:text-[11px]" : "text-sm",
          )}
        >
          {formatRecordDate(post, locale)}
        </time>

        {previewContent && (
          <p
            className={cn(
              "w-full shrink-0 overflow-hidden whitespace-pre-wrap",
              hasMedia ? "text-white/85" : "text-gray-700",
              compact
                ? "line-clamp-2 text-[10px] leading-snug lg:text-[11px]"
                : "line-clamp-2 text-sm leading-snug",
            )}
          >
            {previewContent}
          </p>
        )}

        {post.starRating !== undefined && (
          <div className={cn("shrink-0", compact ? "mt-1" : "mt-2")}>
            <StarRating
              rating={post.starRating}
              compact={compact}
              inverted={hasMedia}
            />
          </div>
        )}
      </div>
    </article>
  );
}
