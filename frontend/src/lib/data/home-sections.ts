export type HomeSectionId =
  | "hero"
  | "score"
  | "daily"
  | "metrics"
  | "records"
  | "rating";

export type HomeSection = {
  id: HomeSectionId;
  eyebrow: string | null;
  title: string;
  description: string;
  imageSrc: string;
  ctaText: string | null;
  loginPrompt: string | null;
  loginLinkText: string | null;
};

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "首頁英雄區",
  score: "精準分析",
  daily: "全球聯賽",
  metrics: "專業分析",
  records: "會員紀錄",
  rating: "5星體驗",
};

export const DEFAULT_HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    eyebrow: "GO Football AI",
    title: "歡迎使用GO AI足球分析APP",
    description:
      "由AI驅動的專業足球分析平台，專為追求理性投注與穩定回報的你而設計",
    imageSrc: "/images/home/hero-soccer-bg.png",
    ctaText: "立即開始",
    loginPrompt: "已有帳戶？",
    loginLinkText: "登入",
  },
  {
    id: "score",
    eyebrow: null,
    title: "精準計算每一場賽事",
    description:
      "為你提供詳細專業分析與高準確率信心指數（90%+），助你找出真正價值投注機會。",
    imageSrc: "/images/home/section-2-analysis.png",
    ctaText: null,
    loginPrompt: null,
    loginLinkText: null,
  },
  {
    id: "daily",
    eyebrow: null,
    title: "覆蓋全球多國聯賽",
    description:
      "各大賽事每日即時更新，無論主流聯賽還是冷門比賽都能輕鬆掌握。",
    imageSrc: "/images/home/section-3-matches.png",
    ctaText: null,
    loginPrompt: null,
    loginLinkText: null,
  },
  {
    id: "metrics",
    eyebrow: null,
    title: "堅持專業分析",
    description:
      "拒絕代投注、毒會等不良誘惑，只提供純粹數據驅動的理性建議，幫助你建立長期穩定優勢。",
    imageSrc: "/images/home/section-4-metrics.png",
    ctaText: null,
    loginPrompt: null,
    loginLinkText: null,
  },
  {
    id: "records",
    eyebrow: null,
    title: "會員營利紀錄",
    description:
      "實會員投注紀錄與盈利統計透明呈現，見證穩定回報，讓你更有信心跟隨專業分析前進。",
    imageSrc: "/images/home/section-5-records.png",
    ctaText: null,
    loginPrompt: null,
    loginLinkText: null,
  },
  {
    id: "rating",
    eyebrow: null,
    title: "簡單易用 · 5星級投注體驗",
    description:
      "簡潔直觀介面、智慧推薦、讓你隨時隨地都能享受專業、高效且愉快的分析體驗。",
    imageSrc: "/images/home/section-6-rating.png",
    ctaText: null,
    loginPrompt: null,
    loginLinkText: null,
  },
];

export function homeSectionsById(
  sections: HomeSection[],
): Record<HomeSectionId, HomeSection> {
  const map = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<
    HomeSectionId,
    HomeSection
  >;

  for (const fallback of DEFAULT_HOME_SECTIONS) {
    if (!map[fallback.id]) {
      map[fallback.id] = fallback;
    }
  }

  return map;
}
