import { lookup as fallbackLookup } from "node:dns";
import { resolve4 } from "node:dns/promises";
import { Agent, fetch as undiciFetch } from "undici";
import { FootballAPI } from "hkjc-api";
import { GraphQLClient } from "graphql-request";

const DEFAULT_ENDPOINT = "https://info.cld.hkjc.com/graphql/base/";
const CONNECT_TIMEOUT_MS = Number(process.env.HKJC_CONNECT_TIMEOUT_MS ?? 30_000);
const REQUEST_TIMEOUT_MS = Number(process.env.HKJC_TIMEOUT_MS ?? 45_000);
const MAX_RETRIES = Number(process.env.HKJC_FETCH_RETRIES ?? 3);

/** curl reaches 23.53.*; Node often tries 139.255.* / 182.23.* first and times out. */
function rankHkjcAddress(ip: string): number {
  if (ip.startsWith("23.53.")) return 0;
  if (ip.startsWith("23.")) return 1;
  return 2;
}

function sortHkjcAddresses(addresses: string[]): string[] {
  return [...addresses].sort(
    (a, b) => rankHkjcAddress(a) - rankHkjcAddress(b),
  );
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
  void resolve4(hostname)
    .then((addresses) => {
      const sorted = sortHkjcAddresses(addresses);
      if (options.all) {
        callback(
          null,
          sorted.map((address) => ({ address, family: 4 })),
        );
        return;
      }
      callback(null, sorted[0], 4);
    })
    .catch((err: NodeJS.ErrnoException) => {
      fallbackLookup(hostname, { family: 4, all: options.all }, callback);
    });
}

const dispatcher = new Agent({
  connect: {
    timeout: CONNECT_TIMEOUT_MS,
    lookup: hkjcLookup,
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
  const endpoint = process.env.HKJC_GRAPHQL_URL ?? DEFAULT_ENDPOINT;
  const graphql = new GraphQLClient(endpoint, {
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
