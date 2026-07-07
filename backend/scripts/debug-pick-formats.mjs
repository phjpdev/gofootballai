import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(`
  SELECT analysis->'pick'->>'market' AS market,
         analysis->'pick'->>'selection' AS selection,
         COUNT(*)::int AS count
  FROM match_analyses
  WHERE status = 'completed'
  GROUP BY 1, 2
  ORDER BY count DESC
  LIMIT 30
`);
console.log(r.rows);
await pool.end();
