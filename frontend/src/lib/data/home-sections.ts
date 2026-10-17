import type { Locale } from "@/lib/i18n/config";
import { localizedText } from "@/lib/i18n/localized";

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
  /** Optional English overrides; English readers fall back to the Chinese field. */
  eyebrowEn?: string | null;
  titleEn?: string | null;
  descriptionEn?: string | null;
  ctaTextEn?: string | null;
  loginPromptEn?: string | null;
  loginLinkTextEn?: string | null;
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
    eyebrowEn: "GO Football AI",
    titleEn: "Welcome to GO Football AI",
    descriptionEn:
      "An AI-driven football analysis platform built for bettors who want rational decisions and steady returns.",
    ctaTextEn: "Get started",
    loginPromptEn: "Already have an account?",
    loginLinkTextEn: "Log in",
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
    titleEn: "Every match, precisely calculated",
    descriptionEn:
      "In-depth professional analysis with high-accuracy confidence scores (90%+) to help you find real value bets.",
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
    titleEn: "Leagues from around the world",
    descriptionEn:
      "Every major competition updated live, every day. Follow top leagues and lesser-known fixtures with ease.",
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
    titleEn: "Committed to professional analysis",
    descriptionEn:
      "No proxy betting, no shady syndicates: only purely data-driven, rational advice to help you build a lasting edge.",
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
    titleEn: "Member profit records",
    descriptionEn:
      "Real member betting records and profit statistics, shown transparently. See the steady returns and follow professional analysis with confidence.",
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
    titleEn: "Easy to use · 5-star betting experience",
    descriptionEn:
      "A clean, intuitive interface and smart recommendations make professional analysis fast and enjoyable, anytime, anywhere.",
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

const ENGLISH_FIELD = {
  eyebrow: "eyebrowEn",
  title: "titleEn",
  description: "descriptionEn",
  ctaText: "ctaTextEn",
  loginPrompt: "loginPromptEn",
  loginLinkText: "loginLinkTextEn",
} as const satisfies Record<string, keyof HomeSection>;

export type HomeSectionTextField = keyof typeof ENGLISH_FIELD;

/** A section's text already resolved to the reader's language. */
export type LocalizedHomeSection = {
  id: HomeSectionId;
  imageSrc: string;
  eyebrow: string | null;
  title: string;
  description: string;
  ctaText: string | null;
  loginPrompt: string | null;
  loginLinkText: string | null;
};

/**
 * The stored English override, or the built-in translation while the Chinese
 * still matches the default copy (rows saved before English existed have none).
 */
export function homeSectionEnglish(
  section: HomeSection,
  field: HomeSectionTextField,
): string {
  const stored = section[ENGLISH_FIELD[field]]?.trim();
  if (stored) return stored;
  const fallback = DEFAULT_HOME_SECTIONS.find((item) => item.id === section.id);
  const chinese = section[field]?.trim();
  if (!fallback || !chinese || chinese !== fallback[field]?.trim()) return "";
  return fallback[ENGLISH_FIELD[field]] ?? "";
}

export function localizeHomeSection(
  section: HomeSection,
  locale: Locale,
): LocalizedHomeSection {
  const text = (field: HomeSectionTextField) =>
    localizedText(
      locale,
      section[field],
      locale === "en" ? homeSectionEnglish(section, field) : null,
    ) || null;

  return {
    id: section.id,
    imageSrc: section.imageSrc,
    eyebrow: text("eyebrow"),
    title: text("title") ?? "",
    description: text("description") ?? "",
    ctaText: text("ctaText"),
    loginPrompt: text("loginPrompt"),
    loginLinkText: text("loginLinkText"),
  };
}
