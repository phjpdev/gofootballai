"use client";

import { RecordCard } from "@/components/records/RecordCard";
import { SubNav } from "@/components/layout/SubNav";
import { usePosts } from "@/context/PostsContext";

export function PostFeed() {
  const { posts } = usePosts();

  if (posts.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SubNav title="Latest Updates" />
        <div className="flex h-[320px] items-center justify-center rounded-[20px] bg-gray-90 p-6 text-center">
          <p className="text-sm leading-[1.6] text-gray-40">
            No updates yet. Admin posts will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SubNav title="Latest Updates" count={posts.length} />
      {posts.map((post) => (
        <RecordCard key={post.id} post={post} />
      ))}
    </section>
  );
}
