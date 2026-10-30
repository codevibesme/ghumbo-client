import { CalendarDays, MapPin, MessageSquareText, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { breadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { destinationHref } from "@/features/destinations/lib";
import { getAllTrips, getReviews, getTripsByDestination } from "@/features/tours/api";
import {
  DepartureSelectionProvider,
  PeakNote,
  SelectedDeparturePicker,
  SelectedFares,
  SelectedGroupPass,
  SelectedStickyBar,
} from "@/features/tours/components/departure-picker";
import { InclusionList } from "@/features/tours/components/inclusion-list";
import { ItineraryDay, TagLegend } from "@/features/tours/components/itinerary-day";
import { PhotoGallery } from "@/features/tours/components/photo-gallery";
import { RouteLine } from "@/features/tours/components/route-line";
import { TourCard } from "@/features/tours/components/tour-cards";
import { duration, mealsLine, toActivities, toTourSummaries } from "@/features/tours/mappers";
import { type TripPageData, getTripPageData, shortName } from "@/features/tours/trip-data";
import type { Departure, TourSummary, TripReview } from "@/features/tours/types";
import { FEW_SEATS, formatINR, pad2 } from "@/lib/format";

const NUMBER_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export async function generateStaticParams() {
  const trips = await getAllTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/trips/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  if (!data) return { title: "Trip not found" };
  const { trip, departures } = data;
  const from = departures.length ? Math.min(...departures.map((d) => d.price)) : null;
  const cover = trip.assets[0];
  return {
    title: `${trip.name} · ${duration(trip.durationDays, trip.durationNights).replaceAll(" ", "")} group trip${from ? ` from ${formatINR(from)}` : ""}`,
    description: trip.overview.slice(0, 157).replace(/\s\S*$/, "") + "…",
    alternates: { canonical: `/trips/${trip.slug}` },
    openGraph: cover ? { images: [{ url: cover.url, alt: cover.label ?? trip.name }] } : undefined,
  };
}

// notFound() runs before anything streams, so an unknown slug is a real 404 (not a soft 404).
// That means awaiting params outside <Suspense>: every live slug is prerendered by
// generateStaticParams, so only unknown slugs block, and those should block on a 404.
export const instant = false;

export default async function TripPage({ params }: PageProps<"/trips/[slug]">) {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  if (!data) notFound();
  return <TripView data={data} />;
}

async function TripView({ data }: { data: TripPageData }) {
  const { trip, place, ends, departures, rawDepartures } = data;
  const destination = place?.destination;
  const requestHref = `/trips/${trip.slug}/request`;
  const [reviews, siblings] = await Promise.all([
    getReviews(trip.id),
    destination ? getTripsByDestination(destination.slug) : Promise.resolve([]),
  ]);
  const similar = toTourSummaries(siblings.filter((t) => t.id !== trip.id)).slice(0, 3);
  const capacity = rawDepartures[0]?.capacity ?? 18;
  const first = departures.find((d) => d.seatsLeft > 0);
  const photos = trip.assets.filter((a) => a.type === "image");
  const activities = trip.itinerary.days.map(toActivities);
  const tags = { addOn: activities.flat().some((a) => a.addOn), payDirect: activities.flat().some((a) => a.payDirect) };
  const hasInclusions = trip.inclusions.length > 0 || trip.exclusions.length > 0;
  const hasPass = departures.length > 0;
  // Left-column sections the sticky pass runs beside: overview, departures, itinerary, (inclusions), (meeting), reviews.
  const leftSections = 4 + (hasInclusions ? 1 : 0) + (ends.from ? 1 : 0);
  const days = NUMBER_WORDS[trip.durationDays] ?? String(trip.durationDays);

  const crumbs = [
    { name: "Trips", path: "/trips" },
    ...(destination ? [{ name: destination.name, path: destinationHref(destination) }] : []),
    { name: shortName(trip.name), path: `/trips/${trip.slug}` },
  ];

  const left = "min-w-0 min-[960px]:col-start-1";

  return (
    <main className="flex-1 pb-24 md:pb-0">
      <JsonLd data={tripLd(data, reviews.data)} />
      <JsonLd data={breadcrumbLd(crumbs)} />

      <TripHeader data={data} crumbs={crumbs} capacity={capacity} />

      <section aria-label="Photos" className="page-container">
        <PhotoGallery photos={photos} alt={trip.name} />
      </section>

      <DepartureSelectionProvider departures={departures} requestHref={requestHref}>
        <div className="page-container pt-10 md:pt-20">
          <div
            style={{ "--left-rows": leftSections } as CSSProperties}
            className="grid grid-cols-[minmax(0,1fr)] items-start gap-y-14 md:gap-y-20 min-[960px]:grid-cols-[minmax(0,1fr)_380px] min-[960px]:gap-x-12"
          >
            <section aria-labelledby="h-over" className={`${left} flex flex-col gap-6`}>
              <SectionHeader kicker="The trip" title={<span id="h-over">{`${days} days in ${shortName(trip.name)}, all planned`}</span>} />
              <p className="m-0 max-w-[68ch] type-body-l">{trip.overview}</p>
              {ends.stops.length > 1 && (
                <div className="ticket-surface px-5 py-[18px]">
                  <RouteLine stops={ends.stops} />
                </div>
              )}
            </section>

            <section id="departures" aria-labelledby="h-dep" className={`${left} flex scroll-mt-24 flex-col gap-6`}>
              <SectionHeader
                kicker={`${departures.length} fixed ${departures.length === 1 ? "date" : "dates"} · group of up to ${capacity}`}
                title={<span id="h-dep">Choose a departure</span>}
              />
              {hasPass ? (
                <div className="flex flex-col gap-4">
                  <SelectedDeparturePicker label={`Departures for ${shortName(trip.name)}`} />
                  <PeakNote />
                  <SelectedFares className="md:hidden" />
                  <p className="m-0 font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
                    PER PERSON, TWIN SHARING · GST INCLUDED · EACH SQUARE IS ONE SEAT IN A GROUP OF {capacity}
                  </p>
                  <SeatLegend />
                </div>
              ) : (
                <EmptyState icon={<CalendarDays size={24} aria-hidden />} title="No open dates right now">
                  New departures go up every season. Check back soon or browse other trips.
                </EmptyState>
              )}
            </section>

            {hasPass && (
              <div className="hidden w-full max-w-[480px] self-stretch md:block min-[960px]:col-start-2 min-[960px]:row-start-1 min-[960px]:row-end-[span_var(--left-rows)] min-[960px]:max-w-none">
                <div className="flex flex-col gap-4 min-[960px]:sticky min-[960px]:top-6">
                  <SelectedGroupPass from={ends.from ?? shortName(trip.name)} to={ends.to} />
                </div>
              </div>
            )}

            <section aria-labelledby="h-days" className={`${left} flex flex-col gap-6`}>
              <SectionHeader
                kicker={`Itinerary · ${duration(trip.durationDays, trip.durationNights)}`}
                title={<span id="h-days">Day by day</span>}
              />
              <div className="flex flex-col gap-3">
                <p className="m-0 max-w-[68ch] type-body">Everything is included unless it carries a tag.</p>
                <TagLegend addOn={tags.addOn} payDirect={tags.payDirect} />
              </div>
              <div className="flex flex-col gap-6">
                {trip.itinerary.days.map((day, i) => (
                  <ItineraryDay
                    key={day.day}
                    day={`Day ${pad2(day.day)}`}
                    title={day.title}
                    activities={activities[i]}
                    meals={mealsLine(day)}
                    stay={day.accommodation ?? "No stay"}
                  />
                ))}
              </div>
            </section>

            {hasInclusions && (
              <section aria-labelledby="h-incl" className={`${left} flex flex-col gap-6`}>
                <SectionHeader kicker="Included / not included" title={<span id="h-incl">What’s in the ticket</span>} />
                <div className="grid gap-8 md:grid-cols-2">
                  <InclusionList title="Included" kind="included" items={trip.inclusions.map((i) => ({ title: i.title, note: i.description }))} />
                  <InclusionList title="Not included" kind="excluded" items={trip.exclusions.map((i) => ({ title: i.title, note: i.description }))} />
                </div>
              </section>
            )}

            <MeetingPoint ends={ends} lastDay={trip.durationDays} className={left} />

            <Reviews reviews={reviews.data} next={first} className={left} />
          </div>
        </div>

        <SimilarTrips trips={similar} destinationName={destination?.name} />

        {hasPass && <SelectedStickyBar />}
      </DepartureSelectionProvider>
    </main>
  );
}

function SeatLegend() {
  const item = "inline-flex items-center gap-2 text-[13px] leading-none text-muted";
  const sq = "h-3.5 w-2.5 rounded-[3px_3px_1px_1px]";
  return (
    <ul aria-hidden className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
      <li className={item}>
        <span className={`${sq} bg-signal`} /> Open seat
      </li>
      <li className={item}>
        <span className={`${sq} bg-seat-amber`} /> Open, few left
      </li>
      <li className={item}>
        <span className={`${sq} bg-tear`} /> Taken
      </li>
    </ul>
  );
}

function TripHeader({
  data: { trip, ends, place },
  crumbs,
  capacity,
}: {
  data: TripPageData;
  crumbs: { name: string; path: string }[];
  capacity: number;
}) {
  const destination = place?.destination;
  return (
    <section className="page-container flex flex-col gap-4 pt-8 pb-6">
      <Breadcrumb items={crumbs.map((c, i) => ({ label: c.name, href: i < crumbs.length - 1 ? c.path : undefined }))} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="type-label text-red">
          {[ends.from && ends.to ? `${ends.from} → ${ends.to}` : null, destination?.name].filter(Boolean).join(" · ")}
        </span>
        {trip.isRecommended && <Badge tone="pick">Ghumbo pick</Badge>}
      </div>
      <h1 className="m-0 max-w-[20ch] type-h1">{trip.name}</h1>
      <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 type-label text-ink">
        <li className="flex items-center gap-2">
          <CalendarDays size={16} aria-hidden /> {trip.durationDays} days, {trip.durationNights} nights
        </li>
        {ends.from && (
          <li className="flex items-center gap-2">
            <MapPin size={16} aria-hidden /> From {ends.from}
          </li>
        )}
        <li className="flex items-center gap-2">
          <UsersRound size={16} aria-hidden /> Group of up to {capacity}
        </li>
      </ul>
    </section>
  );
}

function MeetingPoint({ ends, lastDay, className }: { ends: TripPageData["ends"]; lastDay: number; className?: string }) {
  if (!ends.from) return null;
  return (
    <section className={`flex flex-col gap-6 ${className}`}>
      <SectionHeader kicker="Meeting point & end point" title="Where we meet" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="ticket-surface flex flex-col gap-2 px-5 py-[18px]">
          <span className="type-stub text-muted">Start · Day 1{ends.pickupTime && ` · pickup ${ends.pickupTime}`}</span>
          <h3 className="m-0 type-h3">{ends.from}</h3>
        </div>
        {ends.dropLocation && (
          <div className="ticket-surface flex flex-col gap-2 px-5 py-[18px]">
            <span className="type-stub text-muted">
              End · Day {lastDay}
              {ends.dropTime && ` · drop ${ends.dropTime}`}
            </span>
            <h3 className="m-0 type-h3">{ends.dropLocation}</h3>
          </div>
        )}
      </div>
    </section>
  );
}

function Reviews({ reviews, next, className }: { reviews: TripReview[]; next: Departure | undefined; className?: string }) {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>
      <SectionHeader kicker="From the group" title="Reviews" />
      {reviews.length > 0 ? (
        <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<MessageSquareText size={24} aria-hidden />}
          title="No reviews yet"
          action={next ? <TextLink href="#departures">See departures</TextLink> : undefined}
        >
          {next
            ? `This trip’s next group leaves ${next.start}. Reviews open when they’re back, and only travellers can write one.`
            : "Reviews open after the first group is back, and only travellers can write one."}
        </EmptyState>
      )}
    </section>
  );
}

function SimilarTrips({ trips, destinationName }: { trips: TourSummary[]; destinationName?: string }) {
  if (trips.length === 0) return null;
  return (
    <section className="page-container flex flex-col gap-6 pt-14 pb-16 md:pt-20 md:pb-24">
      <SectionHeader
        // The canvas says "More from the hills" for its hill trip; siblings here come from the
        // whole destination (hills, coast, city), so the destination name is the honest label.
        kicker={`More from ${destinationName ?? "India"}`}
        title="You might also like"
        action={<TextLink href="/trips">All trips →</TextLink>}
      />
      <div className="grid gap-6 md:grid-cols-3">
        {trips.map((t) => (
          <TourCard key={t.href} tour={t} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: TripReview }) {
  return (
    <li className="ticket-surface flex flex-col gap-3 px-5 py-[18px]">
      <span className="font-mono text-[14px] font-semibold text-red" role="img" aria-label={`${review.rating} out of 5`}>
        {"★".repeat(review.rating)}
        <span className="text-tear">{"★".repeat(5 - review.rating)}</span>
      </span>
      {review.feedback && <p className="m-0 type-body">{review.feedback}</p>}
      <span className="type-stub text-muted">Verified traveller · {new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
    </li>
  );
}

/** TouristTrip + Product with one Offer per open departure (docs/seo-geo-guidelines.md §5). */
function tripLd({ trip, departures, rawDepartures }: TripPageData, reviews: TripReview[]) {
  const rated = reviews.length > 0;
  return {
    "@context": "https://schema.org",
    "@type": ["TouristTrip", "Product"],
    name: trip.name,
    description: trip.overview,
    image: trip.assets.map((a) => a.url),
    url: `https://ghumbo.com/trips/${trip.slug}`,
    itinerary: {
      "@type": "ItemList",
      itemListElement: trip.itinerary.days.map((d) => ({ "@type": "ListItem", position: d.day, name: d.title })),
    },
    offers: departures.map((d, i) => ({
      "@type": "Offer",
      price: d.price,
      priceCurrency: "INR",
      availability:
        d.seatsLeft <= 0
          ? "https://schema.org/SoldOut"
          : d.seatsLeft <= FEW_SEATS
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock",
      availabilityStarts: rawDepartures[i].startDate,
      availabilityEnds: rawDepartures[i].endDate,
      inventoryLevel: { "@type": "QuantitativeValue", value: d.seatsLeft },
      url: `https://ghumbo.com/trips/${trip.slug}`,
    })),
    ...(rated && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  };
}
