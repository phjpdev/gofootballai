export type FeaturedItem = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
  /** Optional English overrides; English readers fall back to the Chinese field. */
  titleEn?: string;
  tagEn?: string;
  durationEn?: string;
  statEn?: string;
  imageSrc: string;
  pickMode: "single" | "multi";
};

export const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: "featured-1",
    title: "揭幕戰精選",
    tag: "小組賽",
    duration: "90分鐘",
    stat: "AI 預測",
    titleEn: "Opening Match Picks",
    tagEn: "Group Stage",
    durationEn: "90 min",
    statEn: "AI Prediction",
    imageSrc: "/images/featured-world-cup-color.png",
    pickMode: "single",
  },
  {
    id: "featured-2",
    title: "過關推薦",
    tag: "淘汰賽",
    duration: "120分鐘",
    stat: "戰術分析",
    titleEn: "Parlay Picks",
    tagEn: "Knockout Stage",
    durationEn: "120 min",
    statEn: "Tactics",
    imageSrc: "/images/featured-world-cup-bw.png",
    pickMode: "multi",
  },
];

export const FEATURED_COUNT = 32;
