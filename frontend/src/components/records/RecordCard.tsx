"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/types";

const CONTENT_PREVIEW_LENGTH = 140;

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
  showAdminActions,
  onEdit,
  onDelete,
}: {
  post: Post;
  showAdminActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongContent =
    !!post.content && post.content.length > CONTENT_PREVIEW_LENGTH;
  const displayContent =
    expanded || !hasLongContent
      ? post.content
      : `${post.content!.slice(0, CONTENT_PREVIEW_LENGTH).trim()}…`;
  const hasMedia =
    (post.type === "photo" || post.type === "video") && !!post.mediaUrl;

  return (
    <article className="relative w-full overflow-hidden rounded-[20px] bg-white text-gray-900 shadow-sm">
      {showAdminActions && (onEdit || onDelete) && (
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          {onEdit && (
            <button
              type="button"
              aria-label="Edit record"
              onClick={() => onEdit(post)}
              className="flex size-9 items-center justify-center rounded-full bg-orange-50 text-white shadow-lg"
            >
              <Pencil className="size-4" strokeWidth={2} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="Delete record"
              onClick={() => onDelete(post.id)}
              className="flex size-9 items-center justify-center rounded-full bg-orange-50 text-white shadow-lg"
            >
              <Trash2 className="size-4" strokeWidth={2} />
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
            className="aspect-[4/5] max-h-[420px] w-full object-contain"
          />
        </div>
      )}

      {post.type === "video" && post.mediaUrl && (
        <div className="w-full bg-black">
          <video
            src={post.mediaUrl}
            controls
            playsInline
            className="aspect-[4/5] max-h-[420px] w-full object-contain"
          />
        </div>
      )}

      <div
        className={`flex flex-col gap-3 px-5 pb-5 ${hasMedia ? "pt-4" : "pt-14"}`}
      >
        <time className="text-sm text-gray-500">
          {formatRecordDate(post.createdAt)}
        </time>

        <h3 className="text-lg font-bold leading-snug text-gray-900">
          {post.title}
        </h3>

        {displayContent && (
          <p className="whitespace-pre-wrap text-sm leading-[1.7] text-gray-700">
            {displayContent}
          </p>
        )}

        {hasLongContent && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="self-start text-sm font-medium text-blue-600"
          >
            {expanded ? "收起" : "閱讀更多"}
          </button>
        )}
      </div>
    </article>
  );
}
