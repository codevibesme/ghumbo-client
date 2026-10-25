import "server-only";
import { cacheLife } from "next/cache";
import { getDestinationById } from "@/features/destinations/api";
import { getDepartures, getTrip } from "./api";
import { toDeparture, tripEndpoints } from "./mappers";

/** Everything the trip, request and sent pages share: trip, place, endpoints and open departures. */
export async function getTripPageData(slug: string) {
  "use cache";
  cacheLife("minutes");
  const trip = await getTrip(slug);
  if (!trip) return null;
  const [place, rawDepartures] = await Promise.all([getDestinationById(trip.destinationId), getDepartures(trip.id)]);
  const ends = tripEndpoints(trip);
  const departures = rawDepartures.map((d) =>
    toDeparture(d, { depart: ends.pickupTime ?? undefined, return: ends.dropTime ?? undefined }),
  );
  return { trip, place, ends, departures, rawDepartures };
}

export type TripPageData = NonNullable<Awaited<ReturnType<typeof getTripPageData>>>;

/** "Darjeeling: Queen of the Hills" → "Darjeeling", for breadcrumbs and short labels. */
export function shortName(name: string) {
  return name.split(/[:,&]/)[0].trim();
}
