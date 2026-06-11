"use client";

import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden lg:h-auto lg:min-h-dvh lg:overflow-visible">
      <SiteHeader />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pt-[var(--header-total)] pb-[var(--mobile-nav-total)] lg:flex-1 lg:overflow-visible lg:pt-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[375px] px-4 py-6 lg:max-w-6xl lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
