"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderOpen,
  Home,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { formatRole, NAV } from "@/lib/i18n/zh-hk";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: NAV.home, icon: Home },
  { href: "/analysis", label: NAV.analysis, icon: BarChart3 },
  { href: "/records", label: NAV.records, icon: FolderOpen },
  { href: "/member", label: NAV.member, icon: Users },
] as const;

const ADMIN_NAV = {
  href: "/admin",
  label: NAV.manage,
  icon: LayoutDashboard,
} as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function UserMenu({
  className,
  onLogout,
}: {
  className?: string;
  onLogout?: () => void;
}) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold text-white">
          {user.username}
        </p>
        <p className="text-xs text-orange-50">{formatRole(user.role)}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          void logout();
          onLogout?.();
        }}
        className="flex shrink-0 items-center gap-2 rounded-[14px] bg-gray-90 px-3 py-2 text-sm font-medium text-gray-20 transition-colors hover:text-white"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">登出</span>
      </button>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV] : [...NAV_ITEMS];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-90 bg-gray-100">
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-3 px-4 lg:h-24 lg:gap-4 lg:px-8">
        <Link href="/" className="min-w-0 shrink">
          <BrandLogo size="header" />
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label }) => {
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
          </nav>

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
