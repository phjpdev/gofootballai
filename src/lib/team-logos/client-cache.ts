const logoPromises = new Map<string, Promise<string | null>>();

export function fetchTeamLogo(name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  const existing = logoPromises.get(key);
  if (existing) return existing;

  const promise = fetch(`/api/team-logo?name=${encodeURIComponent(name)}`)
    .then(async (response) => {
      if (!response.ok) return null;
      const data = (await response.json()) as { url?: string };
      return data.url ?? null;
    })
    .catch(() => null);

  logoPromises.set(key, promise);
  return promise;
}
