import { FootballAPI } from "hkjc-api";
import { GraphQLClient } from "graphql-request";

const DEFAULT_ENDPOINT = "https://info.cld.hkjc.com/graphql/base/";
const TIMEOUT_MS = Number(process.env.HKJC_TIMEOUT_MS ?? 15_000);

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });
}

export function createFootballAPI(): FootballAPI {
  const endpoint = process.env.HKJC_GRAPHQL_URL ?? DEFAULT_ENDPOINT;
  const graphql = new GraphQLClient(endpoint, { fetch: fetchWithTimeout });
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
