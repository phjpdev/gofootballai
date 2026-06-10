"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
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
      <AuthForm portalRole="admin" termsHref="/member#terms" />

      {isAdmin ? (
        <UserManagement />
      ) : (
        <section className="rounded-[24px] bg-gray-90 p-4">
          <h2 className="text-sm font-bold text-white">Admin access</h2>
          <p className="mt-2 text-sm leading-[1.6] text-gray-40">
            Sign up or log in above to create an admin account.
          </p>
        </section>
      )}
    </div>
  );
}
