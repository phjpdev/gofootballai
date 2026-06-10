"use client";

import { useState } from "react";
import { RecordCard } from "@/components/records/RecordCard";
import { RecordDetailModal } from "@/components/records/RecordDetailModal";
import { SubNav } from "@/components/layout/SubNav";
import { usePosts } from "@/context/PostsContext";
import type { Post } from "@/types";

export function PostFeed() {
  const { posts } = usePosts();
  const [viewingRecord, setViewingRecord] = useState<Post | null>(null);

  if (posts.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SubNav title="Latest Updates" />
        <div className="flex h-[320px] items-center justify-center rounded-[20px] bg-gray-90 p-6 text-center lg:max-w-md">
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
      <div className="record-grid">
        {posts.map((post) => (
          <RecordCard
            key={post.id}
            post={post}
            compact
            onOpen={setViewingRecord}
          />
        ))}
      </div>

      <RecordDetailModal
        post={viewingRecord}
        onClose={() => setViewingRecord(null)}
      />
    </section>
  );
}
