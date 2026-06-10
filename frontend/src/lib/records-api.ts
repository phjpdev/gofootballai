import type { Post, PostType } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiRecord = {
  id: string;
  authorId: string;
  authorName: string;
  type: PostType;
  title: string;
  content: string | null;
  mediaUrl: string | null;
  createdAt: string;
};

export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = API_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function mapRecord(record: ApiRecord): Post {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    content: record.content ?? undefined,
    mediaUrl: resolveMediaUrl(record.mediaUrl),
    createdAt: record.createdAt,
    authorName: record.authorName,
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

export async function fetchPublicRecords(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/api/records/public`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { records: ApiRecord[] };
  return data.records.map(mapRecord);
}

export async function fetchRecords(token: string): Promise<Post[]> {
  const response = await fetch(`${API_URL}/api/records`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { records: ApiRecord[] };
  return data.records.map(mapRecord);
}

export async function createRecord(
  token: string,
  input: {
    type: PostType;
    title: string;
    content?: string;
    file?: File;
  },
): Promise<Post> {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  if (input.content) formData.append("content", input.content);
  if (input.file) formData.append("file", input.file);

  const response = await fetch(`${API_URL}/api/records`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { record: ApiRecord };
  return mapRecord(data.record);
}

export async function updateRecord(
  token: string,
  id: string,
  input: {
    type: PostType;
    title: string;
    content?: string;
    file?: File;
  },
): Promise<Post> {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  if (input.content) formData.append("content", input.content);
  if (input.file) formData.append("file", input.file);

  const response = await fetch(`${API_URL}/api/records/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { record: ApiRecord };
  return mapRecord(data.record);
}

export async function deleteRecord(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/records/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
