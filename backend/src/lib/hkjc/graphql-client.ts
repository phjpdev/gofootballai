import { Agent, fetch as undiciFetch } from "undici";
import { FootballAPI } from "hkjc-api";
import { GraphQLClient } from "graphql-request";

const DEFAULT_ENDPOINT = "https://info.cld.hkjc.com/graphql/base/";
const CONNECT_TIMEOUT_MS = Number(process.env.HKJC_CONNECT_TIMEOUT_MS ?? 30_000);
const REQUEST_TIMEOUT_MS = Number(process.env.HKJC_TIMEOUT_MS ?? 45_000);
const MAX_RETRIES = Number(process.env.HKJC_FETCH_RETRIES ?? 3);

const dispatcher = new Agent({
  connect: { timeout: CONNECT_TIMEOUT_MS },
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
