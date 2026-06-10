const teamId = "50002214";
const headers = {
  Referer: "https://bet.hkjc.com/",
  "User-Agent": "Mozilla/5.0",
};

const paths = [
  `/TeamIcon/team_${teamId}.png`,
  `/TeamIcon/team_${teamId}.svg`,
  `/TeamIcon/${teamId}.png`,
  `/TeamIcon/${teamId}.svg`,
  `/TeamIcon/logo_${teamId}.png`,
  `/TeamIcon/logo_${teamId}.svg`,
  `/FootballTeamIcon/${teamId}.png`,
  `/FootballTeamIcon/team_${teamId}.svg`,
  `/football/team/${teamId}.png`,
  `/Football/Team/${teamId}.png`,
];

for (const path of paths) {
  const url = `https://consvc.hkjc.com/-/media/Sites/JCBW${path}`;
  const res = await fetch(url, { headers });
  const ct = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  const ok = ct.includes("image") || ct.includes("svg");
  const isHtml = buf.slice(0, 5).toString() === "<!DOC";
  if (ok && !isHtml) {
    console.log("HIT", res.status, ct, buf.length, url);
  }
}

// Search JS for TeamIcon path
import fs from "fs";
const c = fs.readFileSync("d:/Work/Projects/HK/gofootball-ai/scripts/hkjc-main.js", "utf8");
for (const term of ["TournIcon", "TeamIcon", "teamIcon", "flag_"]) {
  let i = 0;
  let n = 0;
  while ((i = c.indexOf(term, i)) !== -1 && n < 3) {
    console.log(`\n${term} @ ${i}:`, c.slice(Math.max(0, i - 60), i + 120));
    i++;
    n++;
  }
}
