import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`
  SELECT (updated_at AT TIME ZONE 'Asia/Hong_Kong')::date::text AS day,
         count(*)::int
  FROM match_analyses
  WHERE updated_at >= '2026-06-25'
  GROUP BY 1
  ORDER BY 1
`);

console.log("analyses by updated_at HK:", r.rows);
await pool.end();
