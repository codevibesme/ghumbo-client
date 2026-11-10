import type { MetadataRoute } from "next";
import { LEGAL_UPDATED, legalLinks } from "@/config/legal";
import { abs } from "@/config/seo";
import { getCountries, getDestinations } from "@/features/destinations/api";
import { countrySlug } from "@/features/destinations/lib";
import { getAllTrips, getTrip } from "@/features/tours/api";

/*
 * Every indexable page (docs/seo-geo-guidelines.md §2). `lastModified` is only
 * set where we know the real date: Google ignores lastmod once it catches it
 * being wrong. Trip dates come from the trip row; departure and price edits
 * don't move it yet (backend §8.2).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, trips] = await Promise.all([getCountries(), getAllTrips()]);

  const [places, tripPages] = await Promise.all([
    Promise.all(
      countries.map(async (c) => {
        const slug = countrySlug(c);
        const [live, soon] = await Promise.all([getDestinations(slug), getDestinations(slug, "coming_soon")]);
        return { country: c, destinations: [...live, ...soon] };
      }),
    ),
    Promise.all(trips.map((t) => getTrip(t.slug))),
  ]);

  return [
    { url: abs("/"), changeFrequency: "daily", priority: 1 },
    { url: abs("/trips"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/destinations"), changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/how-it-works"), changeFrequency: "monthly", priority: 0.6 },
    ...Object.values(legalLinks).map((l) => ({
      url: abs(l.href),
      lastModified: LEGAL_UPDATED.iso,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...places.flatMap(({ country, destinations }) => [
      { url: abs(`/destinations/${countrySlug(country)}`), changeFrequency: "weekly" as const, priority: 0.7 },
      ...destinations.map((d) => ({
        url: abs(`/destinations/${d.slug}`),
        lastModified: d.updatedAt,
        changeFrequency: "weekly" as const,
        priority: d.status === "live" ? 0.8 : 0.5,
        images: d.assets.slice(0, 1).map((a) => a.url),
      })),
    ]),
    ...tripPages.flatMap((t) =>
      t
        ? [
            {
              url: abs(`/trips/${t.slug}`),
              lastModified: t.updatedAt,
              changeFrequency: "daily" as const,
              priority: 0.9,
              images: t.assets.slice(0, 3).map((a) => a.url),
            },
          ]
        : [],
    ),
  ];
}
