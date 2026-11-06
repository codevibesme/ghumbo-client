import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Kicker } from "@/components/ui/section-header";
import { RequestForm } from "@/features/booking-requests/components/request-form";
import { duration } from "@/features/tours/mappers";
import { getAllTrips } from "@/features/tours/api";
import { getTripPageData, shortName } from "@/features/tours/trip-data";

// Same slugs as the trip page, so the shell (and the header's active nav) prerenders.
export async function generateStaticParams() {
  const trips = await getAllTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export const metadata: Metadata = {
  title: "Request a seat",
  robots: { index: false, follow: false },
};

// Unknown slugs 404 before anything streams (see the trip page); ?departure= is read under Suspense.
export const instant = false;

// B08 Request a seat. ?departure=<id> preselects the date picked on the trip page.
export default async function RequestPage({ params, searchParams }: PageProps<"/trips/[slug]/request">) {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  if (!data) notFound();
  const { trip, ends, departures } = data;
  const cover = trip.assets[0];
  const form = (initialDeparture?: string) => (
    <RequestForm
      tripSlug={trip.slug}
      tripName={trip.name}
      route={[ends.from, duration(trip.durationDays, trip.durationNights)].filter(Boolean).join(" · ")}
      image={cover ? { src: cover.url, alt: cover.label ?? trip.name } : null}
      departures={departures}
      initialDeparture={initialDeparture}
    />
  );

  return (
    <main className="page-container flex flex-1 flex-col gap-4 pt-2 pb-16 md:gap-6 md:pt-8">
      <Breadcrumb
        className="hidden md:flex"
        items={[
          { label: "Trips", href: "/trips" },
          { label: shortName(trip.name), href: `/trips/${trip.slug}` },
          { label: "Request a seat" },
        ]}
      />
      {/* Phone: one back link instead of the trail. */}
      <Link
        href={`/trips/${trip.slug}`}
        className="inline-flex min-h-11 items-center gap-2 self-start font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em] text-link underline decoration-[1.5px] underline-offset-4 md:hidden"
      >
        ← {shortName(trip.name)}
      </Link>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Kicker>Request a seat · no payment now</Kicker>
          <h1 className="m-0 type-h1">Request your seat</h1>
        </div>
        <p className="m-0 max-w-[52ch] type-body-l">
          Tell us who’s coming. We call within 24 hours to confirm. Nothing is paid until we’ve talked.
        </p>
      </div>
      <Suspense fallback={form()}>
        <WithDeparture searchParams={searchParams} render={form} />
      </Suspense>
    </main>
  );
}

async function WithDeparture({
  searchParams,
  render,
}: Pick<PageProps<"/trips/[slug]/request">, "searchParams"> & { render: (departure?: string) => React.ReactNode }) {
  const { departure } = await searchParams;
  return render(typeof departure === "string" ? departure : undefined);
}
