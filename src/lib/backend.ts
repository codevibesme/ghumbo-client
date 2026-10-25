import "server-only";

/*
 * Server-side fetch wrapper for the public catalog (trips, destinations,
 * departures, reviews), read by Server Components when prerendering.
 * Anything user-specific goes through lib/api.ts from the browser instead.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9358";

/** A non-2xx backend response. */
export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

/** The backend's list envelope (PaginatedResponseDto). */
export type Paginated<T> = {
  data: T[];
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Query = Record<string, string | number | undefined>;

export async function get<T>(path: string, query?: Query): Promise<T> {
  const url = new URL(path, BACKEND_URL);
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new BackendError(res.status, message || res.statusText);
  }
  return (await res.json()) as T;
}

/** GET that maps a 404 to null, for "find by slug" endpoints. */
export async function getOrNull<T>(path: string, query?: Query) {
  try {
    return await get<T>(path, query);
  } catch (err) {
    if (err instanceof BackendError && err.status === 404) return null;
    throw err;
  }
}
