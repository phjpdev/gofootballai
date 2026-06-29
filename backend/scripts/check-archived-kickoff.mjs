import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(`
  SELECT ((match_data->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date::text AS kick_hk,
         match_date::text,
         count(*)::int
  FROM archived_hkjc_matches
  GROUP BY 1, 2
  ORDER BY 1
`);

console.log("archived by kick_hk / match_date:", r.rows);

const analyses = await pool.query(`
  SELECT ((input_snapshot->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date::text AS kick_hk,
         count(*)::int
  FROM match_analyses
  WHERE input_snapshot IS NOT NULL
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT 15
`);

console.log("analyses by kick_hk:", analyses.rows);
await pool.end();
