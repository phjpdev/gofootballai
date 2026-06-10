"use client";

import { useState } from "react";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { RecordCard } from "@/components/records/RecordCard";
import { RecordDetailModal } from "@/components/records/RecordDetailModal";
import { usePosts } from "@/context/PostsContext";
import type { Post } from "@/types";

export function RecordList({
  showAdminActions = false,
}: {
  showAdminActions?: boolean;
}) {
  const { posts, isLoading, removePost } = usePosts();
  const [editingRecord, setEditingRecord] = useState<Post | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Post | null>(null);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("確定刪除此紀錄？此操作無法復原。");
    if (!confirmed) return;
    await removePost(id);
    setViewingRecord((current) => (current?.id === id ? null : current));
  }

  function handleEdit(post: Post) {
    setViewingRecord(null);
    setEditingRecord(post);
  }

  if (isLoading) {
    return (
      <div className="record-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/5] animate-pulse rounded-[8px] bg-gray-90"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[20px] bg-gray-90 p-6 text-center lg:max-w-md">
        <p className="text-sm leading-[1.6] text-gray-40">
          暫無紀錄，管理員上傳後會顯示於此。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="record-grid">
        {posts.map((post) => (
          <RecordCard
            key={post.id}
            post={post}
            compact
            showAdminActions={showAdminActions}
            onOpen={setViewingRecord}
            onEdit={showAdminActions ? handleEdit : undefined}
            onDelete={
              showAdminActions ? (id) => void handleDelete(id) : undefined
            }
          />
        ))}
      </div>

      <RecordDetailModal
        post={viewingRecord}
        onClose={() => setViewingRecord(null)}
        showAdminActions={showAdminActions}
        onEdit={showAdminActions ? handleEdit : undefined}
        onDelete={
          showAdminActions ? (id) => void handleDelete(id) : undefined
        }
      />

      <CreateRecordModal
        open={!!editingRecord}
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
      />
    </>
  );
}
