import type { TopMatchPreviewSlot } from "@/lib/data/top-match-previews";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiTopMatchPreviewSlot = {
  id: TopMatchPreviewSlot["id"];
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  pickSelection: string;
};

function mapSlot(slot: ApiTopMatchPreviewSlot): TopMatchPreviewSlot {
  return {
    id: slot.id,
    matchId: slot.matchId,
    homeTeam: slot.homeTeam,
    awayTeam: slot.awayTeam,
    pickSelection: slot.pickSelection,
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

export async function fetchTopMatchPreviews(): Promise<TopMatchPreviewSlot[]> {
  const response = await fetch(`${API_URL}/api/top-match-previews/public`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { items: ApiTopMatchPreviewSlot[] };
  return data.items.map(mapSlot);
}

export async function updateTopMatchPreviews(
  token: string,
  items: TopMatchPreviewSlot[],
): Promise<TopMatchPreviewSlot[]> {
  const response = await fetch(`${API_URL}/api/top-match-previews`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { items: ApiTopMatchPreviewSlot[] };
  return data.items.map(mapSlot);
}
