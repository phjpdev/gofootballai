import "dotenv/config";
import { createFootballAPI } from "../dist/lib/hkjc/graphql-client.js";

const api = createFootballAPI();
const matchId = process.argv[2] ?? "50070568";

const formats = [
  "2026-06-30",
  "30/06/2026",
  "20260630",
  "30-06-2026",
];

for (const startDate of formats) {
  const res = await api.searchHistoricFootballMatches({
    startDate,
    endDate: startDate,
  });
  console.log(startDate, "=>", res.matches?.length ?? 0, "matches");
}

console.log("\nIndividual historic details for", matchId);
const detail = await api.getHistoricFootballMatchDetails(matchId, ["HAD"]);
console.log(JSON.stringify(detail, null, 2)?.slice(0, 2000));

console.log("\nLive match details for", matchId);
const live = await api.getFootballMatchDetails(matchId, ["HAD"]);
console.log({
  status: live?.status,
  runningResult: live?.runningResult,
  matchDate: live?.matchDate,
});

console.log("\nBroader historic range 2026-06-27 to 2026-07-07");
const range = await api.searchHistoricFootballMatches({
  startDate: "2026-06-27",
  endDate: "2026-07-07",
});
console.log("count", range.matches?.length ?? 0);
if (range.matches?.[0]) {
  console.log("sample", {
    id: range.matches[0].id,
    matchDate: range.matches[0].matchDate,
    results: range.matches[0].results,
  });
}
