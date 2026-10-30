import { useSessionStorageJson } from "@/lib/use-session-storage";
import type { SentRequest } from "./types";

/*
 * A guest's request just sent from this tab, handed from the form to the
 * "Request sent" page through sessionStorage. GET /booking-requests/:code is
 * owner-only, so guests can't load it; signed-in travellers go to
 * /my-trips/[code] instead.
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
