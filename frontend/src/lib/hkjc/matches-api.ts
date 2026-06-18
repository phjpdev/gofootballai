import type { HkjcMatch, HkjcMatchesResponse } from "@/types/hkjc";

function getServerApiUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000"
  );
}

/** Browser uses same-origin Next proxy; server calls backend directly. */
export function getHkjcApiUrl(path: string): string {
  if (typeof window !== "undefined") {
    return `/api/hkjc${path}`;
  }
  return `${getServerApiUrl()}/api/hkjc${path}`;
}

export async function fetchHkjcMatchesFromApi(options?: {
  refresh?: boolean;
}): Promise<HkjcMatchesResponse> {
  const query = options?.refresh ? "?refresh=1" : "";
  const response = await fetch(getHkjcApiUrl(`/matches${query}`), {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("載入賽事失敗");
  }
  return (await response.json()) as HkjcMatchesResponse;
}

export async function fetchHkjcMatchByIdFromApi(
  id: string,
): Promise<HkjcMatch | null> {
  const response = await fetch(getHkjcApiUrl(`/matches/${encodeURIComponent(id)}`), {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("載入賽事失敗");
  }
  return (await response.json()) as HkjcMatch;
}
