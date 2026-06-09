import { TopNav } from "@/components/layout/TopNav";
import { SystemIntro } from "@/components/home/SystemIntro";
import { PostFeed } from "@/components/home/PostFeed";
import { SubNav } from "@/components/layout/SubNav";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";

const FEATURED_IMAGE = "/images/featured-strength.png";

const FEATURED_MATCHES = [
  {
    id: "featured-1",
    title: "Arnold's Pushups",
    tag: "Upper Body",
    duration: "50min",
    stat: "215kcal",
    imageSrc: FEATURED_IMAGE,
    href: "/analysis",
  },
  {
    id: "featured-2",
    title: "Arnold's Pushups",
    tag: "Upper Body",
    duration: "50min",
    stat: "215kcal",
    imageSrc: FEATURED_IMAGE,
    href: "/analysis",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Home" />

      <SystemIntro />

      <PostFeed />

      <section className="flex flex-col gap-2">
        <SubNav title="Featured" count={32} seeAllHref="/analysis" />
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {FEATURED_MATCHES.map((match) => (
            <FeaturedMatchCard key={match.id} {...match} />
          ))}
        </div>
      </section>
    </div>
  );
}
