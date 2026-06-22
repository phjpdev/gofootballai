"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { cn } from "@/lib/utils";

function isMemberRoute(pathname: string) {
  return pathname === "/member" || pathname.startsWith("/member/");
}

function isHomeRoute(pathname: string) {
  return pathname === "/home";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showMobileHeader = isMemberRoute(pathname);
  const homeRoute = isHomeRoute(pathname);

  return (
    <div
      className={cn(
        "flex flex-col",
        homeRoute
          ? "h-dvh overflow-hidden lg:h-auto lg:min-h-0 lg:overflow-visible"
          : "h-dvh overflow-hidden lg:h-auto lg:min-h-dvh lg:overflow-visible",
      )}
    >
      <SiteHeader />
      <main
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]",
          homeRoute
            ? "overflow-hidden lg:flex-none lg:overflow-visible"
            : "overflow-y-auto lg:overflow-visible lg:pt-0 lg:pb-0",
          !homeRoute && "lg:pt-0 lg:pb-0",
          showMobileHeader ? "pt-[var(--header-total)]" : "pt-0",
        )}
      >
        <div
          className={cn(
            homeRoute
              ? "h-full lg:h-auto"
              : "w-full px-4 pt-6 pb-6 lg:mx-auto lg:max-w-6xl lg:px-8 lg:py-10",
          )}
        >
          {children}
        </div>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
