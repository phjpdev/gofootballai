"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Home,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NAV } from "@/lib/i18n/zh-hk";
import { cn } from "@/lib/utils";

type NavItem =
  | { href: string; label: string; icon: LucideIcon; logo?: false }
  | { href: string; label: string; logo: true; hideLabel?: boolean; icon?: never };

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: NAV.home, icon: Home },
  { href: "/analysis", label: NAV.analysis, logo: true, hideLabel: true },
  { href: "/records", label: NAV.records, icon: FolderOpen },
  { href: "/member", label: NAV.member, icon: Users },
];

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
        {navItems.map((item) => {
          const { href, label } = item;
          const isActive = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center",
                compact ? "gap-0.5 px-0.5 py-0.5" : "gap-1 px-1 py-0.5",
                isActive ? "text-orange-50" : "text-gray-40",
              )}
            >
              {item.logo ? (
                <Image
                  src="/images/go-football-logo.png"
                  alt=""
                  width={44}
                  height={44}
                  aria-hidden
                  className={cn(
                    "shrink-0 object-contain",
                    compact ? "size-10" : "size-11",
                    isActive ? "opacity-100" : "opacity-70",
                  )}
                />
              ) : (
                <item.icon
                  className={compact ? "size-[18px]" : "size-5"}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              {!(item.logo && item.hideLabel) && (
                <span
                  className={cn(
                    "w-full truncate text-center font-medium leading-none",
                    compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight",
                  )}
                >
                  {label}
                </span>
              )}
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
