"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { cn } from "@/lib/utils";

function isMemberRoute(pathname: string) {
  return pathname === "/member" || pathname.startsWith("/member/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showMobileHeader = isMemberRoute(pathname);

  return (
    <div className="flex h-svh max-w-full flex-col overflow-hidden lg:h-auto lg:min-h-dvh lg:overflow-visible">
      <SiteHeader />
      <main
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pb-[var(--mobile-nav-total)] [touch-action:pan-y] lg:flex-1 lg:overflow-visible lg:pt-0 lg:pb-0 lg:[touch-action:auto]",
          showMobileHeader ? "pt-[var(--header-total)]" : "pt-0",
        )}
      >
        <div className="mx-auto w-full max-w-[375px] overflow-x-hidden px-2 pt-6 pb-3 lg:max-w-6xl lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
