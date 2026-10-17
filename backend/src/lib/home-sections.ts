import { query } from "./db.js";
import { pushEnglishSets } from "./english-fields.js";

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
  eyebrowEn: string | null;
  titleEn: string | null;
  descriptionEn: string | null;
  ctaTextEn: string | null;
  loginPromptEn: string | null;
  loginLinkTextEn: string | null;
};

export type HomeSectionEnglishInput = {
  eyebrowEn?: string | null;
  titleEn?: string | null;
  descriptionEn?: string | null;
  ctaTextEn?: string | null;
  loginPromptEn?: string | null;
  loginLinkTextEn?: string | null;
};

type HomeSectionRow = {
  id: HomeSectionId;
  eyebrow: string | null;
  title: string;
  description: string;
  image_src: string;
  cta_text: string | null;
  login_prompt: string | null;
  login_link_text: string | null;
  eyebrow_en: string | null;
  title_en: string | null;
  description_en: string | null;
  cta_text_en: string | null;
  login_prompt_en: string | null;
  login_link_text_en: string | null;
  sort_order: number;
};

const SECTION_COLUMNS = `id, eyebrow, title, description, image_src,
       cta_text, login_prompt, login_link_text,
       eyebrow_en, title_en, description_en, cta_text_en,
       login_prompt_en, login_link_text_en, sort_order`;

const NO_ENGLISH = {
  eyebrowEn: null,
  ctaTextEn: null,
  loginPromptEn: null,
  loginLinkTextEn: null,
};

const DEFAULT_SECTIONS: HomeSection[] = [
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
    ...NO_ENGLISH,
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
    ...NO_ENGLISH,
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
    ...NO_ENGLISH,
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
    ...NO_ENGLISH,
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
    ...NO_ENGLISH,
    titleEn: "Easy to use · 5-star betting experience",
    descriptionEn:
      "A clean, intuitive interface and smart recommendations make professional analysis fast and enjoyable, anytime, anywhere.",
  },
];

function mapHomeSection(row: HomeSectionRow): HomeSection {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    title: row.title,
    description: row.description,
    imageSrc: row.image_src,
    ctaText: row.cta_text,
    loginPrompt: row.login_prompt,
    loginLinkText: row.login_link_text,
    eyebrowEn: row.eyebrow_en,
    titleEn: row.title_en,
    descriptionEn: row.description_en,
    ctaTextEn: row.cta_text_en,
    loginPromptEn: row.login_prompt_en,
    loginLinkTextEn: row.login_link_text_en,
  };
}

export async function seedHomeSections(): Promise<void> {
  for (const [index, section] of DEFAULT_SECTIONS.entries()) {
    await query(
      `INSERT INTO home_sections (
         id, eyebrow, title, description, image_src,
         cta_text, login_prompt, login_link_text, sort_order
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        section.id,
        section.eyebrow,
        section.title,
        section.description,
        section.imageSrc,
        section.ctaText,
        section.loginPrompt,
        section.loginLinkText,
        index,
      ],
    );
  }
  await fillDefaultEnglish();
}

/**
 * Give untouched default sections their English text. Only where the Chinese
 * is still the seeded default and no English was set, so admin edits always win.
 */
async function fillDefaultEnglish(): Promise<void> {
  const pairs = [
    ["eyebrow", "eyebrow_en", "eyebrow", "eyebrowEn"],
    ["title", "title_en", "title", "titleEn"],
    ["description", "description_en", "description", "descriptionEn"],
    ["cta_text", "cta_text_en", "ctaText", "ctaTextEn"],
    ["login_prompt", "login_prompt_en", "loginPrompt", "loginPromptEn"],
    ["login_link_text", "login_link_text_en", "loginLinkText", "loginLinkTextEn"],
  ] as const;
  for (const section of DEFAULT_SECTIONS) {
    for (const [zhColumn, enColumn, zhKey, enKey] of pairs) {
      const zh = section[zhKey];
      const en = section[enKey];
      if (!zh || !en) continue;
      await query(
        `UPDATE home_sections SET ${enColumn} = $3
         WHERE id = $1 AND ${zhColumn} = $2 AND ${enColumn} IS NULL`,
        [section.id, zh, en],
      );
    }
  }
}

export async function listHomeSections(): Promise<HomeSection[]> {
  const result = await query<HomeSectionRow>(
    `SELECT ${SECTION_COLUMNS}
     FROM home_sections
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapHomeSection);
}

export async function getHomeSectionById(
  id: HomeSectionId,
): Promise<HomeSection | null> {
  const result = await query<HomeSectionRow>(
    `SELECT ${SECTION_COLUMNS}
     FROM home_sections
     WHERE id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapHomeSection(row) : null;
}

export async function updateHomeSection(
  id: HomeSectionId,
  input: {
    eyebrow?: string | null;
    title: string;
    description: string;
    imageSrc?: string;
    ctaText?: string | null;
    loginPrompt?: string | null;
    loginLinkText?: string | null;
  } & HomeSectionEnglishInput,
): Promise<HomeSection | null> {
  const sets = [
    "eyebrow = $2",
    "title = $3",
    "description = $4",
    "image_src = COALESCE($5, image_src)",
    "cta_text = $6",
    "login_prompt = $7",
    "login_link_text = $8",
    "updated_at = NOW()",
  ];
  const params: unknown[] = [
    id,
    input.eyebrow ?? null,
    input.title,
    input.description,
    input.imageSrc ?? null,
    input.ctaText ?? null,
    input.loginPrompt ?? null,
    input.loginLinkText ?? null,
  ];
  pushEnglishSets(sets, params, [
    ["eyebrow_en", input.eyebrowEn],
    ["title_en", input.titleEn],
    ["description_en", input.descriptionEn],
    ["cta_text_en", input.ctaTextEn],
    ["login_prompt_en", input.loginPromptEn],
    ["login_link_text_en", input.loginLinkTextEn],
  ]);

  const result = await query<HomeSectionRow>(
    `UPDATE home_sections
     SET ${sets.join(", ")}
     WHERE id = $1
     RETURNING ${SECTION_COLUMNS}`,
    params,
  );

  const row = result.rows[0];
  return row ? mapHomeSection(row) : null;
}

export { DEFAULT_SECTIONS };
