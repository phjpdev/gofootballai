"use client";

import { useState } from "react";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { RecordList } from "@/components/records/RecordList";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";

export default function RecordsPage() {
  const { isAdmin, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-[420px] animate-pulse rounded-[20px] bg-gray-90" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <section className="flex flex-col gap-4">
        {isAdmin ? (
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm leading-[1.6] text-gray-40">
              點擊 + 上傳相片、影片或文字公告。
            </p>
            <button
              type="button"
              aria-label="新增紀錄"
              onClick={() => setModalOpen(true)}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-white shadow-lg lg:size-16"
            >
              <Plus className="size-6 lg:size-8" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <p className="text-sm leading-[1.6] text-gray-40">
            Go football 每日紀錄
          </p>
        )}

        <RecordList showAdminActions={isAdmin} />
      </section>

      {isAdmin && (
        <CreateRecordModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
