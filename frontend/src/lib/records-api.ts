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

export function resolveMediaUrl(
  url?: string | null,
  cacheKey?: string,
): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return appendCacheKey(url, cacheKey);
  }
  const base = API_URL.replace(/\/$/, "");
  const resolved = `${base}${url.startsWith("/") ? url : `/${url}`}`;
  return appendCacheKey(resolved, cacheKey);
}

function appendCacheKey(url: string, cacheKey?: string): string {
  if (!cacheKey) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(cacheKey)}`;
}

function mapRecord(record: ApiRecord, cacheKey?: string): Post {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    content: record.content ?? undefined,
    mediaUrl: resolveMediaUrl(record.mediaUrl, cacheKey ?? record.id),
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
  return data.records.map((record) => mapRecord(record));
}

export async function fetchRecords(token: string): Promise<Post[]> {
  const response = await fetch(`${API_URL}/api/records`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { records: ApiRecord[] };
  return data.records.map((record) => mapRecord(record));
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

function buildRecordFormData(input: RecordInput, uploadId?: string): FormData {
  const formData = new FormData();
  formData.append("type", input.type);
  formData.append("title", input.title);
  formData.append("displayDate", input.displayDate);
  formData.append("starRating", String(input.starRating));
  if (input.content) formData.append("content", input.content);
  if (uploadId) {
    formData.append("uploadId", uploadId);
  } else if (input.file) {
    formData.append("file", input.file);
  }
  return formData;
}

/**
 * Resumable upload.
 *
 * A single POST of a 20MB video holds one connection for 15s or more. If the
 * API restarts in that window the upload is lost outright -- measured at 0/6
 * successes against a server restarting every 30s. Short chunks make a restart
 * cost one ~1.4s retry instead of the whole file, and the server reports the
 * byte count it actually holds so we resume exactly there.
 */
const CHUNK_UPLOAD_THRESHOLD = 4 * 1024 * 1024;
const CHUNK_SIZE = 2 * 1024 * 1024;
const CHUNK_MAX_ATTEMPTS = 6;
const CHUNK_ATTEMPT_BUDGET = 200;

function backoffMs(attempt: number): number {
  return Math.min(4000, 400 * 2 ** (attempt - 1));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 502/503/504 and a dead connection all mean "try again shortly". */
function isTransientStatus(status: number): boolean {
  return status === 0 || status === 429 || status >= 500;
}

async function readJsonSafe(
  response: Response,
): Promise<{ error?: string; received?: number; uploadId?: string }> {
  try {
    return (await response.json()) as {
      error?: string;
      received?: number;
      uploadId?: string;
    };
  } catch {
    return {};
  }
}

async function withRetry<T>(
  label: string,
  run: () => Promise<T>,
  attempts = CHUNK_MAX_ATTEMPTS,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (error instanceof PermanentUploadError) throw error;
      if (attempt < attempts) await sleep(backoffMs(attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(label);
}

class PermanentUploadError extends Error {}

async function uploadFileInChunks(
  token: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const { uploadId } = await withRetry("無法建立上傳工作階段", async () => {
    const response = await fetch(
      `${API_URL}/api/records/upload-sessions?name=${encodeURIComponent(file.name)}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await readJsonSafe(response);
    if (!response.ok || !data.uploadId) {
      if (!isTransientStatus(response.status)) {
        throw new PermanentUploadError(
          data.error ?? parseXhrError(response.status, ""),
        );
      }
      throw new Error(data.error ?? "無法建立上傳工作階段");
    }
    return { uploadId: data.uploadId };
  });

  let offset = 0;
  let spent = 0;

  while (offset < file.size) {
    const end = Math.min(offset + CHUNK_SIZE, file.size);
    const chunk = file.slice(offset, end);
    let placed = false;

    for (let attempt = 1; attempt <= CHUNK_MAX_ATTEMPTS && !placed; attempt += 1) {
      spent += 1;
      if (spent > CHUNK_ATTEMPT_BUDGET) {
        throw new Error("上傳重試次數過多，請稍後再試");
      }

      try {
        const response = await fetch(
          `${API_URL}/api/records/upload-sessions/${uploadId}?offset=${offset}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/octet-stream",
            },
            body: chunk,
          },
        );

        const data = await readJsonSafe(response);

        // The server is authoritative about how many bytes it holds.
        if (response.status === 409 && typeof data.received === "number") {
          offset = data.received;
          placed = true;
          break;
        }

        if (!response.ok) {
          if (!isTransientStatus(response.status)) {
            throw new PermanentUploadError(
              data.error ?? parseXhrError(response.status, ""),
            );
          }
          throw new Error(data.error ?? "上傳中斷");
        }

        offset = typeof data.received === "number" ? data.received : end;
        placed = true;
      } catch (error) {
        if (error instanceof PermanentUploadError) throw error;
        if (attempt >= CHUNK_MAX_ATTEMPTS) {
          throw error instanceof Error ? error : new Error("上傳中斷");
        }
        await sleep(backoffMs(attempt));
      }
    }

    onProgress?.(Math.min(99, Math.round((offset / file.size) * 100)));
  }

  onProgress?.(100);
  return uploadId;
}

/**
 * Finalize is retryable: the server keys the created record to the upload
 * session, so a retry after a lost response returns the same record rather
 * than creating a duplicate.
 */
async function finalizeChunkedRecord(
  method: "POST" | "PATCH",
  url: string,
  token: string,
  input: RecordInput,
  uploadId: string,
): Promise<Post> {
  return withRetry("建立紀錄失敗", async () => {
    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: buildRecordFormData(input, uploadId),
    });

    if (!response.ok) {
      const data = await readJsonSafe(response);
      if (!isTransientStatus(response.status)) {
        throw new PermanentUploadError(
          data.error ?? parseXhrError(response.status, ""),
        );
      }
      throw new Error(data.error ?? parseXhrError(response.status, ""));
    }

    const data = (await response.json()) as { record: ApiRecord };
    return mapRecord(data.record);
  });
}

function shouldChunk(file?: File): boolean {
  return !!file && file.size > CHUNK_UPLOAD_THRESHOLD;
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

  // status 0 means the browser never got a readable response: either the
  // connection dropped, or nginx answered with an error page that carries no
  // Access-Control-Allow-Origin (its `location /` block sets none), so the CORS
  // check blocks it and onload never fires. Either way the API went away
  // mid-request -- blaming the user's connection sent us hunting the wrong bug.
  if (status === 0) {
    return "與伺服器的連線中斷（伺服器可能剛重新啟動），請再試一次。";
  }
  if (status === 502 || status === 503 || status === 504) {
    return `伺服器暫時無法處理請求（${status}），可能正在重新啟動，請稍候再試一次。`;
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

    xhr.onerror = () => reject(new Error(parseXhrError(0, "")));
    xhr.onabort = () => reject(new Error("上傳已取消"));

    xhr.send(buildRecordFormData(input));
  });
}

export async function createRecord(
  token: string,
  input: RecordInput,
  options?: RecordUploadOptions,
): Promise<Post> {
  if (shouldChunk(input.file)) {
    const uploadId = await uploadFileInChunks(
      token,
      input.file as File,
      options?.onUploadProgress,
    );
    return finalizeChunkedRecord(
      "POST",
      `${API_URL}/api/records`,
      token,
      input,
      uploadId,
    );
  }

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
  if (shouldChunk(input.file)) {
    const uploadId = await uploadFileInChunks(
      token,
      input.file as File,
      options?.onUploadProgress,
    );
    return finalizeChunkedRecord(
      "PATCH",
      `${API_URL}/api/records/${id}`,
      token,
      input,
      uploadId,
    );
  }

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

export async function retranscodeRecord(token: string, id: string): Promise<Post> {
  const response = await fetch(`${API_URL}/api/records/${id}/retranscode`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { record: ApiRecord };
  return mapRecord(data.record, `${data.record.id}-${Date.now()}`);
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
