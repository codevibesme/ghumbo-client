import { CalendarDays, MapPin, MessageSquareText, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { breadcrumbLd } from "@/components/seo/breadcrumb-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { destinationHref } from "@/features/destinations/lib";
import { getAllTrips, getReviews, getTripsByDestination } from "@/features/tours/api";
import { DepartureChooser } from "@/features/tours/components/departure-picker";
import { InclusionList } from "@/features/tours/components/inclusion-list";
import { ItineraryDay } from "@/features/tours/components/itinerary-day";
import { RouteLine } from "@/features/tours/components/route-line";
import { TourCard } from "@/features/tours/components/tour-cards";
import { duration, mealsLine, toActivities, toTourSummaries } from "@/features/tours/mappers";
import { type TripPageData, getTripPageData, shortName } from "@/features/tours/trip-data";
import type { Departure, TourSummary, TripReview } from "@/features/tours/types";
import { FEW_SEATS, formatINR, pad2 } from "@/lib/format";

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
    title: `${trip.name} · ${duration(trip.durationDays, trip.durationNights).replace(" ", "")} group trip${from ? ` from ${formatINR(from)}` : ""}`,
    description: trip.overview.slice(0, 157).replace(/\s\S*$/, "") + "…",
    alternates: { canonical: `/trips/${trip.slug}` },
    openGraph: cover ? { images: [{ url: cover.url, alt: cover.label ?? trip.name }] } : undefined,
  };
}

export default function TripPage({ params }: PageProps<"/trips/[slug]">) {
  return (
    <Suspense fallback={<main className="page-container flex-1 py-16" aria-busy="true" />}>
      <TripContent params={params} />
    </Suspense>
  );
}

async function TripContent({ params }: Pick<PageProps<"/trips/[slug]">, "params">) {
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

  const crumbs = [
    { name: "Trips", path: "/trips" },
    ...(destination ? [{ name: destination.name, path: destinationHref(destination) }] : []),
    { name: shortName(trip.name), path: `/trips/${trip.slug}` },
  ];

  return (
    <main className="flex-1 pb-24 md:pb-0">
      <JsonLd data={tripLd(data, reviews.data)} />
      <JsonLd data={breadcrumbLd(crumbs)} />

      <TripHeader data={data} crumbs={crumbs} capacity={capacity} />

      <PhotoGallery photos={photos} alt={trip.name} />

      <section className="page-container flex flex-col gap-5 py-10">
        <SectionHeader kicker="The trip" title={`${trip.durationDays} days in ${shortName(trip.name)}, all planned`} />
        <p className="m-0 max-w-[68ch] type-body-l">{trip.overview}</p>
        {ends.stops.length > 1 && <RouteLine stops={ends.stops} className="max-w-[560px]" />}
      </section>

      <section id="departures" className="page-container flex scroll-mt-24 flex-col gap-6 py-10">
        <SectionHeader
          kicker={`${departures.length} fixed ${departures.length === 1 ? "date" : "dates"} · group of up to ${capacity}`}
          title="Choose a departure"
        />
        {departures.length > 0 ? (
          <>
            <DepartureChooser departures={departures} from={ends.from ?? "Hub"} to={ends.to ?? shortName(trip.name)} requestHref={requestHref} />
            <p className="m-0 font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
              PER PERSON, TWIN SHARING · GST INCLUDED · EACH SQUARE IS ONE SEAT IN A GROUP OF {capacity}
            </p>
          </>
        ) : (
          <EmptyState icon={<CalendarDays size={24} aria-hidden />} title="No open dates right now">
            New departures go up every season. Check back soon or browse other trips.
          </EmptyState>
        )}
      </section>

      <section className="page-container flex flex-col gap-6 py-10">
        <SectionHeader kicker={`Itinerary · ${duration(trip.durationDays, trip.durationNights)}`} title="Day by day" />
        <p className="m-0 max-w-[68ch] type-body text-muted">Everything is included unless it carries a tag.</p>
        <div className="flex flex-col gap-6">
          {trip.itinerary.days.map((day) => (
            <ItineraryDay
              key={day.day}
              day={`Day ${pad2(day.day)}`}
              title={day.title}
              activities={toActivities(day)}
              meals={mealsLine(day)}
              stay={day.accommodation ?? "No stay"}
            />
          ))}
        </div>
      </section>

      {(trip.inclusions.length > 0 || trip.exclusions.length > 0) && (
        <section className="page-container flex flex-col gap-6 py-10">
          <SectionHeader kicker="Included / not included" title="What’s in the ticket" />
          <div className="grid gap-8 md:grid-cols-2">
            <InclusionList title="Included" kind="included" items={trip.inclusions.map((i) => ({ title: i.title, note: i.description }))} />
            <InclusionList title="Not included" kind="excluded" items={trip.exclusions.map((i) => ({ title: i.title, note: i.description }))} />
          </div>
        </section>
      )}

      <MeetingPoint ends={ends} lastDay={trip.durationDays} />

      <Reviews reviews={reviews.data} next={first} />

      <SimilarTrips trips={similar} destinationName={destination?.name} />

      {first && (
        <StickyActionBar
          meta={`${first.start} · ${first.seatsLeft <= FEW_SEATS ? `${pad2(first.seatsLeft)} LEFT` : `${pad2(first.seatsLeft)} OPEN`}`}
          price={formatINR(first.price)}
          href={`${requestHref}?departure=${first.id}`}
        />
      )}
    </main>
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

function PhotoGallery({ photos, alt }: { photos: TripPageData["trip"]["assets"]; alt: string }) {
  if (photos.length === 0) return null;
  return (
    <section className="page-container pb-10">
      <div className="grid gap-3 md:h-[440px] md:grid-cols-4 md:grid-rows-2">
        {photos.slice(0, 5).map((p, i) => (
          <figure
            key={p.url}
            className={
              i === 0
                ? "relative m-0 h-[260px] overflow-hidden rounded-ticket border-[1.5px] border-line md:col-span-2 md:row-span-2 md:h-auto"
                : "relative m-0 hidden overflow-hidden rounded-ticket border-[1.5px] border-line md:block"
            }
          >
            <Image
              src={p.url}
              alt={p.label ?? alt}
              title={p.description ?? undefined}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width: 720px) 600px, 100vw" : "300px"}
              className="object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

function MeetingPoint({ ends, lastDay }: { ends: TripPageData["ends"]; lastDay: number }) {
  if (!ends.from) return null;
  return (
    <section className="page-container flex flex-col gap-6 py-10">
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

function Reviews({ reviews, next }: { reviews: TripReview[]; next: Departure | undefined }) {
  return (
    <section className="page-container flex flex-col gap-6 py-10">
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
    <section className="page-container flex flex-col gap-6 py-10">
      <SectionHeader
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
