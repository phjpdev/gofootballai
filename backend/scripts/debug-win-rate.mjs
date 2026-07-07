import "dotenv/config";
import pg from "pg";
import { computeWinRateStats } from "../dist/lib/compute-win-rate.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const stats = await computeWinRateStats({ refresh: true });
console.log("Computed stats:", stats);

const unsettled = await pool.query(`
  SELECT COUNT(*)::int AS count
  FROM match_analyses
  WHERE status = 'completed'
    AND analysis->'pick'->>'selection' NOT IN ('', '待定', 'TBD', 'N/A', '無')
    AND (input_snapshot->>'kickOffTime')::timestamptz > NOW() - interval '105 minutes'
`);
console.log("Still within settle window:", unsettled.rows[0]);

await pool.end();
