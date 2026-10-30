import "server-only";
import { cacheLife } from "next/cache";
import { get, getOrNull, type Paginated } from "@/lib/backend";
import type { Country, Destination, PlaceStatus } from "./types";

/*
 * Public catalog reads. Cached for minutes: places change rarely, and every
 * page that lists them is prerendered.
 */

/** The backend caps page size at 50; we have far fewer places than that. */
const ALL = 50;

export async function getCountries() {
  "use cache";
  cacheLife("minutes");
  return (await get<Paginated<Country>>("/countries", { size: ALL })).data;
}

/** By lower-case URL name ("india"); the backend matches case-insensitively. */
export async function getCountry(name: string) {
  "use cache";
  cacheLife("minutes");
  return getOrNull<Country>(`/countries/${encodeURIComponent(name)}`);
}

/** Live destinations by default; pass "coming_soon" for the waitlist ones. */
export async function getDestinations(countryName: string, status: PlaceStatus = "live") {
  "use cache";
  cacheLife("minutes");
  const page = await getOrNull<Paginated<Destination>>("/destinations", { country: countryName, size: ALL, status });
  return page?.data ?? [];
}

export async function getDestination(slug: string) {
  "use cache";
  cacheLife("minutes");
  return getOrNull<Destination>(`/destinations/${encodeURIComponent(slug)}`);
}

/** The backend has no lookup by id; trips only carry `destinationId`, so scan live places. */
export async function getDestinationById(id: number) {
  "use cache";
  cacheLife("minutes");
  for (const country of await getCountries()) {
    const destinations = [
      ...(await getDestinations(country.name.toLowerCase())),
      ...(await getDestinations(country.name.toLowerCase(), "coming_soon")),
    ];
    const destination = destinations.find((d) => d.id === id);
    if (destination) return { country, destination };
  }
  return null;
}
