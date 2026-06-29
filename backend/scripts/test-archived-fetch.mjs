import "dotenv/config";
import { fetchHkjcMatchById } from "../src/lib/hkjc/fetch-matches.ts";
import { listArchivedMatchesByDate } from "../src/lib/archived-hkjc.ts";

const match = await fetchHkjcMatchById("50068986");
console.log("HKJC match 50068986:", match
  ? {
      id: match.id,
      home: match.homeTeam,
      away: match.awayTeam,
      homeEn: match.homeTeamEn,
      awayEn: match.awayTeamEn,
      homeId: match.homeTeamId,
      awayId: match.awayTeamId,
      homeLogo: match.homeLogo,
    }
  : null);

const june28 = await listArchivedMatchesByDate("2026-06-28");
console.log("June 28 matches:", june28.length, june28[0]);

const june27 = await listArchivedMatchesByDate("2026-06-27");
console.log("June 27 matches:", june27.length);
