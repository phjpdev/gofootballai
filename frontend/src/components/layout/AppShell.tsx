"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderOpen, Home, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/records", label: "Records", icon: FolderOpen },
  { href: "/member", label: "Member", icon: Users },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-90 bg-gray-100 lg:bottom-auto lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-r lg:border-t-0">
        <div className="hidden border-b border-gray-90 px-6 py-6 lg:block">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
        </div>

        <nav className="flex items-center justify-around px-2 py-2 lg:flex-1 lg:flex-col lg:items-stretch lg:gap-1 lg:p-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 lg:flex-row lg:gap-3 lg:px-4 lg:py-3",
                  isActive
                    ? "text-orange-50"
                    : "text-gray-40 hover:text-white",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium lg:text-sm">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 pb-20 lg:ml-64 lg:pb-0">
        <div className="mx-auto w-full max-w-[375px] px-4 py-6 lg:max-w-6xl lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
