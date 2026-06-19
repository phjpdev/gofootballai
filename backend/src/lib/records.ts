import { randomUUID } from "node:crypto";
import { query } from "./db.js";
import type { RecordItem, RecordType } from "../types.js";

type RecordRow = {
  id: string;
  author_id: string;
  author_name: string;
  type: RecordType;
  title: string;
  content: string | null;
  media_url: string | null;
  display_date: string | Date | null;
  star_rating: number | null;
  created_at: Date;
};

function formatDisplayDate(value: string | Date | null): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value.slice(0, 10);
}

function mapRecord(row: RecordRow): RecordItem {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    type: row.type,
    title: row.title,
    content: row.content,
    mediaUrl: row.media_url,
    displayDate: formatDisplayDate(row.display_date),
    starRating: row.star_rating,
    createdAt: row.created_at.toISOString(),
  };
}

const RECORD_SELECT = `
  SELECT r.id, r.author_id, u.username AS author_name, r.type, r.title,
         r.content, r.media_url, r.display_date, r.star_rating, r.created_at
  FROM records r
  JOIN users u ON u.id = r.author_id
`;

export async function listRecords(): Promise<RecordItem[]> {
  const result = await query<RecordRow>(
    `${RECORD_SELECT}
     ORDER BY COALESCE(r.display_date, r.created_at::date) DESC, r.created_at DESC`,
  );

  return result.rows.map(mapRecord);
}

export async function createRecord(input: {
  authorId: string;
  type: RecordType;
  title: string;
  content?: string;
  mediaUrl?: string;
  displayDate: string;
  starRating: number;
}): Promise<RecordItem> {
  const id = randomUUID();
  const result = await query<RecordRow>(
    `WITH inserted AS (
       INSERT INTO records (
         id, author_id, type, title, content, media_url, display_date, star_rating
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, author_id, type, title, content, media_url, display_date, star_rating, created_at
     )
     SELECT i.id, i.author_id, u.username AS author_name, i.type, i.title,
            i.content, i.media_url, i.display_date, i.star_rating, i.created_at
     FROM inserted i
     JOIN users u ON u.id = i.author_id`,
    [
      id,
      input.authorId,
      input.type,
      input.title,
      input.content ?? null,
      input.mediaUrl ?? null,
      input.displayDate,
      input.starRating,
    ],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("CREATE_FAILED");
  }

  return mapRecord(row);
}

export async function getRecordById(id: string): Promise<RecordItem | null> {
  const result = await query<RecordRow>(
    `${RECORD_SELECT}
     WHERE r.id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapRecord(row) : null;
}

export async function updateRecord(
  id: string,
  input: {
    type: RecordType;
    title: string;
    content?: string | null;
    mediaUrl?: string | null;
    displayDate: string;
    starRating: number;
  },
): Promise<RecordItem | null> {
  const sets = [
    "type = $2",
    "title = $3",
    "content = $4",
    "display_date = $5",
    "star_rating = $6",
  ];
  const params: unknown[] = [
    id,
    input.type,
    input.title,
    input.content ?? null,
    input.displayDate,
    input.starRating,
  ];

  if (input.mediaUrl !== undefined) {
    sets.push(`media_url = $${params.length + 1}`);
    params.push(input.mediaUrl);
  }

  const result = await query<RecordRow>(
    `WITH updated AS (
       UPDATE records
       SET ${sets.join(", ")}
       WHERE id = $1
       RETURNING id, author_id, type, title, content, media_url, display_date, star_rating, created_at
     )
     SELECT u.id, u.author_id, usr.username AS author_name, u.type, u.title,
            u.content, u.media_url, u.display_date, u.star_rating, u.created_at
     FROM updated u
     JOIN users usr ON usr.id = u.author_id`,
    params,
  );

  const row = result.rows[0];
  return row ? mapRecord(row) : null;
}

export async function deleteRecord(id: string): Promise<RecordItem | null> {
  const existing = await getRecordById(id);
  if (!existing) return null;

  const result = await query("DELETE FROM records WHERE id = $1", [id]);
  if ((result.rowCount ?? 0) === 0) return null;

  return existing;
}
