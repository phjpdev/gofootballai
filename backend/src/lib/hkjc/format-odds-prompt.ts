import type { HkjcInputSnapshot } from "./types.js";

function formatKickOffLabel(kickOffTime: string): string {
  const date = new Date(kickOffTime);
  if (Number.isNaN(date.getTime())) return kickOffTime;
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Hong_Kong",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  });
  return `${datePart} ${timePart}`;
}

export function formatMatchOddsPrompt(snapshot: HkjcInputSnapshot): string {
  const lines: string[] = [
    `${formatKickOffLabel(snapshot.kickOffTime)} ${snapshot.frontEndId} ${snapshot.homeTeam} / ${snapshot.awayTeam}`,
  ];

  if (snapshot.hadOdds) {
    lines.push(
      `HAD: ${snapshot.hadOdds.home} / ${snapshot.hadOdds.draw} / ${snapshot.hadOdds.away}`,
    );
  } else {
    lines.push("HAD: 盤口未開");
  }

  if (snapshot.hdcOdds) {
    lines.push(
      `HDC: ${snapshot.hdcOdds.homeLine} ${snapshot.hdcOdds.homeOdds} / ${snapshot.hdcOdds.awayLine} ${snapshot.hdcOdds.awayOdds}`,
    );
  } else {
    lines.push("HDC: 盤口未開");
  }

  if (snapshot.hilOdds) {
    lines.push(
      `HIL: ${snapshot.hilOdds.line} ${snapshot.hilOdds.overOdds} / ${snapshot.hilOdds.underOdds}`,
    );
  } else {
    lines.push("HIL: 盤口未開");
  }

  return lines.join("\n");
}
