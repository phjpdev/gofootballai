import fs from "fs";

const c = fs.readFileSync("d:/Work/Projects/HK/gofootball-ai/scripts/hkjc-main.js", "utf8");

for (const term of [
  "Football Tournament Icon",
  "Football Team",
  "logo/team",
  "logo/tournament",
  "football/info",
  "nameProfileId",
  "tourn_es",
  "teamIconState",
]) {
  let idx = 0;
  let count = 0;
  while ((idx = c.indexOf(term, idx)) !== -1 && count < 2) {
    const start = Math.max(0, idx - 200);
    console.log(`\n=== ${term} @ ${idx} ===`);
    console.log(c.slice(start, idx + 300));
    idx++;
    count++;
  }
}
