import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`
  SELECT hkjc_match_id,
         input_snapshot->>'kickOffTime' AS kickoff,
         input_snapshot->>'homeTeam' AS home
  FROM match_analyses
  WHERE input_snapshot->>'kickOffTime' LIKE '%2026-06-27%'
     OR input_snapshot->>'kickOffTime' LIKE '%2026-06-26%'
`);

console.log("analyses with 26/27 in kickoff string:", r.rows);
await pool.end();
