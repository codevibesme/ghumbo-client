import type { Asset } from "@/features/destinations/types";
import { formatTicketDate } from "@/lib/format";
import type {
  Activity,
  BoardRow,
  Departure,
  ItineraryDayData,
  TourSummary,
  Trip,
  TripDeparture,
  TripListItem,
} from "./types";

/*
 * Backend → UI shapes. Anything the design shows that the backend doesn't send
 * yet (peak dates, hub names, highlights, best time…) is derived where it can
 * be and left out where it can't; see the gaps list in the PR description.
 */

export const tripHref = (slug: string) => `/trips/${slug}`;

export function duration(days: number, nights: number) {
  return `${days}D / ${nights}N`;
}

export function imageOf(asset: Asset | null | undefined, fallbackAlt: string) {
  return asset ? { src: asset.url, alt: asset.label ?? fallbackAlt } : null;
}

/** Trips with a bookable date and a price; the rest can't be shown as tickets yet. */
export function isListable(t: TripListItem): t is TripListItem & {
  nextDeparture: NonNullable<TripListItem["nextDeparture"]>;
  startingPrice: NonNullable<TripListItem["startingPrice"]>;
  asset: Asset;
} {
  return Boolean(t.nextDeparture && t.startingPrice && t.asset);
}

export function toTourSummary(t: TripListItem): TourSummary | null {
  if (!isListable(t)) return null;
  return {
    href: tripHref(t.slug),
    title: t.name,
    route: `${t.destination?.name ?? "India"} · ${duration(t.durationDays, t.durationNights)}`,
    image: { src: t.asset.url, alt: t.asset.label ?? t.name },
    nextDeparture: formatTicketDate(t.nextDeparture.startDate),
    seatsLeft: t.nextDeparture.seatsLeft,
    price: t.startingPrice.amount,
  };
}

export function toTourSummaries(trips: TripListItem[]) {
  return trips.map(toTourSummary).filter((t): t is TourSummary => t !== null);
}

export function toBoardRow(t: TripListItem): BoardRow | null {
  if (!isListable(t)) return null;
  return {
    href: tripHref(t.slug),
    date: formatTicketDate(t.nextDeparture.startDate),
    trip: t.name,
    days: `${t.durationDays}D`,
    price: t.startingPrice.amount,
    seatsLeft: t.nextDeparture.seatsLeft,
  };
}

export function toBoardRows(trips: TripListItem[], limit: number) {
  return trips
    .map(toBoardRow)
    .filter((r): r is BoardRow => r !== null)
    .slice(0, limit);
}

function priceOf(d: TripDeparture, type: "adult" | "child") {
  const p = d.prices.find((x) => x.type === type && x.currency === "inr");
  return p ? Number(p.amount) : undefined;
}

export function toDeparture(d: TripDeparture, times?: { depart?: string; return?: string }): Departure {
  return {
    id: d.id,
    start: formatTicketDate(d.startDate),
    end: formatTicketDate(d.endDate, { year: true }),
    price: priceOf(d, "adult") ?? 0,
    childPrice: priceOf(d, "child"),
    seatsLeft: Math.max(d.capacity - d.bookedSeats, 0),
    totalSeats: d.capacity,
    departTime: times?.depart,
    returnTime: times?.return,
  };
}

/* ------------------------------------------------------------------ */
/* Itinerary-derived facts                                             */
/* ------------------------------------------------------------------ */

/** Pickup/drop and stops, read off the itinerary until the backend has explicit hub fields. */
export function tripEndpoints(trip: Trip) {
  const days = trip.itinerary.days;
  const first = days[0];
  const last = days.at(-1);
  const pickup = first?.activities.find((a) => a.type === "transfer") ?? first?.activities[0];
  const drop = last?.activities.findLast((a) => a.type === "transfer") ?? last?.activities.at(-1);
  // Stops for the route line: distinct overnight/day locations in order.
  // Day locations like "Darjeeling to NJP / Bagdogra" are legs, not stops.
  const places = days.map((d) => d.location).filter((l): l is string => Boolean(l) && !/ to /i.test(l ?? ""));
  const stops = [...new Set([pickup?.location, ...places].filter((l): l is string => Boolean(l)))];
  return {
    from: pickup?.location ?? null,
    pickupTime: pickup?.start_time ?? null,
    dropTime: drop?.end_time ?? drop?.start_time ?? null,
    dropLocation: drop?.location ?? null,
    to: first?.location ?? stops[0] ?? null,
    stops,
  };
}

/** Included items carry no tag; meals you buy yourself are PAY DIRECT; other paid extras are ADD-ON. */
export function toActivities(day: ItineraryDayData): Activity[] {
  return day.activities.map((a) => ({
    time: a.start_time ?? "",
    title: a.title,
    note: a.description ?? undefined,
    payDirect: !a.included && a.type === "meal" ? true : undefined,
    addOn: !a.included && a.type !== "meal" ? true : undefined,
  }));
}

const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" } as const;

export function mealsLine(day: ItineraryDayData) {
  return day.meals.length ? day.meals.map((m) => MEAL_LABEL[m]).join(", ") : "None included";
}

/** "2026-11-13" + 2 days → "SUN 15 NOV". */
export function dayDate(startDate: string, offset: number) {
  const d = new Date(`${startDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return formatTicketDate(d);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-11" → "November 2026". */
export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
