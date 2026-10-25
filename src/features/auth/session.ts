import { useEffect, useSyncExternalStore } from "react";
import { ApiError } from "@/lib/api";
import { useSessionStorageJson } from "@/lib/use-session-storage";
import { getMe } from "./api";
import { safeNext } from "./lib";
import type { PendingChallenge, Session, User } from "./types";

/*
 * The signed-in user, shared by every component through one store. Loaded
 * once per page load from GET /users/me (which refreshes on 401 itself).
 *
 * The session cookies are httpOnly, so JS can't tell whether they exist. A
 * localStorage hint, set on sign-in and cleared on sign-out or a 401, lets
 * signed-out visitors skip the /users/me round trip entirely.
 */

const HINT_KEY = "ghumbo_signed_in";

const LOADING: Session = { status: "loading", user: null };
const SIGNED_OUT: Session = { status: "signed-out", user: null };

let session: Session = LOADING;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(next: Session) {
  session = next;
  for (const l of listeners) l();
}

function setHint(on: boolean) {
  try {
    if (on) localStorage.setItem(HINT_KEY, "1");
    else localStorage.removeItem(HINT_KEY);
  } catch {}
}

function hasHint() {
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return true;
  }
}

/** Fetch the user (again). Call after the backend has set new session cookies. */
export function loadUser() {
  loading ??= getMe()
    .then((user) => {
      setHint(true);
      emit({ status: "signed-in", user });
    })
    .catch((err) => {
      // A network error or 5xx isn't proof of being signed out; only a 401 clears the hint.
      if (err instanceof ApiError && err.status === 401) setHint(false);
      emit(SIGNED_OUT);
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export function markSignedOut() {
  setHint(false);
  emit(SIGNED_OUT);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useSession(): Session {
  const current = useSyncExternalStore(
    subscribe,
    () => session,
    () => LOADING,
  );

  useEffect(() => {
    if (session.status !== "loading" || loading) return;
    if (hasHint()) loadUser();
    else emit(SIGNED_OUT);
  }, []);

  return current;
}

/** Profile photo (Google's, for Google sign-ups), smallest version first. */
export function photoUrl(user: User) {
  return user.photo?.thumbnail_url || user.photo?.url || null;
}

export function initials(user: User) {
  const parts = user.name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Sign-in hand-offs (sessionStorage: this tab, until it closes)       */
/* ------------------------------------------------------------------ */

const CHALLENGE_KEY = "ghumbo_otp";
const NEXT_KEY = "ghumbo_next";

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {}
}

/** The pending OTP challenge: `undefined` until hydrated, `null` if there's none. */
export const useChallenge = () => useSessionStorageJson<PendingChallenge>(CHALLENGE_KEY);
export const setChallenge = (c: PendingChallenge) => write(CHALLENGE_KEY, JSON.stringify(c));
export const clearChallenge = () => write(CHALLENGE_KEY, null);

/** Where Google sign-in returns to: the OAuth round trip can't carry it. */
export const setNextAfterGoogle = (next: string) => write(NEXT_KEY, JSON.stringify(next));
export function takeNextAfterGoogle() {
  const next = safeNext(readJson<string>(NEXT_KEY));
  write(NEXT_KEY, null);
  return next;
}
