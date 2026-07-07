import "dotenv/config";
import pg from "pg";
import { resolveHkjcSettlementBatch } from "../dist/lib/hkjc-match-results.js";
import {
  isPickSettlable,
  settleAiPickWithHkjc,
} from "../dist/lib/pick-settlement.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const rows = (
  await pool.query(`
    SELECT hkjc_match_id,
           input_snapshot,
           analysis
    FROM match_analyses
    WHERE status = 'completed'
      AND analysis IS NOT NULL
      AND analysis->'pick'->>'selection' NOT IN ('', '待定', 'TBD', 'N/A', '無')
  `)
).rows.filter((row) =>
  row.input_snapshot?.kickOffTime
    ? isPickSettlable(row.input_snapshot.kickOffTime)
    : false,
);

const settlements = await resolveHkjcSettlementBatch(
  rows.map((row) => row.hkjc_match_id),
);

const byMarket = {};
const byConfidence = {};
const byLevel = {};
const unsettled = [];
const losses = [];

for (const row of rows) {
  const pick = row.analysis.pick;
  const settlement = settlements.get(row.hkjc_match_id);
  if (!settlement) {
    unsettled.push(`${pick.market} ${pick.selection}`);
    continue;
  }

  const outcome = settleAiPickWithHkjc(pick, settlement, row.input_snapshot);
  if (outcome !== "won" && outcome !== "lost") {
    unsettled.push(`${pick.market} ${pick.selection} (${outcome ?? "null"})`);
    continue;
  }

  const market = pick.market ?? "?";
  byMarket[market] ??= { wins: 0, total: 0 };
  byMarket[market].total += 1;
  if (outcome === "won") byMarket[market].wins += 1;

  const conf = Math.round(row.analysis.confidenceScore ?? 0);
  const confBucket = conf >= 80 ? "80+" : conf >= 70 ? "70-79" : conf >= 60 ? "60-69" : "<60";
  byConfidence[confBucket] ??= { wins: 0, total: 0 };
  byConfidence[confBucket].total += 1;
  if (outcome === "won") byConfidence[confBucket].wins += 1;

  const level = String(row.analysis.recommendationLevel ?? "?");
  byLevel[level] ??= { wins: 0, total: 0 };
  byLevel[level].total += 1;
  if (outcome === "won") byLevel[level].wins += 1;

  if (outcome === "lost" && losses.length < 8) {
    const score = settlement.score
      ? `${settlement.score.homeGoals}-${settlement.score.awayGoals}`
      : `total ${settlement.totalGoals}`;
    losses.push({ pick: `${pick.market} ${pick.selection}`, score, conf });
  }
}

function rate(bucket) {
  return bucket.total
    ? `${((bucket.wins / bucket.total) * 100).toFixed(1)}% (${bucket.wins}/${bucket.total})`
    : "n/a";
}

const total = Object.values(byMarket).reduce(
  (acc, b) => ({ wins: acc.wins + b.wins, total: acc.total + b.total }),
  { wins: 0, total: 0 },
);

console.log("Overall:", rate(total));
console.log("\nBy market:");
for (const [k, v] of Object.entries(byMarket).sort((a, b) => b[1].total - a[1].total)) {
  console.log(`  ${k}: ${rate(v)}`);
}
console.log("\nBy confidence:");
for (const [k, v] of Object.entries(byConfidence)) {
  console.log(`  ${k}: ${rate(v)}`);
}
console.log("\nBy recommendation level (1-5):");
for (const [k, v] of Object.entries(byLevel).sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log(`  Level ${k}: ${rate(v)}`);
}
console.log(`\nUnsettled/skipped: ${unsettled.length}`);
if (unsettled.length) console.log(unsettled.slice(0, 10));

await pool.end();
