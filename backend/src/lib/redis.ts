import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;
let redisDisabled = false;

const CACHE_TTL_SECONDS = 3600;
const CONNECT_TIMEOUT_MS = 2000;

function normalizeRedisUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost") {
      parsed.hostname = "127.0.0.1";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export async function getRedis(): Promise<RedisClientType | null> {
  const url = process.env.REDIS_URL;
  if (!url || redisDisabled) return null;

  if (client?.isOpen) return client;

  if (!connecting) {
    connecting = (async () => {
      const next = createClient({
        url: normalizeRedisUrl(url),
        socket: {
          connectTimeout: CONNECT_TIMEOUT_MS,
          reconnectStrategy: false,
        },
      });

      // node-redis emits 'error' as an EventEmitter event, not a rejection. With no
      // listener, Node escalates it to an uncaught exception and the process dies --
      // this is the "Socket closed unexpectedly" crash seen in production. The
      // .catch() below only covers connect(); it cannot catch a later socket error.
      next.on("error", (error: unknown) => {
        redisDisabled = true;
        client = null;
        connecting = null;
        console.warn(
          "Redis error -- continuing without cache:",
          error instanceof Error ? error.message : error,
        );
      });

      await next.connect();
      client = next;
      return next;
    })()
      .catch((error) => {
        redisDisabled = true;
        connecting = null;
        client = null;
        console.warn(
          "Redis unavailable — continuing without cache:",
          error instanceof Error ? error.message : error,
        );
        return null;
      })
      .finally(() => {
        if (!client) connecting = null;
      });
  }

  return connecting;
}

export function analysisCacheKey(
  matchId: string,
  promptVersion: string,
): string {
  return `analysis:${matchId}:${promptVersion}`;
}

export async function getCachedAnalysis<T>(
  matchId: string,
  promptVersion: string,
): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;

  try {
    const raw = await redis.get(analysisCacheKey(matchId, promptVersion));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedAnalysis(
  matchId: string,
  promptVersion: string,
  value: unknown,
): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    await redis.set(
      analysisCacheKey(matchId, promptVersion),
      JSON.stringify(value),
      { EX: CACHE_TTL_SECONDS },
    );
  } catch {
    // cache write is best-effort
  }
}

export async function invalidateCachedAnalysis(
  matchId: string,
  promptVersion: string,
): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;

  try {
    await redis.del(analysisCacheKey(matchId, promptVersion));
  } catch {
    // cache invalidation is best-effort
  }
}
