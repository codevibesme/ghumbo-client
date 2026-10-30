import { Check, CalendarRange, IndianRupee } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { breadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FactTile } from "@/components/ui/fact-tile";
import { Kicker, SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { buttonClasses } from "@/components/ui/variants";
import { getCountries, getCountry, getDestination, getDestinationById, getDestinations } from "@/features/destinations/api";
import { MountainsDrawing } from "@/features/destinations/components/destination-card";
import { countryHref, countrySlug, dayRange, destinationHref, summary, tripStats } from "@/features/destinations/lib";
import type { Country, Destination } from "@/features/destinations/types";
import { bySoonest, getAllTrips, getTripsByDestination } from "@/features/tours/api";
import { TourCard } from "@/features/tours/components/tour-cards";
import { toTourSummaries, tripHref, vibeOptions } from "@/features/tours/mappers";
import { formatINR } from "@/lib/format";
import { PlaceCards } from "../_components/place-cards";

/*
 * /destinations/[slug] serves both destinations (T04 West Bengal, T05 coming
 * soon) and countries (T03 India): docs/seo-geo-guidelines.md keeps
 * destinations at /destinations/<slug>, and country names don't collide.
 *
 * The slug is resolved outside any <Suspense> so an unknown one calls
 * notFound() before the response starts streaming: a real HTTP 404, not a
 * soft 404. Every read is cached, so listed slugs still prerender.
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
    return {
      title: `${place.country.name} group trips`,
      description: `Where Ghumbo runs fixed-date group trips in ${place.country.name}, and where we open next.`,
      alternates: { canonical: `/destinations/${slug}` },
    };
  }
  const trips = await getTripsByDestination(slug);
  const stats = tripStats(trips);
  return {
    title: `${place.destination.name} group trips${stats.count ? ` · ${stats.count} trips${stats.priceFrom ? ` from ${formatINR(stats.priceFrom)}` : ""}` : ""}`,
    description: place.destination.overview.slice(0, 157).replace(/\s\S*$/, "") + "…",
    alternates: { canonical: `/destinations/${slug}` },
  };
}

export default async function PlacePage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const place = await resolvePlace(slug);
  if (!place) notFound();

  return (
    <main className="page-container flex flex-1 flex-col gap-10 pt-8 pb-16 md:gap-14">
      {place.kind === "country" ? (
        <CountryView country={place.country} />
      ) : place.destination.status === "live" ? (
        <DestinationView destination={place.destination} country={place.country} />
      ) : (
        <ComingSoonView destination={place.destination} country={place.country} />
      )}
    </main>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Season of the earliest departure: trips run autumn to spring, so "2026-11-07" → "2026–27". */
function seasonLabel(dates: string[]) {
  const first = dates.toSorted()[0];
  if (!first) return null;
  const [y, m] = first.split("-").map(Number);
  const start = m >= 7 ? y : y - 1;
  return `${start}–${String(start + 1).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* T03 Country                                                         */
/* ------------------------------------------------------------------ */

async function CountryView({ country }: { country: Country }) {
  const [live, soon] = await Promise.all([getDestinations(countrySlug(country)), getDestinations(countrySlug(country), "coming_soon")]);
  const tripsByPlace = await Promise.all(live.map((d) => getTripsByDestination(d.slug)));
  const counts = tripsByPlace.map((t) => t.length);
  const season = seasonLabel(tripsByPlace.flat().flatMap((t) => (t.nextDeparture ? [t.nextDeparture.startDate] : [])));
  const board = [
    ...live.map((d, i) => ({ d, status: `Live · ${plural(counts[i], "trip")}`, isLive: true })),
    ...soon.map((d) => ({ d, status: "Opening soon", isLive: false })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Destinations", path: "/destinations" }, { name: country.name, path: countryHref(country) }])} />
      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Destinations", href: "/destinations" }, { label: country.name }]} />
          <h1 className="m-0 type-h1">{country.name}</h1>
          <p className="m-0 max-w-[60ch] type-body-l">
            We open {country.name} one destination at a time, and only when the stays, drivers and coordinators are ready.
            Here’s what’s on the board now, and what’s next.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Badge tone="open">Live · {plural(live.length, "destination")}</Badge>
            {soon.length > 0 && <span className="type-label text-muted">+ {soon.length} opening next</span>}
          </div>
        </div>
        {board.length > 0 && (
          <section aria-label={`Departure board: every ${country.name} destination and its status`} className="ticket-surface flex flex-col lg:mt-10">
            <div className="flex justify-between gap-3 px-6 pt-5 type-stub text-muted">
              <span>Departure board · {country.name}</span>
              {season && <span>{season}</span>}
            </div>
            <ul className="m-0 flex list-none flex-col px-6 pt-2 pb-3">
              {board.map(({ d, status, isLive }) => (
                <li key={d.id} className="flex items-center justify-between gap-3 border-b-2 border-dashed border-tear py-3.5">
                  {isLive ? (
                    <Link
                      href={destinationHref(d)}
                      className="text-[18px] font-bold leading-[1.3] text-ink no-underline [font-stretch:110%] hover:text-red hover:underline"
                    >
                      {d.name}
                    </Link>
                  ) : (
                    <span className="text-[18px] font-bold leading-[1.3] [font-stretch:110%]">{d.name}</span>
                  )}
                  <Badge tone={isLive ? "open" : "outline"}>{status}</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
      <section className="flex flex-col gap-6">
        <SectionHeader kicker="Destinations" title="Where you can go" />
        <PlaceCards live={live} soon={soon} />
      </section>
      {/* The design's "hear when it goes live" button needs a waitlist endpoint, so the block points at the live board instead. */}
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-ticket border-2 border-dashed border-tear px-4 py-6 md:p-10">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
          <Kicker>Next up</Kicker>
          <h2 className="m-0 type-h2">More destinations every season</h2>
          <p className="m-0 max-w-[68ch] type-body text-muted">
            We open a destination only when the stays, drivers and coordinators are ready. Until the next one goes live,
            every trip you can take now is on the board.
          </p>
        </div>
        <TextLink href="/trips">All trips →</TextLink>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* T04 Destination                                                     */
/* ------------------------------------------------------------------ */

async function DestinationView({ destination, country }: { destination: Destination; country?: Country }) {
  const trips = (await getTripsByDestination(destination.slug)).toSorted(bySoonest);
  const stats = tripStats(trips);
  const range = dayRange(stats);
  const tours = toTourSummaries(trips);
  const vibes = vibeOptions(trips);
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
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_540px]">
        <div className="flex flex-col gap-3">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, ...crumbs.map((c, i) => ({ label: c.name, href: i < crumbs.length - 1 ? c.path : undefined }))]}
          />
          <Badge tone="open" className="mt-2">
            Live · {plural(stats.count, "trip")}
          </Badge>
          <h1 className="m-0 type-h1">{destination.name}</h1>
          <p className="m-0 max-w-[52ch] type-body-l">{summary(destination.overview)}</p>
          <a href="#trips" className={buttonClasses({ variant: "secondary", size: "m", className: "mt-3 self-start" })}>
            See departures
          </a>
        </div>
        {cover && (
          <figure className="m-0 ticket-surface p-3">
            <div className="relative aspect-[4/2.6] overflow-hidden rounded-[4px]">
              <Image
                src={cover.url}
                alt={cover.label ?? destination.name}
                fill
                priority
                sizes="(min-width: 1024px) 540px, 100vw"
                className="object-cover"
              />
            </div>
            {cover.label && <figcaption className="pt-3 type-stub text-ink">{cover.label}</figcaption>}
          </figure>
        )}
      </section>

      {(stats.priceFrom !== null || range) && (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.priceFrom !== null && (
            <FactTile
              icon={<IndianRupee size={18} aria-hidden />}
              label="Trips from"
              value={formatINR(stats.priceFrom)}
              note="Per person, twin sharing, GST included."
            />
          )}
          {range && (
            <FactTile icon={<CalendarRange size={18} aria-hidden />} label="Duration" value={range} note={`${plural(stats.count, "trip")} on fixed dates.`} />
          )}
        </section>
      )}

      <section id="trips" className="flex scroll-mt-24 flex-col gap-6">
        <SectionHeader
          kicker={`Trips in ${destination.name}`}
          title="Pick your kind of trip"
          action={<span className="type-label text-muted">{plural(tours.length, "trip")} · soonest first</span>}
        />
        {vibes.length > 0 && (
          <div role="group" aria-label="Browse by vibe" className="flex flex-wrap gap-2">
            {vibes.map((v) => (
              <Link
                key={v.value}
                href={`/trips?${new URLSearchParams({ destination: destination.slug, vibe: v.value })}`}
                className="inline-flex h-11 items-center whitespace-nowrap rounded-chip border-[1.5px] border-line bg-card px-3.5 font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-ink no-underline hover:bg-stock md:h-10"
              >
                {v.label} · {trips.filter((t) => t.tags.some((tag) => tag.label === v.value)).length}
              </Link>
            ))}
          </div>
        )}
        <hr className="m-0 border-0 border-t-2 border-dashed border-tear" />
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
/* T05 Coming soon                                                     */
/* ------------------------------------------------------------------ */

const DECIDED = [
  { title: "Fixed dates and a coordinator", body: "Same deal as every Ghumbo trip: pick a departure, request a seat, we call you." },
  { title: "Stays, transfers and permits sorted", body: "Homestays, jeeps and the permit paperwork, handled for you." },
];

/*
 * Destinations carry no opening date, photos or waitlist endpoint, so the
 * badge says "Opening soon", the hero shows the line drawing and the design's
 * Waitlist Pass form is left out. Related trips are live ones from the same
 * country, Ghumbo picks first.
 */
async function ComingSoonView({ destination, country }: { destination: Destination; country?: Country }) {
  const neighbours = country ? (await getDestinations(countrySlug(country))).map((d) => d.slug) : [];
  const all = await getAllTrips();
  const related = toTourSummaries(
    all
      .filter((t) => !neighbours.length || (t.destination !== null && neighbours.includes(t.destination.slug)))
      .toSorted((a, b) => Number(Boolean(b.isRecommended)) - Number(Boolean(a.isRecommended))),
  ).slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Destinations", path: "/destinations" },
          ...(country ? [{ name: country.name, path: countryHref(country) }] : []),
          { name: destination.name, path: `/destinations/${destination.slug}` },
        ])}
      />
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_552px]">
        <div className="flex flex-col gap-3">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Destinations", href: "/destinations" },
              ...(country ? [{ label: country.name, href: countryHref(country) }] : []),
              { label: destination.name },
            ]}
          />
          <Badge tone="outline" className="mt-2">
            Opening soon
          </Badge>
          <h1 className="m-0 type-h1">{destination.name}</h1>
          <p className="m-0 max-w-[52ch] type-body-l">{summary(destination.overview, 3)}</p>
          <p className="m-0 type-body text-muted">Dates aren’t on the board yet.</p>
        </div>
        <figure className="m-0 ticket-surface p-3">
          <div className="aspect-video overflow-hidden rounded-[4px]">
            <MountainsDrawing />
          </div>
          <figcaption className="flex justify-between gap-2 pt-3 type-stub text-ink">
            <span>{destination.name}</span>
            <span>Photos soon</span>
          </figcaption>
        </figure>
      </section>

      <section className="flex max-w-[760px] flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Kicker>What to expect</Kicker>
          <h2 className="m-0 type-h2">What we know so far</h2>
          <p className="m-0 type-body text-muted">Some details are still being planned. We fill in the rest when dates open.</p>
        </div>
        <div className="ticket-surface flex flex-col gap-4 p-5">
          <h3 className="m-0 type-h3">Already decided</h3>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {DECIDED.map((d) => (
              <li key={d.title} className="flex gap-3">
                <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-green" />
                <span className="flex flex-col gap-1">
                  <span className="type-body font-semibold">{d.title}</span>
                  <span className="type-small text-muted">{d.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeader kicker="Live now" title="Can’t wait? These are open" action={<TextLink href="/trips">All trips →</TextLink>} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
            {related.map((t) => (
              <TourCard key={t.href} tour={t} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
