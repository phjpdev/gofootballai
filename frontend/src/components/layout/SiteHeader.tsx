"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FolderOpen,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/records", label: "Records", icon: FolderOpen },
  { href: "/member", label: "Member", icon: Users },
] as const;

const ADMIN_NAV = {
  href: "/admin",
  label: "Manage",
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
        <p className="text-xs capitalize text-orange-50">{user.role}</p>
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
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV] : [...NAV_ITEMS];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex size-11 items-center justify-center rounded-[16px] bg-gray-90 text-white"
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-[72px] z-40 bg-black/60 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute left-0 right-0 top-[72px] z-50 border-b border-gray-90 bg-gray-100 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = isNavActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                      isActive
                        ? "bg-gray-90 text-orange-50"
                        : "text-gray-40 hover:text-white",
                    )}
                  >
                    <Icon
                      className="size-5"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
