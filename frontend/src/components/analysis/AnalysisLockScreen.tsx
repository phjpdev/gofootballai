"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

type AnalysisLockScreenProps = {
  redirectTo?: string;
  title?: string;
  description?: string;
};

export function AnalysisLockScreen({
  redirectTo = "/analysis",
  title = "會員專屬分析",
  description = "請登入或註冊會員帳戶，以查看 AI 賽事量化分析、馬會盤口及即時賽事列表。",
}: AnalysisLockScreenProps) {
  const memberLoginHref = `/member?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="flex w-full flex-col items-center pt-2 pb-8">
      <div className="flex w-full max-w-[343px] flex-col items-center">
        <div className="mb-8 flex w-full justify-center pt-4">
          <Image
            src="/images/member-lock.png"
            alt=""
            width={132}
            height={132}
            priority
            className="h-[132px] w-[132px] object-contain"
          />
        </div>

        <div className="mb-10 flex w-full flex-col items-center gap-3 text-center">
          <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.4px] text-white">
            {title}
          </h1>
          <p className="max-w-[320px] text-sm leading-[1.6] text-gray-40">
            {description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
            href={memberLoginHref}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-50 text-base font-semibold text-white"
          >
            <LogIn className="size-5" />
            前往會員登入
          </Link>
          <p className="text-center text-sm leading-[1.6] text-gray-40">
            未有帳戶？登入頁面可免費註冊會員。
          </p>
        </div>
      </div>
    </div>
  );
}

export function AnalysisLockSkeleton() {
  return (
    <div className="flex w-full flex-col items-center pt-6 pb-8">
      <div className="mb-8 size-[132px] animate-pulse rounded-full bg-gray-90" />
      <div className="mb-10 flex w-full max-w-[343px] flex-col items-center gap-3">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-90" />
        <div className="h-12 w-full max-w-[280px] animate-pulse rounded-lg bg-gray-90" />
      </div>
      <div className="h-14 w-full max-w-[343px] animate-pulse rounded-2xl bg-gray-90" />
    </div>
  );
}
