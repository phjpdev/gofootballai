import fs from "fs";

const c = fs.readFileSync("d:/Work/Projects/HK/gofootball-ai/scripts/hkjc-main.js", "utf8");

// Find all Sitecore media paths
const re = /\/-\/media\/Sites\/JCBW\/[^"'\\]+/gi;
const found = new Set();
let m;
while ((m = re.exec(c))) found.add(m[0]);

[...found]
  .filter((p) => /team|Team|crest|Crest|club|Club|logo|Logo/i.test(p))
  .sort()
  .forEach((p) => console.log(p));

// Search for team id pattern in URL building
for (const term of [
  "homeTeam.id",
  "awayTeam.id",
  "teamId",
  "TEAM_ICON",
  "TeamIcon",
  "team_icon",
  "Crest",
  "crest",
]) {
  let i = 0;
  let n = 0;
  while ((i = c.indexOf(term, i)) !== -1 && n < 2) {
    console.log(`\n=== ${term} @ ${i} ===`);
    console.log(c.slice(Math.max(0, i - 120), i + 280));
    i++;
    n++;
  }
}
