import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";
import { getMyRequest, getMyRequests } from "@/features/booking-requests/api";
import type { UserBookingRequest } from "@/features/booking-requests/types";
import { ApiError } from "@/lib/api";

/**
 * Signed-in pages: the user once the session loads, `null` while it loads.
 * Signed-out visitors go to /sign-in and come back to `next`.
 */
export function useSignedInUser(next: string): User | null {
  const { status, user } = useSession();
  if (status === "signed-out") redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}

export type Load<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; notFound: boolean };

const LOADING = { status: "loading" } as const;

function failure(err: unknown): Load<never> {
  return { status: "error", notFound: err instanceof ApiError && err.status === 404 };
}

/** Runs `load` once `enabled`, again on `retry()`. `set` replaces the data (after a withdraw). */
function useLoad<T>(load: () => Promise<T>, enabled: boolean) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ attempt: number; result: Load<T> } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    load().then(
      (data) => live && setState({ attempt, result: { status: "ready", data } }),
      (err) => live && setState({ attempt, result: failure(err) }),
    );
    return () => {
      live = false;
    };
  }, [load, enabled, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const set = useCallback((data: T) => setState({ attempt, result: { status: "ready", data } }), [attempt]);
  const result: Load<T> = state && state.attempt === attempt ? state.result : LOADING;
  return { result, retry, set };
}

/** Every request of the signed-in traveller, all pages. */
async function getAllMyRequests() {
  const all: UserBookingRequest[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await getMyRequests(page);
    all.push(...res.data);
    if (!res.hasNext) break;
  }
  return all;
}

export function useMyRequests(enabled: boolean) {
  return useLoad(getAllMyRequests, enabled);
}

export function useMyRequest(code: string, enabled: boolean) {
  const load = useCallback(() => getMyRequest(code), [code]);
  return useLoad(load, enabled);
}
