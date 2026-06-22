import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HomeDesktopCta() {
  return (
    <section className="relative overflow-hidden border-t border-white/8 bg-gray-100 py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(249,115,22,0.12),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-8 text-center">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-50">
            準備好了嗎？
          </p>
          <h2 className="text-4xl font-bold tracking-[-0.02em] text-white lg:text-5xl">
            立即體驗 AI 足球分析
          </h2>
          <p className="text-lg leading-relaxed text-[#d4d4d8]">
            加入 GO Football AI，用數據與演算法找出高信心賽事，建立屬於你的理性投注優勢。
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/analysis"
            className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-orange-50 px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          >
            開始分析
            <ArrowRight className="size-5" strokeWidth={2} />
          </Link>
          <Link
            href="/member"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-8 py-3 text-base font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            會員登入
          </Link>
        </div>
      </div>
    </section>
  );
}
