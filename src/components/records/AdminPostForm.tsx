"use client";

import { useState } from "react";
import { usePosts } from "@/context/PostsContext";
import type { PostType } from "@/types";

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
];

export function AdminPostForm() {
  const { addPost } = usePosts();
  const [type, setType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    addPost({
      type,
      title: title.trim(),
      content: content.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
    });

    setTitle("");
    setContent("");
    setMediaUrl("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {POST_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
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
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
      />

      <textarea
        placeholder="Description (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
      />

      {(type === "photo" || type === "video") && (
        <input
          type="url"
          placeholder={`${type === "photo" ? "Photo" : "Video"} URL`}
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          required
          className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
        />
      )}

      <button
        type="submit"
        className="h-14 rounded-[19px] bg-white text-base font-semibold tracking-[-0.048px] text-gray-100"
      >
        Publish to Home
      </button>

      {submitted && (
        <p className="text-center text-sm font-medium text-orange-50">
          Published! Visible on Home page.
        </p>
      )}
    </form>
  );
}
