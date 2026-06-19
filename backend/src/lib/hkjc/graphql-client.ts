import { lookup as fallbackLookup } from "node:dns";
import { resolve4 } from "node:dns/promises";
import { Agent, fetch as undiciFetch } from "undici";
import { FootballAPI } from "hkjc-api";
import { GraphQLClient } from "graphql-request";

const DEFAULT_ENDPOINT = "https://info.cld.hkjc.com/graphql/base/";
const ENDPOINT = process.env.HKJC_GRAPHQL_URL ?? DEFAULT_ENDPOINT;
const HKJC_HOST = new URL(ENDPOINT).hostname;
const PINNED_IP = process.env.HKJC_PINNED_IP ?? "23.53.15.137";
const CONNECT_TIMEOUT_MS = Number(process.env.HKJC_CONNECT_TIMEOUT_MS ?? 30_000);
const REQUEST_TIMEOUT_MS = Number(process.env.HKJC_TIMEOUT_MS ?? 45_000);
const MAX_RETRIES = Number(process.env.HKJC_FETCH_RETRIES ?? 3);

const BLOCKED_PREFIXES = ["139.255.", "182.23."] as const;

function isBlockedHkjcIp(ip: string): boolean {
  return BLOCKED_PREFIXES.some((prefix) => ip.startsWith(prefix));
}

/** curl reaches 23.53.*; Node often tries 139.255.* / 182.23.* first and times out. */
function rankHkjcAddress(ip: string): number {
  if (ip === PINNED_IP) return -1;
  if (ip.startsWith("23.53.")) return 0;
  if (ip.startsWith("23.")) return 1;
  return 2;
}

function sortHkjcAddresses(addresses: string[]): string[] {
  return [...new Set(addresses)].sort(
    (a, b) => rankHkjcAddress(a) - rankHkjcAddress(b),
  );
}

function resolveHkjcAddresses(addresses: string[]): string[] {
  const usable = sortHkjcAddresses(
    addresses.filter((ip) => !isBlockedHkjcIp(ip)),
  );
  if (usable.length > 0) {
    return usable;
  }
  return [PINNED_IP];
}

function isHkjcHost(hostname: string): boolean {
  return hostname === HKJC_HOST || hostname.endsWith(".hkjc.com");
}

function hkjcLookup(
  hostname: string,
  options: { all?: boolean },
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string | { address: string; family: number }[],
    family?: number,
  ) => void,
): void {
  if (isHkjcHost(hostname)) {
    void resolve4(hostname)
      .then((addresses) => {
        const resolved = resolveHkjcAddresses(addresses);
        if (options.all) {
          callback(
            null,
            resolved.map((address) => ({ address, family: 4 })),
          );
          return;
        }
        callback(null, resolved[0], 4);
      })
      .catch(() => {
        const pinned = [PINNED_IP];
        if (options.all) {
          callback(
            null,
            pinned.map((address) => ({ address, family: 4 })),
          );
          return;
        }
        callback(null, pinned[0], 4);
      });
    return;
  }

  fallbackLookup(hostname, { family: 4, all: options.all }, callback);
}

const dispatcher = new Agent({
  connect: {
    timeout: CONNECT_TIMEOUT_MS,
    lookup: hkjcLookup,
    servername: HKJC_HOST,
  },
  headersTimeout: REQUEST_TIMEOUT_MS,
  bodyTimeout: REQUEST_TIMEOUT_MS,
});

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await undiciFetch(
        typeof input === "string" ? input : input.toString(),
        {
          method: init?.method,
          headers: init?.headers as Record<string, string> | undefined,
          body: init?.body as string | undefined,
          dispatcher,
          signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        },
      );
      return response as unknown as Response;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
      }
    }
  }

  throw lastError;
}

export function createFootballAPI(): FootballAPI {
  const graphql = new GraphQLClient(ENDPOINT, {
    fetch: fetchWithRetry as typeof fetch,
  });
  const client = {
    request<T>(
      query: string,
      variables?: Record<string, unknown>,
    ): Promise<T> {
      return graphql.request<T>(query, variables);
    },
  };
  return new FootballAPI(client as ConstructorParameters<typeof FootballAPI>[0]);
}
