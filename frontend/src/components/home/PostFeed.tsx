"use client";

import { useState } from "react";
import { RecordCard } from "@/components/records/RecordCard";
import { RecordDetailModal } from "@/components/records/RecordDetailModal";
import { SubNav } from "@/components/layout/SubNav";
import { usePosts } from "@/context/PostsContext";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Post } from "@/types";

export function PostFeed() {
  const { posts } = usePosts();
  const { t } = useI18n();
  const [viewingRecord, setViewingRecord] = useState<Post | null>(null);

  if (posts.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SubNav title={t.home.postFeed.title} />
        <div className="flex h-[320px] items-center justify-center rounded-[20px] bg-gray-90 p-6 text-center lg:max-w-md">
          <p className="text-sm leading-[1.6] text-gray-40">
            {t.home.postFeed.empty}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SubNav title={t.home.postFeed.title} count={posts.length} />
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
