import { query } from "./db.js";
import { pushEnglishSets } from "./english-fields.js";

export type TopMatchPreviewId =
  | "preview-1"
  | "preview-2"
  | "preview-3"
  | "preview-4";

export type TopMatchPreviewSlot = {
  id: TopMatchPreviewId;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  pickSelection: string;
  homeTeamEn: string | null;
  awayTeamEn: string | null;
  pickSelectionEn: string | null;
};

/** English fields: undefined = keep stored value, null = clear. */
export type TopMatchPreviewUpdate = Omit<
  TopMatchPreviewSlot,
  "homeTeamEn" | "awayTeamEn" | "pickSelectionEn"
> & {
  homeTeamEn?: string | null;
  awayTeamEn?: string | null;
  pickSelectionEn?: string | null;
};

type TopMatchPreviewRow = {
  id: TopMatchPreviewId;
  match_id: string;
  home_team: string;
  away_team: string;
  pick_selection: string;
  home_team_en: string | null;
  away_team_en: string | null;
  pick_selection_en: string | null;
  sort_order: number;
};

const SLOT_COLUMNS = `id, match_id, home_team, away_team, pick_selection,
       home_team_en, away_team_en, pick_selection_en, sort_order`;

const EMPTY_ENGLISH = { homeTeamEn: null, awayTeamEn: null, pickSelectionEn: null };

export const PREVIEW_SLOT_COUNT = 4;

const DEFAULT_SLOTS: TopMatchPreviewSlot[] = [
  { id: "preview-1", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "", ...EMPTY_ENGLISH },
  { id: "preview-2", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "", ...EMPTY_ENGLISH },
  { id: "preview-3", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "", ...EMPTY_ENGLISH },
  { id: "preview-4", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "", ...EMPTY_ENGLISH },
];

function mapSlot(row: TopMatchPreviewRow): TopMatchPreviewSlot {
  return {
    id: row.id,
    matchId: row.match_id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    pickSelection: row.pick_selection,
    homeTeamEn: row.home_team_en,
    awayTeamEn: row.away_team_en,
    pickSelectionEn: row.pick_selection_en,
  };
}

export async function seedTopMatchPreviews(): Promise<void> {
  for (const [index, slot] of DEFAULT_SLOTS.entries()) {
    await query(
      `INSERT INTO top_match_previews (
         id, match_id, home_team, away_team, pick_selection, sort_order
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        slot.id,
        slot.matchId,
        slot.homeTeam,
        slot.awayTeam,
        slot.pickSelection,
        index,
      ],
    );
  }
}

export async function listTopMatchPreviews(): Promise<TopMatchPreviewSlot[]> {
  const result = await query<TopMatchPreviewRow>(
    `SELECT ${SLOT_COLUMNS}
     FROM top_match_previews
     ORDER BY sort_order ASC, id ASC`,
  );

  if (result.rows.length === 0) {
    return DEFAULT_SLOTS;
  }

  return result.rows.map(mapSlot);
}

export async function updateTopMatchPreviews(
  items: TopMatchPreviewUpdate[],
): Promise<TopMatchPreviewSlot[]> {
  for (const [index, item] of items.entries()) {
    const sets = [
      "match_id = $2",
      "home_team = $3",
      "away_team = $4",
      "pick_selection = $5",
      "sort_order = $6",
      "updated_at = NOW()",
    ];
    const params: unknown[] = [
      item.id,
      item.matchId.trim(),
      item.homeTeam.trim(),
      item.awayTeam.trim(),
      item.pickSelection.trim(),
      index,
    ];
    pushEnglishSets(sets, params, [
      ["home_team_en", item.homeTeamEn],
      ["away_team_en", item.awayTeamEn],
      ["pick_selection_en", item.pickSelectionEn],
    ]);
    await query(
      `UPDATE top_match_previews SET ${sets.join(", ")} WHERE id = $1`,
      params,
    );
  }

  return listTopMatchPreviews();
}
