"use client";

import { SubNav } from "@/components/layout/SubNav";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";
import {
  HkjcDatePicker,
  HkjcMatchesSection,
  HkjcProvider,
} from "@/components/analysis/HkjcMatchList";
import { FEATURED_COUNT, FEATURED_ITEMS } from "@/lib/data/featured";

export default function AnalysisPage() {
  return (
    <HkjcProvider>
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-8">
          <HkjcDatePicker />
        </header>

        <section className="flex flex-col gap-2">
          <SubNav title="Featured" count={FEATURED_COUNT} />
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {FEATURED_ITEMS.map((item) => (
              <FeaturedMatchCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        <HkjcMatchesSection />
      </div>
    </HkjcProvider>
  );
}
