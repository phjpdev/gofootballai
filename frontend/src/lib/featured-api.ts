import type { FeaturedItem } from "@/lib/data/featured";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiFeaturedItem = {
  id: string;
  title: string;
  tag: string;
  duration: string;
  stat: string;
  imageSrc: string;
  pickMode: "single" | "multi";
};

function mapFeaturedItem(item: ApiFeaturedItem): FeaturedItem {
  return {
    id: item.id,
    title: item.title,
    tag: item.tag,
    duration: item.duration,
    stat: item.stat,
    imageSrc: item.imageSrc,
    pickMode: item.pickMode,
  };
}

export function resolveFeaturedImageUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) {
    const base = API_URL.replace(/\/$/, "");
    return `${base}${src}`;
  }
  return src;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

export async function fetchFeaturedItems(): Promise<FeaturedItem[]> {
  const response = await fetch(`${API_URL}/api/featured/public`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { items: ApiFeaturedItem[] };
  return data.items.map(mapFeaturedItem);
}

export type FeaturedItemInput = {
  title: string;
  tag: string;
  duration: string;
  stat: string;
  file?: File;
};

export async function updateFeaturedItem(
  token: string,
  id: string,
  input: FeaturedItemInput,
): Promise<FeaturedItem> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("tag", input.tag);
  formData.append("duration", input.duration);
  formData.append("stat", input.stat);
  if (input.file) formData.append("file", input.file);

  const response = await fetch(`${API_URL}/api/featured/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { item: ApiFeaturedItem };
  return mapFeaturedItem(data.item);
}
