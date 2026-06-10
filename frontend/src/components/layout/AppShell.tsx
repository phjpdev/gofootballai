"use client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[375px] px-4 py-6 lg:max-w-6xl lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
