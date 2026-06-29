type SportsDbTeam = {
  strTeam: string;
  strSport: string;
  strBadge?: string;
};

const logoCache = new Map<string, string | null>();
let lastRequestAt = 0;
const MIN_REQUEST_GAP_MS = 120;

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchQueries(teamName: string): string[] {
  const queries = [teamName.trim()];
  const firstWord = teamName.trim().split(/\s+/)[0];
  if (firstWord && firstWord.length > 3 && !queries.includes(firstWord)) {
    queries.push(firstWord);
  }
  return queries;
}

function pickBestMatch(
  teams: SportsDbTeam[],
  teamName: string,
): SportsDbTeam | null {
  if (!teams.length) return null;

  const norm = normalize(teamName);
  const soccerTeams = teams.filter((team) => team.strSport === "Soccer");
  const pool = soccerTeams.length > 0 ? soccerTeams : teams;

  return (
    pool.find((team) => normalize(team.strTeam) === norm) ??
    pool.find(
      (team) =>
        norm.includes(normalize(team.strTeam)) ||
        normalize(team.strTeam).includes(norm),
    ) ??
    pool[0] ??
    null
  );
}

async function searchSportsDb(query: string): Promise<SportsDbTeam[]> {
  const now = Date.now();
  const wait = MIN_REQUEST_GAP_MS - (now - lastRequestAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestAt = Date.now();

  const response = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`,
  );

  if (!response.ok) return [];

  const json = (await response.json()) as { teams?: SportsDbTeam[] };
  return json.teams ?? [];
}

export async function resolveTeamLogoUrl(
  teamName: string,
): Promise<string | null> {
  const trimmed = teamName.trim();
  if (!trimmed) return null;

  const cacheKey = normalize(trimmed);
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) ?? null;
  }

  for (const query of searchQueries(trimmed)) {
    try {
      const teams = await searchSportsDb(query);
      const match = pickBestMatch(teams, trimmed);
      const badge = match?.strBadge ?? null;
      if (badge) {
        logoCache.set(cacheKey, badge);
        return badge;
      }
    } catch {
      // try next query
    }
  }

  logoCache.set(cacheKey, null);
  return null;
}
