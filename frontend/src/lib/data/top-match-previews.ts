export type TopMatchPreviewId =
  | "preview-1"
  | "preview-2"
  | "preview-3"
  | "preview-4";

export type TopMatchPreviewSlot = {
  id: TopMatchPreviewId;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  pickSelection: string;
};

export const PREVIEW_SLOT_COUNT = 4;

export const PREVIEW_SLOT_LABELS: Record<TopMatchPreviewId, string> = {
  "preview-1": "精選 1",
  "preview-2": "精選 2",
  "preview-3": "精選 3",
  "preview-4": "精選 4",
};

export const DEFAULT_TOP_MATCH_PREVIEWS: TopMatchPreviewSlot[] = [
  { id: "preview-1", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "" },
  { id: "preview-2", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "" },
  { id: "preview-3", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "" },
  { id: "preview-4", matchId: "", homeTeam: "", awayTeam: "", pickSelection: "" },
];

export function sortPreviewSlots(
  slots: TopMatchPreviewSlot[],
): TopMatchPreviewSlot[] {
  return [...slots].sort((a, b) => a.id.localeCompare(b.id));
}

export function mergePreviewMatchIds(
  configured: TopMatchPreviewSlot[],
  autoRanked: string[],
  count = PREVIEW_SLOT_COUNT,
): string[] {
  const ordered = sortPreviewSlots(configured);
  const used = new Set<string>();
  const result: string[] = [];

  for (const slot of ordered) {
    if (result.length >= count) break;
    const matchId = slot.matchId.trim();
    if (matchId && !used.has(matchId)) {
      result.push(matchId);
      used.add(matchId);
    }
  }

  for (const matchId of autoRanked) {
    if (result.length >= count) break;
    if (!used.has(matchId)) {
      result.push(matchId);
      used.add(matchId);
    }
  }

  return result;
}

export function hasPreviewOverrides(slot: TopMatchPreviewSlot): boolean {
  return Boolean(
    slot.homeTeam.trim() || slot.awayTeam.trim() || slot.pickSelection.trim(),
  );
}
