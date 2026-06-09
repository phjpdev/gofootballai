"use client";

import { useState } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { DatePicker } from "@/components/layout/DatePicker";
import { SubNav } from "@/components/layout/SubNav";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";
import { MatchCard } from "@/components/cards/MatchCard";
import { FEATURED_COUNT, FEATURED_ITEMS } from "@/lib/data/featured";
import { MATCH_DATES, getMatchesByDateIndex } from "@/lib/data/matches";

export default function AnalysisPage() {
  const [selectedDate, setSelectedDate] = useState(2);
  const matches = getMatchesByDateIndex(selectedDate);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-8">
        <TopNav title="Analysis" />
        <DatePicker
          dates={MATCH_DATES}
          selectedIndex={selectedDate}
          onSelect={setSelectedDate}
        />
      </header>

      <section className="flex flex-col gap-2">
        <SubNav title="Featured" count={FEATURED_COUNT} />
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {FEATURED_ITEMS.map((item) => (
            <FeaturedMatchCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SubNav title="Matches" count={matches.length} />
        {matches.length === 0 ? (
          <div className="rounded-[24px] bg-gray-90 p-6 text-center">
            <p className="text-sm text-gray-40">No matches on this date.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                title={match.title}
                tag={match.tag}
                progress={match.progress}
                movements={match.movements}
                completion={match.completion}
                imageSrc={match.imageSrc}
                href={`/analysis/${match.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
