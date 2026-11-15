import type { TripHub, TripListItem } from "@/features/tours/types";
import type { Country, Destination } from "./types";

/** "India" → "india". Country URLs use the lower-cased name, which the backend matches. */
export const countrySlug = (country: Pick<Country, "name">) => country.name.toLowerCase();

export const countryHref = (country: Pick<Country, "name">) => `/destinations/${countrySlug(country)}`;

/** Destinations and countries share /destinations/[slug] (see docs/seo-geo-guidelines.md §2). */
export const destinationHref = (destination: Pick<Destination, "slug">) => `/destinations/${destination.slug}`;

/** First sentence of an overview, for card blurbs. */
export function firstSentence(text: string) {
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0] : text;
}

/** Trip count, cheapest price and day range across a destination's trips. */
export function tripStats(trips: TripListItem[]) {
  const prices = trips.flatMap((t) => (t.startingPrice ? [t.startingPrice.amount] : []));
  const days = trips.map((t) => t.durationDays);
  return {
    count: trips.length,
    priceFrom: prices.length ? Math.min(...prices) : null,
    minDays: days.length ? Math.min(...days) : null,
    maxDays: days.length ? Math.max(...days) : null,
  };
}

/** Every pickup hub across a destination's trips, most-used first. */
export function destinationHubs(trips: TripListItem[]) {
  const seen = new Map<string, { hub: TripHub; trips: number }>();
  for (const t of trips) {
    for (const hub of t.sourceHubs ?? []) {
      const key = hub.code || hub.name;
      const entry = seen.get(key);
      if (entry) entry.trips += 1;
      else seen.set(key, { hub, trips: 1 });
    }
  }
  // Cities with more trips first (Kolkata before Siliguri), as on the Getting there cards.
  const cityRank = new Map(hubGroups(trips).map((g, i) => [g.city, i]));
  return [...seen.values()]
    .sort((a, b) => (cityRank.get(a.hub.city) ?? 0) - (cityRank.get(b.hub.city) ?? 0) || b.trips - a.trips)
    .map((e) => e.hub);
}

/** "Kolkata · Siliguri": the hub cities, for the hubs fact on destination cards and tiles. */
export function hubsLabel(hubs: TripHub[], max = 3) {
  return [...new Set(hubs.map((h) => h.city || h.name))].slice(0, max).join(" · ");
}

/** "Howrah Jn" → "Howrah", for the station names on hub cards. */
const shortHubName = (name: string) => name.replace(/\s+(Jn|Junction|Station)$/i, "");

export type HubGroup = {
  city: string;
  trips: TripListItem[];
  airports: string[];
  stations: string[];
  jetties: string[];
  busStands: string[];
};

/** Pickup hubs grouped by city (T04 "Getting there"), the city with the most trips first. */
export function hubGroups(trips: TripListItem[]): HubGroup[] {
  const groups = new Map<string, HubGroup>();
  for (const t of trips) {
    for (const hub of t.sourceHubs ?? []) {
      const city = hub.city || hub.name;
      const g = groups.get(city) ?? { city, trips: [], airports: [], stations: [], jetties: [], busStands: [] };
      if (!g.trips.includes(t)) g.trips.push(t);
      const list = { airport: g.airports, station: g.stations, port: g.jetties, bus_stand: g.busStands }[hub.type];
      const label = hub.type === "airport" ? hub.code || hub.name : shortHubName(hub.name);
      if (!list.includes(label)) list.push(label);
      groups.set(city, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.trips.length - a.trips.length);
}

const listJoin = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

/** "Airports CCU and IXB; Howrah, Sealdah and NJP stations.": the note under the hubs tile. */
export function hubsNote(hubs: TripHub[], max = 3) {
  // Short names, the busiest few first: "Howrah, Sealdah and 3 more stations", as the design's one-line note.
  const names = (type: TripHub["type"]) => {
    const all = [...new Set(hubs.filter((h) => h.type === type).map((h) => shortHubName(h.name)))];
    return all.length > max ? [...all.slice(0, max - 1), `${all.length - max + 1} more`] : all;
  };
  const airports = hubs.filter((h) => h.type === "airport").map((h) => h.code || h.name);
  const stations = names("station");
  const ports = names("port");
  const buses = names("bus_stand");
  const parts = [
    airports.length ? `${airports.length === 1 ? "Airport" : "Airports"} ${listJoin(airports)}` : null,
    stations.length ? `${listJoin(stations)} ${stations.length === 1 ? "station" : "stations"}` : null,
    ports.length ? `${listJoin(ports)} ${ports.length === 1 ? "jetty" : "jetties"}` : null,
    buses.length ? `${listJoin(buses)} ${buses.length === 1 ? "bus stand" : "bus stands"}` : null,
  ].filter(Boolean);
  return parts.length ? `${parts.join("; ")}.` : null;
}

/**
 * The note under "Best time": trips whose season differs from the destination's, by
 * their most common tag. "Hills Oct–May; Wildlife Oct–Apr." Null when every trip agrees.
 */
export function bestTimeNote(destinationBest: string, trips: TripListItem[], max = 2) {
  const byRange = new Map<string, TripListItem[]>();
  for (const t of trips) {
    if (!t.bestTime || t.bestTime === destinationBest) continue;
    byRange.set(t.bestTime, [...(byRange.get(t.bestTime) ?? []), t]);
  }
  const parts = [...byRange.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, max)
    .map(([range, group]) => {
      const counts = new Map<string, number>();
      for (const t of group) for (const tag of t.tags) counts.set(tag.label, (counts.get(tag.label) ?? 0) + 1);
      const label = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      return `${label ?? (group.length === 1 ? shortTripName(group[0].name) : "Some trips")} ${range}`;
    });
  return parts.length ? `${parts.join("; ")}.` : null;
}

const shortTripName = (name: string) => name.split(/[:,&]/)[0].trim();

/** "3–6 days" / "4 days" / null. */
export function dayRange(stats: { minDays: number | null; maxDays: number | null }) {
  if (stats.minDays === null || stats.maxDays === null) return null;
  return stats.minDays === stats.maxDays ? `${stats.minDays} days` : `${stats.minDays}–${stats.maxDays} days`;
}

/**
 * Short intro for a place hero: the first paragraph, cut to its first
 * `sentences` sentences. The full overview stays in JSON-LD and meta.
 */
export function summary(text: string, sentences = 2) {
  const para = text.split(/\n\s*\n/)[0].trim();
  const parts = para.match(/[^.!?]+[.!?]+(?=\s|$)/g);
  return parts ? parts.slice(0, sentences).join("").trim() : para;
}

/** Destination card facts, as on T01/T03: best time and trip length side by side, hubs full width. */
export function placeFacts(bestTime: string, range: string | null, hubs: string) {
  return [
    ...(bestTime ? [{ label: "Best time", value: bestTime }] : []),
    ...(range ? [{ label: "Trips", value: range }] : []),
    ...(hubs ? [{ label: "Hubs", value: hubs, wide: true }] : []),
  ];
}
