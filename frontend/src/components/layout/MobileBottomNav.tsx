"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FolderOpen,
  Home,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NAV } from "@/lib/i18n/zh-hk";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: NAV.home, icon: Home },
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
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV] : [...NAV_ITEMS];
  const compact = navItems.length >= 5;

  return (
    <nav
      aria-label="主要導覽"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col border-t border-gray-90 bg-gray-100 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] lg:hidden"
    >
      <div
        className={cn(
          "mx-auto flex h-[var(--mobile-nav-bar)] w-full max-w-[375px] items-center justify-around px-1",
          compact ? "pt-1.5 pb-1" : "pt-2 pb-1.5",
        )}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center",
                compact ? "gap-0.5 px-0.5 py-0.5" : "gap-1 px-1 py-0.5",
                isActive ? "text-orange-50" : "text-gray-40",
              )}
            >
              <Icon
                className={compact ? "size-[18px]" : "size-5"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "w-full truncate text-center font-medium leading-none",
                  compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      <div
        className="h-[var(--mobile-nav-inset)] shrink-0"
        aria-hidden
      />
    </nav>
  );
}
