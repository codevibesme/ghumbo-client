import { useSessionStorageJson } from "@/lib/use-session-storage";
import type { SentRequest } from "./types";

/*
 * The request just sent from this tab, handed from the form to the "Request
 * sent" page through sessionStorage (the backend has no GET by code yet).
 */

const SENT_KEY = "ghumbo_req";

export function saveSentRequest(sent: SentRequest) {
  try {
    sessionStorage.setItem(SENT_KEY, JSON.stringify(sent));
  } catch {}
}

/** `undefined` until hydrated, then the request for `tripSlug` or `null`. */
export function useSentRequest(tripSlug: string): SentRequest | null | undefined {
  const sent = useSessionStorageJson<SentRequest>(SENT_KEY);
  if (sent === undefined) return undefined;
  return sent?.tripSlug === tripSlug ? sent : null;
}
