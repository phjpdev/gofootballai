"use client";

import Image from "next/image";
import { FileText, ImageIcon, Video } from "lucide-react";
import { usePosts } from "@/context/PostsContext";
import { SubNav } from "@/components/layout/SubNav";
import type { PostType } from "@/types";

const TYPE_ICONS: Record<PostType, typeof FileText> = {
  text: FileText,
  photo: ImageIcon,
  video: Video,
};

function PostCard({ post }: { post: ReturnType<typeof usePosts>["posts"][0] }) {
  const Icon = TYPE_ICONS[post.type];

  return (
    <article className="overflow-hidden rounded-[24px] bg-gray-90">
      {post.type === "photo" && post.mediaUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={post.mediaUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}
      {post.type === "video" && post.mediaUrl && (
        <div className="bg-gray-80">
          <video
            src={post.mediaUrl}
            controls
            className="h-48 w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gray-80">
            <Icon className="size-4 text-orange-50" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold tracking-[-0.048px] text-white">
            {post.title}
          </h3>
        </div>
        {post.content && (
          <p className="text-sm leading-[1.6] tracking-[-0.028px] text-gray-20">
            {post.content}
          </p>
        )}
        <time className="text-xs font-medium text-gray-40">
          {new Date(post.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </article>
  );
}

export function PostFeed() {
  const { posts } = usePosts();

  if (posts.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SubNav title="Latest Updates" />
        <div className="rounded-[24px] bg-gray-90 p-6 text-center">
          <p className="text-sm leading-[1.6] text-gray-40">
            No updates yet. Admin posts will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <SubNav title="Latest Updates" count={posts.length} />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
