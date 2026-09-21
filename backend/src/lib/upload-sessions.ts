import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { MAX_UPLOAD_BYTES, uploadsDir } from "./upload.js";

/**
 * Resumable uploads.
 *
 * A 20MB single-shot POST occupies the connection for 15s or more. If the API
 * goes away underneath it -- deploy, supervisor restart, crash -- the entire
 * upload is lost and the user sees a bare 502. Chunks are short enough that a
 * restart costs one cheap retry instead of the whole file, and `offset` lets a
 * client resume at the exact byte the server already has.
 */

const sessionsDir = path.join(uploadsDir, ".sessions");
const SESSION_TTL_MS = Number(
  process.env.UPLOAD_SESSION_TTL_MS ?? 6 * 60 * 60 * 1000,
);
const UPLOAD_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EXT_RE = /^\.[a-z0-9]{1,5}$/;

export type SessionMeta = {
  ext: string;
  createdAt: number;
  /** Set once the part file has been promoted into uploadsDir. */
  finalizedName?: string;
  /** Set once a record has been created, so a retried finalize is idempotent. */
  recordId?: string;
};

export class UploadSessionError extends Error {
  status: number;
  received?: number;

  constructor(message: string, status = 400, received?: number) {
    super(message);
    this.status = status;
    this.received = received;
  }
}

function assertUploadId(uploadId: string): void {
  if (!UPLOAD_ID_RE.test(uploadId)) {
    // Never interpolate an unvalidated id into a path.
    throw new UploadSessionError("上傳工作階段無效", 400);
  }
}

function partPath(uploadId: string): string {
  return path.join(sessionsDir, `${uploadId}.part`);
}

function metaPath(uploadId: string): string {
  return path.join(sessionsDir, `${uploadId}.json`);
}

function normalizeExt(originalName: string): string {
  const ext = path.extname(String(originalName ?? "")).toLowerCase();
  return EXT_RE.test(ext) ? ext : ".mp4";
}

async function sizeOf(filePath: string): Promise<number> {
  try {
    return (await stat(filePath)).size;
  } catch {
    return 0;
  }
}

export async function readSessionMeta(
  uploadId: string,
): Promise<SessionMeta | null> {
  assertUploadId(uploadId);
  try {
    return JSON.parse(await readFile(metaPath(uploadId), "utf8")) as SessionMeta;
  } catch {
    return null;
  }
}

async function writeSessionMeta(
  uploadId: string,
  meta: SessionMeta,
): Promise<void> {
  await writeFile(metaPath(uploadId), JSON.stringify(meta), "utf8");
}

export async function createUploadSession(
  originalName: string,
): Promise<{ uploadId: string; received: number }> {
  await mkdir(sessionsDir, { recursive: true });
  void sweepStaleSessions();

  const uploadId = randomUUID();
  await writeFile(partPath(uploadId), "");
  await writeSessionMeta(uploadId, {
    ext: normalizeExt(originalName),
    createdAt: Date.now(),
  });
  return { uploadId, received: 0 };
}

/**
 * Append one chunk at `offset`. Idempotent on purpose: a client that never saw
 * our response may resend the same chunk, and a client that lost track can
 * send any earlier offset -- we reply with the authoritative byte count.
 */
export async function appendChunk(
  uploadId: string,
  offset: number,
  body: Readable,
): Promise<{ received: number }> {
  assertUploadId(uploadId);

  const meta = await readSessionMeta(uploadId);
  if (!meta) {
    throw new UploadSessionError("找不到上傳工作階段，請重新上傳", 404);
  }

  const received = await sizeOf(partPath(uploadId));

  if (offset < received) {
    // Duplicate or stale chunk: we already hold these bytes. Drain and ack.
    body.resume();
    return { received };
  }
  if (offset > received) {
    // Gap: the client is ahead of us. Tell it where to resume from.
    body.resume();
    throw new UploadSessionError("上傳位置不符，請由指定位置重試", 409, received);
  }

  await new Promise<void>((resolve, reject) => {
    let written = 0;
    let failed = false;
    const sink = createWriteStream(partPath(uploadId), { flags: "a" });

    const fail = (error: Error) => {
      if (failed) return;
      failed = true;
      body.unpipe(sink);
      sink.destroy();
      reject(error);
    };

    body.on("data", (chunk: Buffer) => {
      written += chunk.length;
      if (received + written > MAX_UPLOAD_BYTES) {
        fail(
          new UploadSessionError(
            `檔案大小不能超過 ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB`,
            400,
          ),
        );
      }
    });
    body.on("error", fail);
    sink.on("error", fail);
    sink.on("finish", () => {
      if (!failed) resolve();
    });

    body.pipe(sink);
  });

  return { received: await sizeOf(partPath(uploadId)) };
}

/**
 * Locate an already-promoted file for this session. The name can differ from
 * meta.finalizedName because transcoding rewrites the extension (.mov -> .mp4),
 * so match on the session id prefix rather than the recorded name.
 */
async function findPromotedFile(
  uploadId: string,
): Promise<{ filePath: string; filename: string; size: number } | null> {
  try {
    for (const entry of await readdir(uploadsDir)) {
      if (!entry.startsWith(`${uploadId}.`)) continue;
      const filePath = path.join(uploadsDir, entry);
      const size = await sizeOf(filePath);
      if (size > 0) return { filePath, filename: entry, size };
    }
  } catch {
    // uploads dir unreadable; fall through to the part-file path
  }
  return null;
}

/**
 * Promote the assembled part file into the uploads dir.
 *
 * Idempotent across the rename. A finalize that died mid-transcode has already
 * moved the part file, so a naive retry saw an empty part and failed with
 * "empty upload" -- losing a fully-uploaded 20MB file. Now a retry finds the
 * promoted file and continues from there.
 */
export async function finalizeSession(uploadId: string): Promise<{
  filePath: string;
  filename: string;
  size: number;
}> {
  assertUploadId(uploadId);

  const meta = await readSessionMeta(uploadId);
  if (!meta) {
    throw new UploadSessionError("找不到上傳工作階段，請重新上傳", 404);
  }

  const promoted = await findPromotedFile(uploadId);
  if (promoted) return promoted;

  const size = await sizeOf(partPath(uploadId));
  if (size <= 0) {
    throw new UploadSessionError("上傳內容為空，請重新上傳", 400);
  }

  const filename = `${uploadId}${meta.ext}`;
  const filePath = path.join(uploadsDir, filename);
  await rename(partPath(uploadId), filePath);
  await writeSessionMeta(uploadId, { ...meta, finalizedName: filename });
  return { filePath, filename, size };
}

const finalizeChain = new Map<string, Promise<unknown>>();

/**
 * Serialize finalize attempts for one upload session.
 *
 * Aborting the client connection does NOT stop the Express handler -- Node runs
 * it to completion. So a client that retries after a dropped response can race
 * the orphaned first handler and create TWO records for one upload (observed in
 * failure-injection testing). Queueing per session means the retry waits, then
 * sees the recordId the first attempt wrote.
 */
export function serializeFinalize<T>(
  uploadId: string,
  run: () => Promise<T>,
): Promise<T> {
  const previous = finalizeChain.get(uploadId);
  const task = (async () => {
    if (previous) await previous.catch(() => undefined);
    return run();
  })();

  const guarded = task.catch(() => undefined);
  finalizeChain.set(uploadId, guarded);
  void guarded.then(() => {
    // Only clear if nobody queued behind us.
    if (finalizeChain.get(uploadId) === guarded) {
      finalizeChain.delete(uploadId);
    }
  });

  return task;
}

export async function markSessionRecord(
  uploadId: string,
  recordId: string,
): Promise<void> {
  const meta = await readSessionMeta(uploadId);
  if (!meta) return;
  await writeSessionMeta(uploadId, { ...meta, recordId });
}

export async function discardSession(uploadId: string): Promise<void> {
  if (!UPLOAD_ID_RE.test(uploadId)) return;
  for (const target of [partPath(uploadId), metaPath(uploadId)]) {
    try {
      await unlink(target);
    } catch {
      // already gone
    }
  }
}

/** Abandoned sessions would otherwise sit on disk forever. */
export async function sweepStaleSessions(): Promise<void> {
  try {
    const entries = await readdir(sessionsDir);
    const cutoff = Date.now() - SESSION_TTL_MS;
    for (const entry of entries) {
      if (!entry.endsWith(".json")) continue;
      const uploadId = entry.slice(0, -".json".length);
      const meta = await readSessionMeta(uploadId);
      if (!meta || meta.createdAt < cutoff) {
        await discardSession(uploadId);
      }
    }
  } catch {
    // sessions dir may not exist yet
  }
}
