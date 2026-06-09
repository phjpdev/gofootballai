import { TopNav } from "@/components/layout/TopNav";
import { DatePicker } from "@/components/layout/DatePicker";
import { SubNav } from "@/components/layout/SubNav";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";
import { MatchCard } from "@/components/cards/MatchCard";

const FIXTURE_DATES = [
  { day: "Sat", date: 7, hasEvent: true },
  { day: "Sun", date: 8, hasEvent: true },
  { day: "Mon", date: 9, hasEvent: true },
  { day: "Tue", date: 10, hasEvent: true },
  { day: "Wed", date: 11, hasEvent: true },
  { day: "Thu", date: 12, hasEvent: true },
];

const FEATURED_IMAGE = "/images/featured-strength.png";

const FEATURED_MATCHES = [
  {
    title: "Arnold's Pushups",
    tag: "Upper Body",
    duration: "50min",
    stat: "215kcal",
    imageSrc: FEATURED_IMAGE,
  },
  {
    title: "Arnold's Pushups",
    tag: "Upper Body",
    duration: "50min",
    stat: "215kcal",
    imageSrc: FEATURED_IMAGE,
  },
];

const OVERVIEW_MATCHES = [
  {
    title: "Zen Flow Yoga",
    tag: "Yoga",
    progress: 75,
    movements: 4,
    completion: 87,
    imageSrc:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop",
  },
  {
    title: "HIIT Cardio Blast",
    tag: "Cardio",
    progress: 60,
    movements: 6,
    completion: 72,
    imageSrc:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop",
  },
  {
    title: "Power Lifting",
    tag: "Strength",
    progress: 45,
    movements: 5,
    completion: 55,
    imageSrc:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-8">
        <TopNav title="Fixtures" />
        <DatePicker dates={FIXTURE_DATES} selectedIndex={2} />
      </header>

      {/* Figma 216:47092 — Sub Nav + horizontal featured cards */}
      <section className="flex flex-col gap-2">
        <SubNav title="Strength" count={32} />
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {FEATURED_MATCHES.map((match) => (
            <FeaturedMatchCard key={match.title} {...match} />
          ))}
        </div>
      </section>

      {/* Figma 216:47117 — compact workout overview list */}
      <section className="flex flex-col gap-3">
        {OVERVIEW_MATCHES.map((match) => (
          <MatchCard key={match.title} {...match} />
        ))}
      </section>
    </div>
  );
}
