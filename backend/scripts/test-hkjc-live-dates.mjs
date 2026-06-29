import "dotenv/config";
import { createFootballAPI } from "../src/lib/hkjc/graphql-client.ts";
import { transformHkjcMatch } from "../src/lib/hkjc/transform.ts";

const api = createFootballAPI();
const raw = await api.getAllFootballMatches({
  oddsTypes: ["HAD", "HDC"],
  showAllMatch: true,
});

const matches = raw.map(transformHkjcMatch);
const byDate = new Map();
for (const m of matches) {
  const key = m.matchDate;
  byDate.set(key, (byDate.get(key) ?? 0) + 1);
}

console.log("Live HKJC total:", matches.length);
console.log("By matchDate:", [...byDate.entries()].sort());

const june2728 = matches.filter((m) =>
  ["2026-06-27", "2026-06-28"].includes(m.matchDate),
);
console.log(
  "June 27-28 in live feed:",
  june2728.map((m) => ({
    id: m.id,
    date: m.matchDate,
    home: m.homeTeam,
    away: m.awayTeam,
  })),
);
