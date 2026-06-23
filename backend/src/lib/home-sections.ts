import { query } from "./db.js";

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

type HomeSectionRow = {
  id: HomeSectionId;
  eyebrow: string | null;
  title: string;
  description: string;
  image_src: string;
  cta_text: string | null;
  login_prompt: string | null;
  login_link_text: string | null;
  sort_order: number;
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
}

export async function listHomeSections(): Promise<HomeSection[]> {
  const result = await query<HomeSectionRow>(
    `SELECT id, eyebrow, title, description, image_src,
            cta_text, login_prompt, login_link_text, sort_order
     FROM home_sections
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapHomeSection);
}

export async function getHomeSectionById(
  id: HomeSectionId,
): Promise<HomeSection | null> {
  const result = await query<HomeSectionRow>(
    `SELECT id, eyebrow, title, description, image_src,
            cta_text, login_prompt, login_link_text, sort_order
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
  },
): Promise<HomeSection | null> {
  const result = await query<HomeSectionRow>(
    `UPDATE home_sections
     SET eyebrow = $2,
         title = $3,
         description = $4,
         image_src = COALESCE($5, image_src),
         cta_text = $6,
         login_prompt = $7,
         login_link_text = $8,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, eyebrow, title, description, image_src,
               cta_text, login_prompt, login_link_text, sort_order`,
    [
      id,
      input.eyebrow ?? null,
      input.title,
      input.description,
      input.imageSrc ?? null,
      input.ctaText ?? null,
      input.loginPrompt ?? null,
      input.loginLinkText ?? null,
    ],
  );

  const row = result.rows[0];
  return row ? mapHomeSection(row) : null;
}

export { DEFAULT_SECTIONS };
