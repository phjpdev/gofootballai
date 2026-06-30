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
  displayDate: string | null;
  starRating: number | null;
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
    displayDate: record.displayDate ?? undefined,
    starRating: record.starRating ?? undefined,
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
    cache: "no-store",
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

export type RecordInput = {
  type: PostType;
  title: string;
  content?: string;
  displayDate: string;
  starRating: number;
  file?: File;
};

export type RecordUploadOptions = {
  onUploadProgress?: (percent: number) => void;
};

function buildRecordFormData(input: RecordInput): FormData {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  formData.append("displayDate", input.displayDate);
  formData.append("starRating", String(input.starRating));
  if (input.content) formData.append("content", input.content);
  if (input.file) formData.append("file", input.file);
  return formData;
}

function parseXhrError(status: number, responseText: string): string {
  if (status === 413) {
    return "檔案太大，伺服器拒絕上傳（413）。請聯絡管理員將 Nginx client_max_body_size 設為至少 100M。";
  }

  try {
    const data = JSON.parse(responseText) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // Nginx/HTML error pages are not JSON
  }

  if (status >= 500) return "伺服器錯誤，請稍後再試";
  return "請求失敗，請稍後再試";
}

function submitRecordForm(
  method: "POST" | "PATCH",
  url: string,
  token: string,
  input: RecordInput,
  options?: RecordUploadOptions,
): Promise<Post> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (!options?.onUploadProgress || !event.lengthComputable) return;
      const percent = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100),
      );
      options.onUploadProgress(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { record: ApiRecord };
          resolve(mapRecord(data.record));
        } catch {
          reject(new Error("伺服器回應格式錯誤"));
        }
        return;
      }
      reject(new Error(parseXhrError(xhr.status, xhr.responseText)));
    };

    xhr.onerror = () => reject(new Error("網路錯誤，請檢查連線後再試"));
    xhr.onabort = () => reject(new Error("上傳已取消"));

    xhr.send(buildRecordFormData(input));
  });
}

export async function createRecord(
  token: string,
  input: RecordInput,
  options?: RecordUploadOptions,
): Promise<Post> {
  if (input.file && options?.onUploadProgress) {
    return submitRecordForm(
      "POST",
      `${API_URL}/api/records`,
      token,
      input,
      options,
    );
  }

  const response = await fetch(`${API_URL}/api/records`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: buildRecordFormData(input),
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(parseXhrError(413, ""));
    }
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { record: ApiRecord };
  return mapRecord(data.record);
}

export async function updateRecord(
  token: string,
  id: string,
  input: RecordInput,
  options?: RecordUploadOptions,
): Promise<Post> {
  if (input.file && options?.onUploadProgress) {
    return submitRecordForm(
      "PATCH",
      `${API_URL}/api/records/${id}`,
      token,
      input,
      options,
    );
  }

  const response = await fetch(`${API_URL}/api/records/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: buildRecordFormData(input),
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(parseXhrError(413, ""));
    }
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
