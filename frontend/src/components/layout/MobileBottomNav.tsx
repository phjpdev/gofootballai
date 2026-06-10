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

  return (
    <nav
      aria-label="主要導覽"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-90 bg-gray-100 lg:hidden"
    >
      <div className="mx-auto flex max-w-[375px] items-center justify-around px-1 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5",
                isActive ? "text-orange-50" : "text-gray-40",
              )}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="w-full truncate text-center text-[10px] font-medium">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
