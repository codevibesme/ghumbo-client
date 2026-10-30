import type { TripListItem } from "@/features/tours/types";
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
