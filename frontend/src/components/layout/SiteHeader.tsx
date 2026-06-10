"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FolderOpen,
  Home,
  Menu,
  Users,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/records", label: "Records", icon: FolderOpen },
  { href: "/member", label: "Member", icon: Users },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-4 px-4 lg:h-24 lg:px-8">
        <Link href="/" className="min-w-0 shrink">
          <BrandLogo size="header" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ href, label }) => {
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

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex size-11 items-center justify-center rounded-[16px] bg-gray-90 text-white lg:hidden"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
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
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
