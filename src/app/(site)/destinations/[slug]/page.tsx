import { CalendarRange, IndianRupee, Map as MapIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd, breadcrumbLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FactTile } from "@/components/ui/fact-tile";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { buttonClasses } from "@/components/ui/variants";
import { getCountries, getCountry, getDestination, getDestinationById, getDestinations } from "@/features/destinations/api";
import { MountainsDrawing } from "@/features/destinations/components/destination-card";
import { countryHref, countrySlug, dayRange, tripStats } from "@/features/destinations/lib";
import type { Country, Destination } from "@/features/destinations/types";
import { getTripsByDestination } from "@/features/tours/api";
import { TourCard } from "@/features/tours/components/tour-cards";
import { toTourSummaries, tripHref } from "@/features/tours/mappers";
import { formatINR } from "@/lib/format";
import { PlaceCards } from "../_components/place-cards";

/*
 * /destinations/[slug] serves both destinations (B04 West Bengal, B05 coming
 * soon) and countries (B03 India): docs/seo-geo-guidelines.md keeps
 * destinations at /destinations/<slug>, and country names don't collide.
 */

export async function generateStaticParams() {
  const countries = await getCountries();
  const slugs = await Promise.all(
    countries.map(async (c) => [
      countrySlug(c),
      ...(await getDestinations(countrySlug(c))).map((d) => d.slug),
      ...(await getDestinations(countrySlug(c), "coming_soon")).map((d) => d.slug),
    ]),
  );
  return slugs.flat().map((slug) => ({ slug }));
}

async function resolvePlace(slug: string) {
  const destination = await getDestination(slug);
  if (destination) return { kind: "destination" as const, destination, country: (await getDestinationById(destination.id))?.country };
  const country = await getCountry(slug);
  if (country && countrySlug(country) === slug) return { kind: "country" as const, country };
  return null;
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const place = await resolvePlace(slug);
  if (!place) return { title: "Destination not found" };
  if (place.kind === "country") {
    return { title: `${place.country.name} group trips`, alternates: { canonical: `/destinations/${slug}` } };
  }
  const trips = await getTripsByDestination(slug);
  const stats = tripStats(trips);
  return {
    title: `${place.destination.name} group trips${stats.count ? ` · ${stats.count} trips${stats.priceFrom ? ` from ${formatINR(stats.priceFrom)}` : ""}` : ""}`,
    description: place.destination.overview.slice(0, 157).replace(/\s\S*$/, "") + "…",
    alternates: { canonical: `/destinations/${slug}` },
  };
}

export default function PlacePage({ params }: PageProps<"/destinations/[slug]">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-10 pt-8 pb-16">
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <PlaceContent params={params} />
      </Suspense>
    </main>
  );
}

async function PlaceContent({ params }: Pick<PageProps<"/destinations/[slug]">, "params">) {
  const { slug } = await params;
  const place = await resolvePlace(slug);
  if (!place) notFound();
  if (place.kind === "country") return <CountryView country={place.country} />;
  return place.destination.status === "live" ? (
    <DestinationView destination={place.destination} country={place.country} />
  ) : (
    <ComingSoonView destination={place.destination} country={place.country} />
  );
}

/* ------------------------------------------------------------------ */
/* B03 Country                                                         */
/* ------------------------------------------------------------------ */

async function CountryView({ country }: { country: Country }) {
  const [live, soon] = await Promise.all([getDestinations(countrySlug(country)), getDestinations(countrySlug(country), "coming_soon")]);
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Destinations", path: "/destinations" }, { name: country.name, path: countryHref(country) }])} />
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Destinations", href: "/destinations" }, { label: country.name }]} />
        <h1 className="m-0 type-display">{country.name}</h1>
        <p className="m-0 max-w-[60ch] type-body-l">
          We open {country.name} one destination at a time, and only when the stays, drivers and coordinators are ready.
          Here’s what’s on the board now, and what’s next.
        </p>
        <Badge tone="open">
          Live · {live.length} {live.length === 1 ? "destination" : "destinations"}
          {soon.length > 0 && ` + ${soon.length} opening next`}
        </Badge>
      </div>
      <section className="flex flex-col gap-6">
        <SectionHeader kicker="Destinations" title="Where you can go" />
        <PlaceCards live={live} soon={soon} />
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* B04 Destination                                                     */
/* ------------------------------------------------------------------ */

async function DestinationView({ destination, country }: { destination: Destination; country?: Country }) {
  const trips = await getTripsByDestination(destination.slug);
  const stats = tripStats(trips);
  const range = dayRange(stats);
  const tours = toTourSummaries(trips);
  const cover = destination.assets[0];
  const crumbs = [
    { name: "Destinations", path: "/destinations" },
    ...(country ? [{ name: country.name, path: countryHref(country) }] : []),
    { name: destination.name, path: `/destinations/${destination.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: destination.name,
          description: destination.overview,
          image: destination.assets.map((a) => a.url),
          url: `https://ghumbo.com/destinations/${destination.slug}`,
          subjectOf: {
            "@type": "ItemList",
            itemListElement: trips.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `https://ghumbo.com${tripHref(t.slug)}`, name: t.name })),
          },
        }}
      />
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_480px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, ...crumbs.map((c, i) => ({ label: c.name, href: i < crumbs.length - 1 ? c.path : undefined }))]}
            />
            <Badge tone="open">
              Live · {stats.count} {stats.count === 1 ? "trip" : "trips"}
            </Badge>
          </div>
          <h1 className="m-0 type-display">{destination.name}</h1>
          <p className="m-0 max-w-[60ch] type-body-l">{destination.overview}</p>
          <a href="#trips" className={buttonClasses({ className: "self-start" })}>
            See departures
          </a>
        </div>
        {cover && (
          <figure className="m-0 ticket-surface p-3">
            <div className="relative aspect-4/3 overflow-hidden rounded-[4px]">
              <Image src={cover.url} alt={cover.label ?? destination.name} fill priority sizes="480px" className="object-cover" />
            </div>
            {cover.label && <figcaption className="pt-3 type-label text-ink">{cover.label}</figcaption>}
          </figure>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.priceFrom !== null && (
          <FactTile icon={<IndianRupee size={18} aria-hidden />} label="Trips from" value={formatINR(stats.priceFrom)} note="Per person, twin sharing, GST included." />
        )}
        {range && (
          <FactTile icon={<CalendarRange size={18} aria-hidden />} label="Duration" value={range} note={`${stats.count} trips on fixed dates.`} />
        )}
        {country && <FactTile icon={<MapIcon size={18} aria-hidden />} label="Country" value={country.name} />}
      </section>

      <section id="trips" className="flex scroll-mt-24 flex-col gap-6">
        <SectionHeader kicker={`Trips in ${destination.name}`} title="Pick your kind of trip" action={<TextLink href="/trips">All trips →</TextLink>} />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
          {tours.map((t) => (
            <TourCard key={t.href} tour={t} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* B05 Coming soon                                                     */
/* ------------------------------------------------------------------ */

function ComingSoonView({ destination, country }: { destination: Destination; country?: Country }) {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_480px]">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Destinations", href: "/destinations" },
            ...(country ? [{ label: country.name, href: countryHref(country) }] : []),
            { label: destination.name },
          ]}
        />
        <Badge tone="outline">Opening soon</Badge>
        <h1 className="m-0 type-display">{destination.name}</h1>
        <p className="m-0 max-w-[60ch] type-body-l">{destination.overview}</p>
        <p className="m-0 type-body text-muted">Dates aren’t on the board yet. Until then, there’s plenty leaving soon.</p>
        <TextLink href="/trips">Browse live trips →</TextLink>
      </div>
      <div className="ticket-surface aspect-video overflow-hidden">
        <MountainsDrawing />
      </div>
    </section>
  );
}
