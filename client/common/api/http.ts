import axios, { AxiosError, type AxiosInstance, type AxiosHeaders } from 'axios';

import { config } from './config';
import { getCurrentIdToken } from '../firebase/firebase';
import { normalizeError, type GraphQLErrorItem } from './api.errors';


export const httpClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});
httpClient.interceptors.request.use(async (req) => {
  const token = await getCurrentIdToken();
  if (token)
    (req.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);

  return req;
});

if (config.isDev) {
  httpClient.interceptors.request.use((req) => {
    console.log(`[http] → POST ${req.url}`, req.data?.query?.slice(0, 80)?.trim());
    return req;
  });

  httpClient.interceptors.response.use(
    (res) => {
      console.log(`[http] ← ${res.status} ${res.config.url}`);
      return res;
    },
    (err: AxiosError) => {
      console.log(`[http] ← ${err.response?.status ?? 'ERR'} ${err.config?.url}`, err.message);
      return Promise.reject(err);
    }
  );
}

interface GraphQLResponseBody<T> {
  data?: T;
  errors?: GraphQLErrorItem[];
}
interface GraphQLRequestOptions {
  idempotent?: boolean;
  signal?: AbortSignal;
}

async function postGraphQL<TData, TVariables>(
  query: string,
  variables?: TVariables,
  signal?: AbortSignal
) {
  return httpClient.post<GraphQLResponseBody<TData>>(
    '/graphql',
    { query, variables },
    { signal }
  );
}

function isAbortError(err: unknown): boolean {
  return (
    axios.isCancel(err) ||
    (err instanceof Error && err.name === 'AbortError') ||
    (err as any)?.code === 'ERR_CANCELED'
  );
}

/**
 * Executes a GraphQL operation and returns the typed `data` payload.
 * Throws a typed ApiError on any failure — including
 * GraphQL-level errors returned with HTTP 200, which Apollo does by default.
 *
 * Aborted requests (caller's AbortSignal fired — e.g. a screen unmounted
 * mid-fetch) rethrow the original abort rather than wrapping it as a
 * NetworkError, so callers using AbortController can tell the difference
 * between "the user navigated away" and "the network actually failed".
 */
export async function graphqlRequest<TData, TVariables = undefined>(
  query: string,
  variables?: TVariables,
  options: GraphQLRequestOptions = {}
): Promise<TData> {
  const { idempotent = false, signal } = options;
  const maxAttempts = idempotent ? 2 : 1;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await postGraphQL<TData, TVariables>(query, variables, signal);
      if (response.data.errors?.length) {
        throw normalizeError(response.data.errors);
      }
      if (response.data.data === undefined) {
        throw normalizeError(new Error('Empty response from server.'));
      }

      return response.data.data;
    } catch (err) {
      if (isAbortError(err)) throw err;

      lastError = err;
      const apiErr = normalizeError(err);
      const isTransient =
        apiErr.code === 'NETWORK_ERROR' ||
        apiErr.code === 'TIMEOUT' ||
        apiErr.code === 'SERVER_ERROR';
      if (attempt < maxAttempts && isTransient) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, 300 * attempt)
        );
        continue;
      }
      throw apiErr;
    }
  }
  // Unreachable, but keeps TS happy.
  throw normalizeError(lastError);
}

export function gql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings.reduce(
    (acc, str, i) => acc + str + (values[i] !== undefined ? String(values[i]) : ''), ''
  );
}
