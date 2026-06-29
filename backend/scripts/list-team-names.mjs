import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`
  SELECT DISTINCT input_snapshot->>'homeTeam' AS team
  FROM match_analyses
  WHERE input_snapshot IS NOT NULL
  UNION
  SELECT DISTINCT input_snapshot->>'awayTeam'
  FROM match_analyses
  WHERE input_snapshot IS NOT NULL
  ORDER BY 1
`);

console.log(r.rows.map((row) => row.team));
await pool.end();
