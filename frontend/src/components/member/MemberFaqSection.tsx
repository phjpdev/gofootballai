"use client";

import Link from "next/link";
import { BarChart2, LayoutDashboard } from "lucide-react";
import { QAAccordion } from "@/components/member/QAAccordion";
import { useAuth } from "@/context/AuthContext";
import { NAV } from "@/lib/i18n/zh-hk";
import type { QAItem } from "@/types";

type MemberFaqSectionProps = {
  items: QAItem[];
};

export function MemberFaqSection({ items }: MemberFaqSectionProps) {
  const { isAdmin } = useAuth();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-[-0.048px] text-white">
          常見問題
        </h2>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin/results"
              aria-label="勝率結果"
              className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-gray-90 text-orange-50 transition-colors hover:bg-gray-80"
            >
              <BarChart2 className="size-5" strokeWidth={2.5} />
            </Link>
            <Link
              href="/admin"
              aria-label={NAV.manage}
              className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-gray-90 text-orange-50 transition-colors hover:bg-gray-80"
            >
              <LayoutDashboard className="size-5" strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
      <QAAccordion items={items} />
    </section>
  );
}
