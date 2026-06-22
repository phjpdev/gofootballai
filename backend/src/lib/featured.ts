import { query } from "./db.js";

export type FeaturedPickMode = "single" | "multi";

export type FeaturedItem = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
  imageSrc: string;
  pickMode: FeaturedPickMode;
};

type FeaturedRow = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
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
    imageSrc: "/images/featured-world-cup-color.png",
    pickMode: "single",
  },
  {
    id: "featured-2",
    title: "過關推薦",
    tag: "淘汰賽",
    duration: "120分鐘",
    stat: "戰術分析",
    imageSrc: "/images/featured-world-cup-bw.png",
    pickMode: "multi",
  },
];

function mapFeatured(row: FeaturedRow): FeaturedItem {
  return {
    id: row.id,
    title: row.title,
    tag: row.tag,
    duration: row.duration,
    stat: row.stat,
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
}

export async function listFeaturedItems(): Promise<FeaturedItem[]> {
  const result = await query<FeaturedRow>(
    `SELECT id, title, tag, duration, stat, image_src, pick_mode, sort_order
     FROM featured_items
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows.map(mapFeatured);
}

export async function getFeaturedItemById(id: string): Promise<FeaturedItem | null> {
  const result = await query<FeaturedRow>(
    `SELECT id, title, tag, duration, stat, image_src, pick_mode, sort_order
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
  },
): Promise<FeaturedItem | null> {
  const result = await query<FeaturedRow>(
    `UPDATE featured_items
     SET title = $2,
         tag = $3,
         duration = $4,
         stat = $5,
         image_src = COALESCE($6, image_src),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, tag, duration, stat, image_src, pick_mode, sort_order`,
    [
      id,
      input.title,
      input.tag,
      input.duration,
      input.stat,
      input.imageSrc ?? null,
    ],
  );

  const row = result.rows[0];
  return row ? mapFeatured(row) : null;
}
