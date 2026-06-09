export type FeaturedItem = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
  imageSrc: string;
  href?: string;
};

const FEATURED_IMAGE = "/images/featured-strength.png";

export const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: "featured-1",
    title: "Arnold's Pushups",
    tag: "Upper Body",
    duration: "50min",
    stat: "215kcal",
    imageSrc: FEATURED_IMAGE,
    href: "/analysis/man-city-arsenal",
  },
  {
    id: "featured-2",
    title: "Arnold's Pushups",
    tag: "Upper Body",
    duration: "50min",
    stat: "215kcal",
    imageSrc: FEATURED_IMAGE,
    href: "/analysis/man-city-arsenal",
  },
];

export const FEATURED_COUNT = 32;
