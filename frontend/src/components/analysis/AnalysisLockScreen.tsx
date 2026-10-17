"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export function AnalysisMemberGate({
  redirectTo,
  hint: hintProp,
  variant = "card",
}: {
  redirectTo: string;
  hint?: string;
  variant?: "card" | "fullscreen";
}) {
  const { t } = useI18n();
  const hint = hintProp ?? t.matchDetail.lockedHint.default;
  const memberLoginHref = `/member?redirect=${encodeURIComponent(redirectTo)}`;

  if (variant === "fullscreen") {
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
              {t.matchDetail.memberGate.fullscreenTitle}
            </h1>
            <p className="max-w-[320px] text-sm leading-[1.6] text-gray-40">{hint}</p>
          </div>

          <Link
            href={memberLoginHref}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-50 text-base font-semibold text-white"
          >
            <LogIn className="size-5" />
            {t.matchDetail.memberGate.login}
          </Link>

          <p className="mt-4 text-center text-sm leading-[1.6] text-gray-40">
            {t.matchDetail.memberGate.signupHint}
          </p>
        </div>
      </div>
    );
  }

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
        <h2 className="text-xl font-bold text-white">
          {t.matchDetail.memberGate.cardTitle}
        </h2>
        <p className="max-w-[300px] text-sm leading-[1.6] text-gray-40">{hint}</p>
      </div>
      <Link
        href={memberLoginHref}
        className="flex h-14 w-full max-w-[320px] items-center justify-center gap-2 rounded-2xl bg-orange-50 text-base font-semibold text-white"
      >
        <LogIn className="size-5" />
        {t.matchDetail.memberGate.login}
      </Link>
      <p className="text-center text-sm text-gray-40">
        {t.matchDetail.memberGate.signupHint}
      </p>
    </section>
  );
}
