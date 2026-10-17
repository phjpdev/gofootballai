"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  FolderOpen,
  Home,
  LogOut,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TelegramIcon, TELEGRAM_URL } from "@/components/icons/TelegramIcon";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

function navItems(nav: Messages["layout"]["nav"]) {
  return [
    { href: "/home", label: nav.home, icon: Home },
    { href: "/analysis", label: nav.analysis, icon: BarChart3 },
    { href: "/records", label: nav.records, icon: FolderOpen },
    { href: "/member", label: nav.member, icon: Users },
  ] as const;
}

const ADMIN_NAV_HREF = "/admin";

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMemberRoute(pathname: string) {
  return pathname === "/member" || pathname.startsWith("/member/");
}

function UserMenu({
  className,
  onLogout,
}: {
  className?: string;
  onLogout?: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    onLogout?.();
    router.push("/member");
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold text-white">
          {user.username}
        </p>
        <p className="text-xs text-orange-50">{t.common.roles[user.role]}</p>
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="flex shrink-0 items-center gap-2 rounded-[14px] bg-gray-90 px-3 py-2 text-sm font-medium text-gray-20 transition-colors hover:text-white"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">{t.layout.logout}</span>
      </button>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const showOnMobile = isMemberRoute(pathname);

  const mainNavItems = navItems(t.layout.nav);
  const showAdminNav = isAdmin;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-gray-90 bg-gray-100 pt-[var(--header-inset)] lg:relative lg:sticky lg:top-0 lg:pt-0",
        !showOnMobile && "hidden lg:block",
      )}
    >
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-6xl items-center justify-between gap-3 px-2 lg:gap-4 lg:px-8">
        <Link href="/analysis" className="min-w-0 shrink">
          <BrandLogo size="header" />
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          <nav className="flex items-center gap-1">
            {mainNavItems.map(({ href, label }) => {
              const isActive = isNavActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-90 text-orange-50"
                      : "text-gray-40 hover:text-white",
                  )}
                >
                  {label}
                </Link>
              );
            })}

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.layout.nav.telegram}
              className="flex size-10 items-center justify-center rounded-xl text-gray-40 transition-colors hover:bg-gray-90 hover:text-white"
            >
              <TelegramIcon className="size-[18px]" />
            </a>

            {showAdminNav && (
              <Link
                href={ADMIN_NAV_HREF}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  isNavActive(pathname, ADMIN_NAV_HREF)
                    ? "bg-gray-90 text-orange-50"
                    : "text-gray-40 hover:text-white",
                )}
              >
                {t.layout.nav.manage}
              </Link>
            )}
          </nav>

          <LanguageToggle />

          {isAuthenticated && (
            <div className="border-l border-gray-90 pl-4">
              <UserMenu />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
