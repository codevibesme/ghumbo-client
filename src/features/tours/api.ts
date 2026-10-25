import "server-only";
import { cacheLife } from "next/cache";
import { getCountries, getDestinations } from "@/features/destinations/api";
import { get, getOrNull, type Paginated } from "@/lib/backend";
import type { Trip, TripDeparture, TripListItem, TripReview } from "./types";

const ALL = 50;

/** Live trips in one destination, newest first (backend order). */
export async function getTripsByDestination(slug: string) {
  "use cache";
  cacheLife("minutes");
  const page = await getOrNull<Paginated<TripListItem>>(`/trips/destination/${encodeURIComponent(slug)}`, { size: ALL });
  return page?.data ?? [];
}

/**
 * Every live trip across every live destination, soonest departure first.
 * The backend has no cross-destination listing yet, so this fans out
 * countries → destinations → trips.
 */
export async function getAllTrips() {
  "use cache";
  cacheLife("minutes");
  const countries = (await getCountries()).filter((c) => c.status === "live");
  const destinations = (await Promise.all(countries.map((c) => getDestinations(c.name.toLowerCase())))).flat();
  const trips = (await Promise.all(destinations.map((d) => getTripsByDestination(d.slug)))).flat();
  return trips.sort(bySoonest);
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
  // The endpoint currently returns open departures for every trip, so filter here too.
  return all
    .filter((d) => d.tripId === tripId && d.status === "open" && d.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getReviews(tripId: string) {
  "use cache";
  cacheLife("minutes");
  return get<Paginated<TripReview>>(`/reviews/trip/${encodeURIComponent(tripId)}`, { size: 10 });
}
