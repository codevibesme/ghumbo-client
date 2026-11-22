import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ApiError } from "@/lib/api";
import { getAllMyBookings, getMyBooking } from "./api";
import type { UserBooking } from "./types";

/* ------------------------------------------------------------------ */
/* A ticking clock, shared by every timer on the page                   */
/* ------------------------------------------------------------------ */

let now = 0;
const tickers = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | null = null;

function subscribeClock(onTick: () => void) {
  tickers.add(onTick);
  if (!interval) {
    now = Date.now();
    interval = setInterval(() => {
      now = Date.now();
      for (const t of tickers) t();
    }, 1000);
  }
  return () => {
    tickers.delete(onTick);
    if (!tickers.size && interval) {
      clearInterval(interval);
      interval = null;
    }
  };
}

/** Epoch ms, updated every second; `null` while prerendering/hydrating. */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribeClock,
    () => now || Date.now(),
    () => null,
  );
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

export type BookingLoad<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; notFound: boolean };

function failure(err: unknown): BookingLoad<never> {
  return { status: "error", notFound: err instanceof ApiError && (err.status === 404 || err.status === 403) };
}

export function useMyBookings(enabled: boolean) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ attempt: number; result: BookingLoad<UserBooking[]> } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    getAllMyBookings().then(
      (data) => live && setState({ attempt, result: { status: "ready", data } }),
      (err) => live && setState({ attempt, result: failure(err) }),
    );
    return () => {
      live = false;
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  // A refresh keeps showing the last list instead of a skeleton, so cards (and any message on them) stay put.
  const result: BookingLoad<UserBooking[]> =
    state && (state.attempt === attempt || state.result.status === "ready") ? state.result : { status: "loading" };
  return { result, retry };
}

/**
 * One booking, polled while it's unpaid: every `pollMs` until it's confirmed
 * or expired. The webhook is what confirms a booking, so the page waits for it
 * here rather than trusting the redirect.
 */
export function useMyBooking(id: string, enabled: boolean, pollMs: number) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ attempt: number; result: BookingLoad<UserBooking> } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    // Stops polling once the booking is settled, or the backend says it isn't ours.
    let done = false;
    let inFlight = false;
    const load = () => {
      if (done || inFlight) return;
      inFlight = true;
      getMyBooking(id)
        .then(
          (data) => {
            if (!live) return;
            if (data.status !== "pending") done = true;
            setState({ attempt, result: { status: "ready", data } });
          },
          (err) => {
            if (!live) return;
            if (err instanceof ApiError && err.status < 500) done = true;
            // A blip mid-poll keeps the last good copy and tries again on the next tick.
            setState((prev) =>
              prev?.attempt === attempt && prev.result.status === "ready" ? prev : { attempt, result: failure(err) },
            );
          },
        )
        .finally(() => {
          inFlight = false;
        });
    };
    load();
    const interval = setInterval(load, pollMs);
    return () => {
      live = false;
      clearInterval(interval);
    };
  }, [id, enabled, pollMs, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const result: BookingLoad<UserBooking> = state && state.attempt === attempt ? state.result : { status: "loading" };
  return { result, retry };
}
