const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

export async function fetchMatchPickOverride(
  matchId: string,
): Promise<string> {
  const response = await fetch(
    `${API_URL}/api/match-pick-overrides/${encodeURIComponent(matchId)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { pickSelection?: string };
  return data.pickSelection?.trim() ?? "";
}

export async function updateMatchPickOverride(
  token: string,
  matchId: string,
  pickSelection: string,
): Promise<string> {
  const response = await fetch(
    `${API_URL}/api/match-pick-overrides/${encodeURIComponent(matchId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pickSelection }),
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { pickSelection?: string };
  return data.pickSelection?.trim() ?? "";
}
