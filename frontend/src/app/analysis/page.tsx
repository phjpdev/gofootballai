"use client";

import { SubNav } from "@/components/layout/SubNav";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";
import {
  AnalysisLockScreen,
  AnalysisLockSkeleton,
} from "@/components/analysis/AnalysisLockScreen";
import {
  HkjcDatePicker,
  HkjcMatchesSection,
  HkjcProvider,
} from "@/components/analysis/HkjcMatchList";
import { useAuth } from "@/context/AuthContext";
import { FEATURED_COUNT, FEATURED_ITEMS } from "@/lib/data/featured";

function AnalysisContent() {
  return (
    <HkjcProvider>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-8">
          <HkjcDatePicker />
        </header>

        <section className="flex flex-col gap-2">
          <SubNav title="精選賽事" count={FEATURED_COUNT} />
          <div className="perspective-[1200px] scrollbar-hide -mx-2 flex gap-2 overflow-x-auto px-2 lg:mx-0 lg:px-0">
            {FEATURED_ITEMS.map((item, index) => (
              <AnimateIn
                key={item.id}
                variant="flip"
                delay={index * 220}
                className="shrink-0"
              >
                <FeaturedMatchCard {...item} />
              </AnimateIn>
            ))}
          </div>
        </section>

        <HkjcMatchesSection />
      </div>
    </HkjcProvider>
  );
}

export default function AnalysisPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AnalysisLockSkeleton />;
  }

  if (!isAuthenticated) {
    return <AnalysisLockScreen redirectTo="/analysis" />;
  }

  return <AnalysisContent />;
}
