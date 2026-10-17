"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const { nav, footer } = t.layout;
  const year = new Date().getFullYear();

  const navItems = [
    { href: "/home", label: nav.home },
    { href: "/analysis", label: nav.analysis },
    { href: "/records", label: nav.records },
    { href: "/member", label: nav.member },
  ];

  const legalItems = [
    { href: "/member#terms-of-service", label: footer.termsOfService },
    { href: "/member#privacy", label: footer.privacy },
    { href: "/member#content-policy", label: footer.contentPolicy },
    { href: "/member#refund-policy", label: footer.refundPolicy },
  ];

  return (
    <footer className="mt-auto hidden border-t border-gray-90 bg-gray-100 lg:block">
      <div className="flex w-full flex-col gap-8 px-4 py-10 lg:mx-auto lg:max-w-6xl lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-4">
            <BrandLogo size="md" />
            <p className="max-w-sm text-sm leading-[1.7] text-gray-40">
              {footer.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-[0.12em] text-gray-40">
              {footer.siteNav}
            </p>
            <nav className="flex flex-col gap-2">
              {navItems.map(({ href, label }) => (
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
              {footer.legal}
            </p>
            <nav className="flex flex-col gap-2">
              {legalItems.map(({ href, label }) => (
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
          {footer.copyright(year)}
        </div>
      </div>
    </footer>
  );
}
