"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Home,
  Users,
  type LucideIcon,
} from "lucide-react";
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

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const navItems = NAV_ITEMS;
  const compact = navItems.length >= 5;

  return (
    <nav
      aria-label="主要導覽"
      className="z-50 shrink-0 overflow-visible border-t border-gray-90 bg-black pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_32px_rgba(0,0,0,0.35)] lg:hidden"
    >
      <div className="flex w-full items-end justify-around px-2 py-1">
        {navItems.map((item) => {
          const { href, label } = item;
          const isActive = isNavActive(pathname, href);
          const isLogoItem = "logo" in item && item.logo;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-end",
                compact ? "gap-0.5 px-0.5" : "gap-1 px-1",
                isActive ? "text-orange-50" : "text-gray-40",
              )}
            >
              <span className="flex h-6 w-full items-end justify-center">
                {isLogoItem ? (
                  <Image
                    src="/images/go-football-logo-nav.png"
                    alt=""
                    width={56}
                    height={56}
                    aria-hidden
                    className={cn(
                      "size-14 shrink-0 rounded-t-full rounded-br-none rounded-bl-none bg-black object-cover object-bottom",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  />
                ) : (
                  <item.icon
                    className={compact ? "size-[18px]" : "size-5"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                )}
              </span>
              {!(isLogoItem && item.hideLabel) && (
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
    </nav>
  );
}
