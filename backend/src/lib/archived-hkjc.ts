import { query } from "./db.js";
import type { HkjcDateItem, HkjcMatch } from "./hkjc/types.js";
import type { HkjcInputSnapshot } from "./hkjc/types.js";
import { fetchHkjcMatchById } from "./hkjc/fetch-matches.js";
import { resolveEnglishTeamName } from "./hkjc/team-names.js";
import { resolveTeamLogoUrl } from "./team-logos.js";

type ArchivedRow = {
  hkjc_match_id: string;
  match_date: string;
  match_data: HkjcMatch;
};

function getTodayDateKeyHk(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(new Date());
}

function addDaysToDateKey(dateKey: string, delta: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return date.toISOString().slice(0, 10);
}

function getPreviousHKDateKeys(count: number): string[] {
  const today = getTodayDateKeyHk();
  const keys: string[] = [];
  for (let offset = count; offset >= 1; offset -= 1) {
    keys.push(addDaysToDateKey(today, -offset));
  }
  return keys;
}

function formatKickOff(kickOffTime: string): string {
  const date = new Date(kickOffTime);
  if (Number.isNaN(date.getTime())) return kickOffTime;
  return date.toLocaleTimeString("zh-HK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  });
}

function dateKeyFromKickOff(kickOffTime: string): string | null {
  const date = new Date(kickOffTime);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(date);
}

function formatDay(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  return date.toLocaleDateString("zh-HK", {
    weekday: "short",
    timeZone: "Asia/Hong_Kong",
  });
}

function hkjcTeamLogoPath(teamId: string): string {
  return `/api/hkjc/logo?type=team&id=${encodeURIComponent(teamId)}`;
}

export function enrichArchivedMatchLogos(match: HkjcMatch): HkjcMatch {
  return {
    ...match,
    homeLogo:
      match.homeLogo ||
      (match.homeTeamId ? hkjcTeamLogoPath(match.homeTeamId) : ""),
    awayLogo:
      match.awayLogo ||
      (match.awayTeamId ? hkjcTeamLogoPath(match.awayTeamId) : ""),
  };
}

function resolveEnglishNames(match: HkjcMatch): HkjcMatch {
  return {
    ...match,
    homeTeamEn: match.homeTeamEn || resolveEnglishTeamName(match.homeTeam),
    awayTeamEn: match.awayTeamEn || resolveEnglishTeamName(match.awayTeam),
  };
}

export async function enrichArchivedMatchForClient(
  match: HkjcMatch,
): Promise<HkjcMatch> {
  let enriched = enrichArchivedMatchLogos(resolveEnglishNames(match));

  if (!enriched.homeLogo && enriched.homeTeamEn) {
    const logo = await resolveTeamLogoUrl(enriched.homeTeamEn);
    if (logo) enriched = { ...enriched, homeLogo: logo };
  }
  if (!enriched.awayLogo && enriched.awayTeamEn) {
    const logo = await resolveTeamLogoUrl(enriched.awayTeamEn);
    if (logo) enriched = { ...enriched, awayLogo: logo };
  }

  return enriched;
}

function snapshotToMatch(snapshot: HkjcInputSnapshot): HkjcMatch | null {
  const matchDate = dateKeyFromKickOff(snapshot.kickOffTime);
  if (!matchDate) return null;

  return enrichArchivedMatchLogos({
    id: snapshot.matchId,
    frontEndId: snapshot.frontEndId,
    title: `${snapshot.homeTeam} 對 ${snapshot.awayTeam}`,
    homeTeam: snapshot.homeTeam,
    awayTeam: snapshot.awayTeam,
    homeTeamEn: snapshot.homeTeamEn ?? "",
    awayTeamEn: snapshot.awayTeamEn ?? "",
    homeTeamId: snapshot.homeTeamId ?? "",
    awayTeamId: snapshot.awayTeamId ?? "",
    tournamentId: "",
    tournamentCode: snapshot.tournamentCode ?? "",
    tournamentName: snapshot.tournamentName,
    matchDate,
    kickOffTime: snapshot.kickOffTime,
    kickOffLabel: formatKickOff(snapshot.kickOffTime),
    status: "ENDED",
    homeLogo: "",
    awayLogo: "",
    tournamentLogo: "",
    hadOdds: snapshot.hadOdds,
    hdcOdds: snapshot.hdcOdds,
    hilOdds: snapshot.hilOdds,
    poolCount: 0,
    inplay: false,
  });
}

export async function archiveHkjcMatches(matches: HkjcMatch[]): Promise<void> {
  if (matches.length === 0) return;

  for (const match of matches) {
    if (!match.id) continue;

    const matchDate =
      dateKeyFromKickOff(match.kickOffTime) ?? match.matchDate ?? null;
    if (!matchDate) continue;

    const payload = enrichArchivedMatchLogos(match);

    await query(
      `INSERT INTO archived_hkjc_matches (hkjc_match_id, match_date, match_data)
       VALUES ($1, $2::date, $3::jsonb)
       ON CONFLICT (hkjc_match_id)
       DO UPDATE SET
         match_date = EXCLUDED.match_date,
         match_data = EXCLUDED.match_data,
         archived_at = NOW()`,
      [match.id, matchDate, JSON.stringify(payload)],
    );
  }
}

async function countMatchesForDateKey(dateKey: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(DISTINCT source_id)::int AS count
     FROM (
       SELECT hkjc_match_id AS source_id
       FROM archived_hkjc_matches
       WHERE match_date = $1::date
          OR ((match_data->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date = $1::date
       UNION
       SELECT hkjc_match_id AS source_id
       FROM match_analyses
       WHERE input_snapshot IS NOT NULL
         AND ((input_snapshot->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date = $1::date
     ) matches`,
    [dateKey],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function syncArchivedFromAnalyses(): Promise<number> {
  const rows = await query<{ input_snapshot: HkjcInputSnapshot }>(
    `SELECT input_snapshot
     FROM match_analyses
     WHERE input_snapshot IS NOT NULL`,
  );

  let synced = 0;
  for (const row of rows.rows) {
    const fromSnapshot = snapshotToMatch(row.input_snapshot);
    if (!fromSnapshot) continue;

    const matchDate = dateKeyFromKickOff(fromSnapshot.kickOffTime);
    if (!matchDate) continue;

    const payload = enrichArchivedMatchLogos(fromSnapshot);
    await query(
      `INSERT INTO archived_hkjc_matches (hkjc_match_id, match_date, match_data)
       VALUES ($1, $2::date, $3::jsonb)
       ON CONFLICT (hkjc_match_id)
       DO UPDATE SET
         match_date = EXCLUDED.match_date,
         match_data = EXCLUDED.match_data,
         archived_at = NOW()`,
      [fromSnapshot.id, matchDate, JSON.stringify(payload)],
    );
    synced += 1;
  }

  return synced;
}

export async function listAdminPastDates(
  limit = 2,
  _excludeDateKeys: string[] = [],
): Promise<HkjcDateItem[]> {
  const dateKeys = getPreviousHKDateKeys(limit);
  const items = await Promise.all(
    dateKeys.map(async (key) => {
      const [, , day] = key.split("-").map(Number);
      const count = await countMatchesForDateKey(key);
      return {
        key,
        day: formatDay(key),
        date: day,
        hasEvent: count > 0,
      };
    }),
  );

  return items;
}

export async function listArchivedMatchesByDate(
  dateKey: string,
): Promise<HkjcMatch[]> {
  const archived = await query<ArchivedRow>(
    `SELECT hkjc_match_id, match_date::text AS match_date, match_data
     FROM archived_hkjc_matches
     WHERE match_date = $1::date
        OR ((match_data->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date = $1::date
     ORDER BY (match_data->>'kickOffTime') ASC`,
    [dateKey],
  );

  const matches = new Map<string, HkjcMatch>();
  for (const row of archived.rows) {
    matches.set(row.hkjc_match_id, enrichArchivedMatchLogos(row.match_data));
  }

  const analysisRows = await query<{ input_snapshot: HkjcInputSnapshot }>(
    `SELECT input_snapshot
     FROM match_analyses
     WHERE input_snapshot IS NOT NULL
       AND ((input_snapshot->>'kickOffTime')::timestamptz AT TIME ZONE 'Asia/Hong_Kong')::date = $1::date`,
    [dateKey],
  );

  for (const row of analysisRows.rows) {
    const snapshot = row.input_snapshot;
    if (!snapshot?.matchId) continue;

    const fromSnapshot = snapshotToMatch(snapshot);
    if (!fromSnapshot || fromSnapshot.matchDate !== dateKey) continue;

    const existing = matches.get(fromSnapshot.id);
    if (!existing) {
      matches.set(fromSnapshot.id, fromSnapshot);
      continue;
    }

    matches.set(fromSnapshot.id, enrichArchivedMatchLogos({
      ...fromSnapshot,
      homeTeamId: existing.homeTeamId || fromSnapshot.homeTeamId,
      awayTeamId: existing.awayTeamId || fromSnapshot.awayTeamId,
      homeTeamEn: existing.homeTeamEn || fromSnapshot.homeTeamEn,
      awayTeamEn: existing.awayTeamEn || fromSnapshot.awayTeamEn,
      homeLogo: existing.homeLogo || fromSnapshot.homeLogo,
      awayLogo: existing.awayLogo || fromSnapshot.awayLogo,
      tournamentCode: existing.tournamentCode || fromSnapshot.tournamentCode,
    }));
  }

  const resolved = await Promise.all(
    [...matches.values()].map(async (match) => {
      let merged = match;

      if (!merged.homeTeamId || !merged.awayTeamId) {
        try {
          const live = await fetchHkjcMatchById(match.id);
          if (live) {
            merged = enrichArchivedMatchLogos({
              ...merged,
              homeTeamId: live.homeTeamId || merged.homeTeamId,
              awayTeamId: live.awayTeamId || merged.awayTeamId,
              homeTeamEn: live.homeTeamEn || merged.homeTeamEn,
              awayTeamEn: live.awayTeamEn || merged.awayTeamEn,
              tournamentCode: live.tournamentCode || merged.tournamentCode,
              homeLogo: live.homeLogo || merged.homeLogo,
              awayLogo: live.awayLogo || merged.awayLogo,
            });
          }
        } catch {
          // best-effort HKJC lookup
        }
      }

      return enrichArchivedMatchForClient(merged);
    }),
  );

  return resolved.sort(
    (a, b) =>
      new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime(),
  );
}

export async function getArchivedMatchById(
  matchId: string,
): Promise<HkjcMatch | null> {
  const archived = await query<ArchivedRow>(
    `SELECT hkjc_match_id, match_date::text AS match_date, match_data
     FROM archived_hkjc_matches
     WHERE hkjc_match_id = $1
     LIMIT 1`,
    [matchId],
  );

  if (archived.rows[0]) {
    return enrichArchivedMatchForClient(archived.rows[0].match_data);
  }

  const analysis = await query<{ input_snapshot: HkjcInputSnapshot }>(
    `SELECT input_snapshot
     FROM match_analyses
     WHERE hkjc_match_id = $1
       AND input_snapshot IS NOT NULL
     ORDER BY updated_at DESC
     LIMIT 1`,
    [matchId],
  );

  const snapshot = analysis.rows[0]?.input_snapshot;
  const fromSnapshot = snapshot ? snapshotToMatch(snapshot) : null;
  return fromSnapshot ? enrichArchivedMatchForClient(fromSnapshot) : null;
}
