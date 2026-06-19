"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";

export function AnalysisMemberGate({
  redirectTo,
  hint = "請登入或註冊會員帳戶，以查看 AI 賽事量化分析。",
}: {
  redirectTo: string;
  hint?: string;
}) {
  const memberLoginHref = `/member?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <section className="flex flex-col items-center gap-6 rounded-[24px] bg-gray-90 px-4 py-8">
      <Image
        src="/images/member-lock.png"
        alt=""
        width={100}
        height={100}
        className="h-[100px] w-[100px] object-contain"
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-bold text-white">會員專屬分析</h2>
        <p className="max-w-[300px] text-sm leading-[1.6] text-gray-40">{hint}</p>
      </div>
      <Link
        href={memberLoginHref}
        className="flex h-14 w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl bg-orange-50 text-base font-semibold text-white"
      >
        <LogIn className="size-5" />
        前往會員登入
      </Link>
      <p className="text-center text-sm text-gray-40">
        未有帳戶？登入頁面可免費註冊會員。
      </p>
    </section>
  );
}
