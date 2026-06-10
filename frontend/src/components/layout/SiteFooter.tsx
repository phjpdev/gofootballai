import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/analysis", label: "Analysis" },
  { href: "/records", label: "Records" },
  { href: "/member", label: "Member" },
] as const;

const LEGAL_ITEMS = [
  { href: "/member#terms", label: "Terms of Service" },
  { href: "/member#terms", label: "Privacy Policy" },
  { href: "/member#terms", label: "Content Policy" },
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
              AI-powered football analytics, live match insights, and member
              updates from GO Football AI.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-40">
              Navigate
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
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-40">
              Legal
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
          © {year} GO Football AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
