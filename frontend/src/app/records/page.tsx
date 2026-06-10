"use client";

import { useState } from "react";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { RecordList } from "@/components/records/RecordList";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Lock, Plus } from "lucide-react";

export default function RecordsPage() {
  const { isAdmin, isMember, isAuthenticated, isLoading } = useAuth();
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
      {isAuthenticated && (isMember || isAdmin) ? (
        <section className="flex flex-col gap-4">
          {isAdmin && (
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm leading-[1.6] text-gray-40">
                Tap + to upload photos, videos, or text announcements.
              </p>
              <button
                type="button"
                aria-label="Create record"
                onClick={() => setModalOpen(true)}
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-white shadow-lg lg:size-16"
              >
                <Plus
                  className="size-6 lg:size-8"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          )}
          <RecordList showAdminActions={isAdmin} />
        </section>
      ) : (
        <section className="flex flex-col items-center gap-4 rounded-[24px] bg-gray-90 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-80">
            <Lock className="size-6 text-gray-40" />
          </div>
          <h2 className="text-base font-bold text-white">Members Only</h2>
          <p className="text-sm leading-[1.6] text-gray-40">
            Log in or sign up on the Member page to view admin uploads.
          </p>
          <Link
            href="/member"
            className="rounded-[19px] bg-orange-50 px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Member
          </Link>
        </section>
      )}

      {isAdmin && (
        <CreateRecordModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
