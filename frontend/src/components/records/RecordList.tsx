"use client";

import { useState } from "react";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { RecordCard } from "@/components/records/RecordCard";
import { usePosts } from "@/context/PostsContext";
import type { Post } from "@/types";

export function RecordList({
  showAdminActions = false,
}: {
  showAdminActions?: boolean;
}) {
  const { posts, isLoading, removePost } = usePosts();
  const [editingRecord, setEditingRecord] = useState<Post | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this record? This cannot be undone.",
    );
    if (!confirmed) return;
    await removePost(id);
  }

  if (isLoading) {
    return <div className="h-[420px] animate-pulse rounded-[20px] bg-gray-90" />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-[20px] bg-gray-90 p-6 text-center">
        <p className="text-sm leading-[1.6] text-gray-40">
          No records yet. Admin uploads will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <RecordCard
            key={post.id}
            post={post}
            showAdminActions={showAdminActions}
            onEdit={showAdminActions ? setEditingRecord : undefined}
            onDelete={
              showAdminActions ? (id) => void handleDelete(id) : undefined
            }
          />
        ))}
      </div>

      <CreateRecordModal
        open={!!editingRecord}
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
      />
    </>
  );
}
