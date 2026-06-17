import "dotenv/config";
import pg from "pg";

const matchId = process.argv[2] ?? "50068144";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(
  `SELECT hkjc_match_id, status, error_message, analysis, raw_response, updated_at
   FROM match_analyses
   WHERE hkjc_match_id = $1`,
  [matchId],
);
console.log(JSON.stringify(r.rows[0] ?? null, null, 2));
await pool.end();
