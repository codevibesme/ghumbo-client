import { api } from "@/lib/api";
import type { CreateTraveler, Traveler } from "./types";

/*
 * Saved travellers of the signed-in account, from the browser. The backend
 * reads the account from the session; the :userId in the path is not trusted.
 */

export function getMyTravelers(userId: string) {
  return api<Traveler[]>("GET", `/travelers/user/${encodeURIComponent(userId)}`);
}

export function createTraveler(body: CreateTraveler) {
  return api<Traveler>("POST", "/travelers", body);
}

export function deleteTraveler(id: string) {
  return api<unknown>("DELETE", `/travelers/${encodeURIComponent(id)}`);
}
