"use client";

import Link from "next/link";
import { FolderOpen, Lock } from "lucide-react";
import { AuthForm } from "@/components/member/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function ManagePage() {
  const { isAdmin, isMember, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" />;
  }

  if (isAuthenticated && isMember && !isAdmin) {
    return (
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-white">Manage</h1>
          <p className="text-sm leading-[1.6] text-gray-40">
            Admin tools for uploads, records, and platform management.
          </p>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-[24px] bg-gray-90 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-80">
            <Lock className="size-6 text-gray-40" />
          </div>
          <h2 className="text-base font-bold text-white">Admin Only</h2>
          <p className="text-sm leading-[1.6] text-gray-40">
            This page is for administrators. Members can use the Member page
            instead.
          </p>
          <Link
            href="/member"
            className="rounded-[19px] bg-orange-50 px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Member
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-white">Manage</h1>
        <p className="text-sm leading-[1.6] text-gray-40">
          Admin tools for uploads, records, and platform management.
        </p>
      </section>

      <AuthForm portalRole="admin" termsHref="/member#terms" />

      {isAdmin ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-white">Quick actions</h2>
          <Link
            href="/records"
            className="flex items-center gap-4 rounded-[24px] bg-gray-90 p-5 transition-colors hover:bg-gray-80"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-orange-50">
              <FolderOpen className="size-6 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-white">Records</span>
              <span className="text-sm leading-[1.6] text-gray-40">
                Upload and manage photos, videos, and announcements for
                members.
              </span>
            </div>
          </Link>
        </section>
      ) : (
        <section className="rounded-[24px] bg-gray-90 p-4">
          <h2 className="text-sm font-bold text-white">Admin access</h2>
          <p className="mt-2 text-sm leading-[1.6] text-gray-40">
            Sign up or log in above to create an admin account. After logging
            in, use Records to publish content for members.
          </p>
        </section>
      )}
    </div>
  );
}
