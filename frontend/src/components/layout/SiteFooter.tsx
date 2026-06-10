import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NAV } from "@/lib/i18n/zh-hk";

const NAV_ITEMS = [
  { href: "/home", label: NAV.home },
  { href: "/analysis", label: NAV.analysis },
  { href: "/records", label: NAV.records },
  { href: "/member", label: NAV.member },
] as const;

const LEGAL_ITEMS = [
  { href: "/member#terms", label: "服務條款" },
  { href: "/member#terms", label: "私隱政策" },
  { href: "/member#terms", label: "內容政策" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-90 bg-gray-100">
      <div className="mx-auto flex w-full max-w-[375px] flex-col gap-8 px-4 py-10 lg:max-w-6xl lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-4">
            <BrandLogo size="md" />
            <p className="max-w-sm text-sm leading-[1.7] text-gray-40">
              專為香港球迷打造的 2026 世界盃 AI 分析平台，提供賽事預測、戰術數據及會員最新資訊。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-[0.12em] text-gray-40">
              網站導覽
            </p>
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-gray-20 transition-colors hover:text-orange-50"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-[0.12em] text-gray-40">
              法律條款
            </p>
            <nav className="flex flex-col gap-2">
              {LEGAL_ITEMS.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-medium text-gray-20 transition-colors hover:text-orange-50"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-90 pt-6 text-xs text-gray-40">
          © {year} 世界盃 AI。版權所有。
        </div>
      </div>
    </footer>
  );
}
