import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`
  SELECT hkjc_match_id,
         input_snapshot->>'homeTeam' AS home,
         input_snapshot->>'awayTeam' AS away,
         input_snapshot->>'kickOffTime' AS kickoff,
         input_snapshot->>'matchId' AS mid
  FROM match_analyses
  WHERE input_snapshot IS NOT NULL
  ORDER BY (input_snapshot->>'kickOffTime') DESC
  LIMIT 20
`);

console.log(r.rows);
await pool.end();
