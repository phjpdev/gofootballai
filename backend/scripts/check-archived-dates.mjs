import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const archived = await pool.query(`
  SELECT match_date::text AS d, COUNT(*)::int AS c
  FROM archived_hkjc_matches
  GROUP BY match_date
  ORDER BY match_date
`);

const analyses = await pool.query(`
  SELECT
    ((input_snapshot->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date::text AS d,
    COUNT(*)::int AS c
  FROM match_analyses
  WHERE input_snapshot IS NOT NULL
  GROUP BY d
  ORDER BY d
`);

const sample = await pool.query(`
  SELECT hkjc_match_id,
         match_date::text,
         match_data->>'homeTeam' AS home,
         match_data->>'awayTeam' AS away,
         match_data->>'homeTeamId' AS home_id,
         match_data->>'kickOffTime' AS kickoff
  FROM archived_hkjc_matches
  LIMIT 10
`);

const june2728 = await pool.query(`
  SELECT match_date::text,
         ((match_data->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date::text AS kick_hk,
         match_data->>'homeTeam' AS home,
         match_data->>'awayTeam' AS away,
         match_data->>'homeTeamId' AS home_id
  FROM archived_hkjc_matches
  WHERE ((match_data->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date IN ('2026-06-27', '2026-06-28')
     OR match_date IN ('2026-06-27', '2026-06-28')
`);

const juneAnalyses = await pool.query(`
  SELECT hkjc_match_id,
         input_snapshot->>'homeTeam' AS home,
         input_snapshot->>'awayTeam' AS away,
         input_snapshot->>'kickOffTime' AS kickoff,
         input_snapshot->>'homeTeamId' AS home_id
  FROM match_analyses
  WHERE input_snapshot IS NOT NULL
    AND ((input_snapshot->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date IN ('2026-06-27', '2026-06-28')
`);

console.log("27-28 archived:", june2728.rows);
console.log("27-28 analyses:", juneAnalyses.rows);
await pool.end();
