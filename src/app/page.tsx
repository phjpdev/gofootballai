import { TopNav } from "@/components/layout/TopNav";
import { SystemIntro } from "@/components/home/SystemIntro";
import { PostFeed } from "@/components/home/PostFeed";
import { SubNav } from "@/components/layout/SubNav";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";
import { FEATURED_COUNT, FEATURED_ITEMS } from "@/lib/data/featured";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Home" />

      <SystemIntro />

      <PostFeed />

      <section className="flex flex-col gap-2">
        <SubNav title="Featured" count={FEATURED_COUNT} seeAllHref="/analysis" />
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {FEATURED_ITEMS.map((match) => (
            <FeaturedMatchCard key={match.id} {...match} />
          ))}
        </div>
      </section>
    </div>
  );
}
