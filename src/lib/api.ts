/*
 * Browser fetch wrapper for ghumbo-backend. The backend owns the session: it
 * sets httpOnly cookies (ghumbo_at, ghumbo_rt) on /auth responses, and every
 * call here sends them with `credentials: "include"`. No token ever touches JS.
 *
 * Server Components fetching the public catalog use lib/backend.ts instead.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9358";

/** A non-2xx backend response. `resendAfter` (seconds) comes with OTP 429s. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly resendAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
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

const DEVICE_KEY = "ghumbo_device";

/** Stable per-browser id the backend stores on each session. */
function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function send(method: string, path: string, body?: unknown) {
  const device = deviceId();
  return fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body !== undefined && { "content-type": "application/json" }),
      ...(device && { "x-device-id": device }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// The refresh token is single-use, so concurrent 401s share one refresh.
let refreshing: Promise<unknown> | null = null;

function refreshOnce() {
  refreshing ??= send("POST", "/auth/refresh").finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res = await send(method, path, body);

  // Access cookie expired: refresh, then retry once. Retry even when the
  // refresh lost a race with another tab, whose rotation already updated the
  // shared cookies.
  if (res.status === 401 && !path.startsWith("/auth/")) {
    await refreshOnce().catch(() => {});
    res = await send(method, path, body);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(res.status, message || res.statusText, data?.resendAfter);
  }
  return data as T;
}
