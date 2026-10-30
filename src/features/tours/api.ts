import "server-only";
import { cacheLife } from "next/cache";
import { get, getOrNull, type Paginated } from "@/lib/backend";
import type { Trip, TripDeparture, TripListItem, TripReview } from "./types";

const ALL = 50;

/** Live trips in one destination, newest first (backend order). */
export async function getTripsByDestination(slug: string) {
  "use cache";
  cacheLife("minutes");
  const page = await getOrNull<Paginated<TripListItem>>("/trips", { destination: slug, size: ALL });
  return page?.data ?? [];
}

/** Every live trip, soonest departure first. */
export async function getAllTrips() {
  "use cache";
  cacheLife("minutes");
  const page = await get<Paginated<TripListItem>>("/trips", { size: ALL });
  return page.data.sort(bySoonest);
}

/**
 * Live trips matching free text (name, overview, destination, tags) and/or one
 * vibe (an exact, case-sensitive tag label), soonest first.
 */
export async function searchTrips(q?: string, vibe?: string) {
  "use cache";
  cacheLife("minutes");
  const page = await get<Paginated<TripListItem>>("/trips", { q, tags: vibe, size: ALL });
  return page.data.sort(bySoonest);
}

export function bySoonest(a: TripListItem, b: TripListItem) {
  const da = a.nextDeparture?.startDate ?? "9999";
  const db = b.nextDeparture?.startDate ?? "9999";
  return da.localeCompare(db);
}

export async function getTrip(slug: string) {
  "use cache";
  cacheLife("minutes");
  const trip = await getOrNull<Trip>(`/trips/${encodeURIComponent(slug)}`);
  return trip?.status === "live" ? trip : null;
}

/** Open, upcoming departures for a trip, earliest first. */
export async function getDepartures(tripId: string) {
  "use cache";
  cacheLife("minutes");
  const all = await get<TripDeparture[]>(`/departures/trip/${encodeURIComponent(tripId)}`);
  const today = new Date().toISOString().slice(0, 10);
  return all
    .filter((d) => d.status === "open" && d.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getReviews(tripId: string) {
  "use cache";
  cacheLife("minutes");
  return get<Paginated<TripReview>>(`/reviews/trip/${encodeURIComponent(tripId)}`, { size: 10 });
}
