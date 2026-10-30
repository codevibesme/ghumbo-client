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

/** "Darjeeling: Queen of the Hills" → "Darjeeling", for breadcrumbs and short labels. */
export function shortName(name: string) {
  return name.split(/[:,&]/)[0].trim();
}

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
    peak: t.nextDeparture.isPeak,
    pick: t.isRecommended,
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

export function toDeparture(d: TripDeparture, times?: { depart?: string; return?: string }): Departure {
  return {
    id: d.id,
    start: formatTicketDate(d.startDate),
    end: formatTicketDate(d.endDate, { year: true }),
    price: Number(d.amount),
    peak: d.isPeak,
    seatsLeft: Math.max(d.capacity - d.bookedSeats, 0),
    totalSeats: d.capacity,
    departTime: times?.depart,
    returnTime: times?.return,
  };
}

/** The start date's year, read off the end ("TUE 29 DEC 2026"); a Dec → Jan trip starts the year before. */
export function startYear(d: Pick<Departure, "start" | "end">) {
  const year = Number(d.end.slice(-4));
  return d.start.endsWith("DEC") && d.end.includes(" JAN ") ? year - 1 : year;
}

/* ------------------------------------------------------------------ */
/* Itinerary-derived facts                                             */
/* ------------------------------------------------------------------ */

const LEG = /\s+to\s+/i;
const MAX_STOPS = 6;

/** "Siliguri to Mirik" → ["Siliguri", "Mirik"]; a plain place → null. */
function leg(location: string | null) {
  if (!location || !LEG.test(location)) return null;
  const [from, to] = location.split(LEG).map((p) => p.trim());
  return from && to ? { from, to } : null;
}

/** A town-like name ("Kurseong"), not a sub-place ("Mall Road, Darjeeling") or a loop ("A - B - C"). */
const isPlace = (l: string | null): l is string => Boolean(l) && !/[,/]| - /.test(l ?? "");

/**
 * Pickup, drop and route stops, read off the itinerary until the backend has
 * explicit hub / stop fields. Nothing is invented: every stop is a location the
 * itinerary names.
 *
 * - Start: day 1's opening transfer ("New Jalpaiguri / Bagdogra", or the origin
 *   of a leg like "Kolkata to Godkhali"). Trips that don't open with a transfer
 *   (city trips) have no start point and no route line.
 * - Stops: the start, then each transfer leg's destination in order, with
 *   en-route stops (an activity timed inside a leg's window, e.g. lunch at
 *   Kurseong on the drive up). The last day is the way back, so it's skipped.
 *   Long treks fall back to the start + overnight locations.
 * - Drop: the last day's closing transfer.
 */
export function tripEndpoints(trip: Trip) {
  const days = trip.itinerary.days;
  const first = days[0];
  const last = days.at(-1);

  const open = first?.activities[0]?.type === "transfer" ? first.activities[0] : undefined;
  const from = open ? (leg(open.location)?.from ?? open.location) : null;

  const close = last?.activities.at(-1)?.type === "transfer" ? last.activities.at(-1) : undefined;
  const dropLocation = close ? (leg(close.location)?.to ?? close.location) : null;

  const outbound = days.length > 1 ? days.slice(0, -1) : days;
  const route: string[] = [];
  for (const day of outbound) {
    for (const a of day.activities) {
      const l = leg(a.location);
      if (!l) continue;
      const enRoute = day.activities.filter(
        (x) => x !== a && isPlace(x.location) && x.start_time && a.start_time && a.end_time
          && x.start_time > a.start_time && x.start_time < a.end_time,
      );
      route.push(...enRoute.map((x) => x.location as string), l.to);
    }
  }
  let stops = from ? [...new Set([from, ...route])] : [];
  if (stops.length > MAX_STOPS && from) {
    const overnights = outbound.map((d) => d.location).filter((l): l is string => Boolean(l) && !leg(l));
    stops = [...new Set([from, ...overnights])];
  }

  return {
    from,
    pickupTime: open?.start_time ?? null,
    dropTime: close?.end_time ?? close?.start_time ?? null,
    dropLocation,
    /** Where the trip goes: the stop the trip is named after, else the last outbound stop. */
    to: stops.find((s) => s === shortName(trip.name)) ?? (stops.length > 1 ? stops.at(-1) : null) ?? shortName(trip.name),
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

/** Every tag label across `trips`, A–Z: the Vibe options. */
export function vibeOptions(trips: TripListItem[]) {
  return [...new Set(trips.flatMap((t) => t.tags.map((tag) => tag.label)))]
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ value: v, label: v }));
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-11" → "November 2026". */
export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
