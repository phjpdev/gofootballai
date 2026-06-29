import { query } from "./db.js";

export type MatchPickOverride = {
  matchId: string;
  pickSelection: string;
};

type MatchPickOverrideRow = {
  hkjc_match_id: string;
  pick_selection: string;
};

function mapRow(row: MatchPickOverrideRow): MatchPickOverride {
  return {
    matchId: row.hkjc_match_id,
    pickSelection: row.pick_selection,
  };
}

export async function getMatchPickOverride(
  matchId: string,
): Promise<MatchPickOverride | null> {
  const result = await query<MatchPickOverrideRow>(
    `SELECT hkjc_match_id, pick_selection
     FROM match_pick_overrides
     WHERE hkjc_match_id = $1`,
    [matchId],
  );

  const row = result.rows[0];
  if (!row || !row.pick_selection.trim()) return null;
  return mapRow(row);
}

export async function upsertMatchPickOverride(
  matchId: string,
  pickSelection: string,
): Promise<MatchPickOverride | null> {
  const trimmed = pickSelection.trim();
  if (!trimmed) {
    await query(`DELETE FROM match_pick_overrides WHERE hkjc_match_id = $1`, [
      matchId,
    ]);
    return null;
  }

  const result = await query<MatchPickOverrideRow>(
    `INSERT INTO match_pick_overrides (hkjc_match_id, pick_selection)
     VALUES ($1, $2)
     ON CONFLICT (hkjc_match_id)
     DO UPDATE SET
       pick_selection = EXCLUDED.pick_selection,
       updated_at = NOW()
     RETURNING hkjc_match_id, pick_selection`,
    [matchId, trimmed],
  );

  return mapRow(result.rows[0]);
}
