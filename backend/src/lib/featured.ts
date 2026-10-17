import { query } from "./db.js";
import { pushEnglishSets } from "./english-fields.js";

export type FeaturedPickMode = "single" | "multi";

export type FeaturedItem = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
  titleEn: string | null;
  tagEn: string | null;
  durationEn: string | null;
  statEn: string | null;
  imageSrc: string;
  pickMode: FeaturedPickMode;
};

export type FeaturedEnglishInput = {
  titleEn?: string | null;
  tagEn?: string | null;
  durationEn?: string | null;
  statEn?: string | null;
};

type FeaturedRow = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
  title_en: string | null;
  tag_en: string | null;
  duration_en: string | null;
  stat_en: string | null;
  image_src: string;
  pick_mode: FeaturedPickMode;
  sort_order: number;
};

const DEFAULT_ITEMS: FeaturedItem[] = [
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

const FEATURED_COLUMNS = `id, title, tag, duration, stat, title_en, tag_en, duration_en,
       stat_en, image_src, pick_mode, sort_order`;

function mapFeatured(row: FeaturedRow): FeaturedItem {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag,
    duration: row.duration,
    stat: row.stat,
    titleEn: row.title_en,
    tagEn: row.tag_en,
    durationEn: row.duration_en,
    statEn: row.stat_en,
    imageSrc: row.image_src,
    pickMode: row.pick_mode,
  };
}

export async function seedFeaturedItems(): Promise<void> {
  for (const [index, item] of DEFAULT_ITEMS.entries()) {
    await query(
      `INSERT INTO featured_items (
         id, title, tag, duration, stat, image_src, pick_mode, sort_order
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        item.title,
        item.tag,
        item.duration,
        item.stat,
        item.imageSrc,
        item.pickMode,
        index,
      ],
    );
  }
  await fillDefaultEnglish();
}

/**
 * Give untouched default cards their English text. Only where the Chinese is
 * still the seeded default and no English was set, so admin edits always win.
 */
async function fillDefaultEnglish(): Promise<void> {
  const pairs = [
    ["title", "title_en"],
    ["tag", "tag_en"],
    ["duration", "duration_en"],
    ["stat", "stat_en"],
  ] as const;
  for (const item of DEFAULT_ITEMS) {
    const english = {
      title_en: item.titleEn,
      tag_en: item.tagEn,
      duration_en: item.durationEn,
      stat_en: item.statEn,
    };
    for (const [zhColumn, enColumn] of pairs) {
      await query(
        `UPDATE featured_items SET ${enColumn} = $3
         WHERE id = $1 AND ${zhColumn} = $2 AND ${enColumn} IS NULL`,
        [item.id, item[zhColumn], english[enColumn]],
      );
    }
  }
}

export async function listFeaturedItems(): Promise<FeaturedItem[]> {
  const result = await query<FeaturedRow>(
    `SELECT ${FEATURED_COLUMNS}
     FROM featured_items
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapFeatured);
}

export async function getFeaturedItemById(id: string): Promise<FeaturedItem | null> {
  const result = await query<FeaturedRow>(
    `SELECT ${FEATURED_COLUMNS}
     FROM featured_items
     WHERE id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapFeatured(row) : null;
}

export async function updateFeaturedItem(
  id: string,
  input: {
    title: string;
    tag: string;
    duration: string;
    stat: string;
    imageSrc?: string;
  } & FeaturedEnglishInput,
): Promise<FeaturedItem | null> {
  const sets = [
    "title = $2",
    "tag = $3",
    "duration = $4",
    "stat = $5",
    "image_src = COALESCE($6, image_src)",
    "updated_at = NOW()",
  ];
  const params: unknown[] = [
    id,
    input.title,
    input.tag,
    input.duration,
    input.stat,
    input.imageSrc ?? null,
  ];
  pushEnglishSets(sets, params, [
    ["title_en", input.titleEn],
    ["tag_en", input.tagEn],
    ["duration_en", input.durationEn],
    ["stat_en", input.statEn],
  ]);

  const result = await query<FeaturedRow>(
    `UPDATE featured_items
     SET ${sets.join(", ")}
     WHERE id = $1
     RETURNING ${FEATURED_COLUMNS}`,
    params,
  );

  const row = result.rows[0];
  return row ? mapFeatured(row) : null;
}
