const teamId = "50002214";
const tournId = "50069839";
const nameProfileId = "51450089";

const bases = [
  "https://consvc.hkjc.com",
  "https://info.cld.hkjc.com",
  "https://txnc01.hkjcfootball.com",
  "https://football.hkjc.com",
  "https://common.hkjc.com",
];

const paths = [
  `/football/info/logo/team/${teamId}.png`,
  `/football/info/logo/team/${teamId}`,
  `/football/info/team/logo/${teamId}.png`,
  `/football/team/logo/${teamId}.png`,
  `/api/football/logo/team/${teamId}.png`,
  `/programme/images/team/${teamId}.png`,
  `/programme/images/teams/${teamId}.png`,
  `/-/media/Sites/JCBW/Football/Team/${teamId}.png`,
  `/-/media/Sites/JCBW/Football/Teams/${teamId}.png`,
  `/-/media/Sites/JCBW/FootballTeamIcon/${teamId}.png`,
  `/-/media/Sites/JCBW/FootballTournamentIcon/${nameProfileId}.png`,
  `/-/media/Sites/JCBW/FootballTournamentIcon/${nameProfileId}`,
  `/football/info/logo/tournament/${tournId}.png`,
];

const headers = {
  Referer: "https://bet.hkjc.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

for (const base of bases) {
  for (const path of paths) {
    const url = base + path;
    try {
      const res = await fetch(url, { headers, redirect: "follow" });
      const ct = res.headers.get("content-type") ?? "";
      const buf = Buffer.from(await res.arrayBuffer());
      const isPng = buf[0] === 0x89 && buf[1] === 0x50;
      const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
      const isSvg = ct.includes("svg") || buf.slice(0, 5).toString() === "<svg ";
      const isHtml = ct.includes("html") || buf.slice(0, 5).toString() === "<!DOC";
      if (isPng || isJpg || isSvg) {
        console.log("HIT", res.status, ct, buf.length, url);
      } else if (!isHtml && buf.length > 100 && buf.length < 50000) {
        console.log("MAYBE", res.status, ct, buf.length, buf.slice(0, 8).toString("hex"), url);
      }
    } catch {
      // ignore
    }
  }
}

console.log("done");
