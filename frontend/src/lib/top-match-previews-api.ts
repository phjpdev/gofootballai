import type { TopMatchPreviewSlot } from "@/lib/data/top-match-previews";
import { readApiError } from "@/lib/i18n/api-errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiTopMatchPreviewSlot = {
  id: TopMatchPreviewSlot["id"];
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  pickSelection: string;
  homeTeamEn: string | null;
  awayTeamEn: string | null;
  pickSelectionEn: string | null;
};

function mapSlot(slot: ApiTopMatchPreviewSlot): TopMatchPreviewSlot {
  return {
    id: slot.id,
    matchId: slot.matchId,
    homeTeam: slot.homeTeam,
    awayTeam: slot.awayTeam,
    pickSelection: slot.pickSelection,
    homeTeamEn: slot.homeTeamEn ?? undefined,
    awayTeamEn: slot.awayTeamEn ?? undefined,
    pickSelectionEn: slot.pickSelectionEn ?? undefined,
  };
}

const parseError = readApiError;

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
