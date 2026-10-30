import type { Metadata } from "next";
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
    <main className="page-container flex flex-1 flex-col gap-8 pt-8 pb-16">
      <div className="flex flex-col gap-3">
        <Breadcrumb
          items={[
            { label: "Trips", href: "/trips" },
            { label: shortName(trip.name), href: `/trips/${trip.slug}` },
            { label: "Request a seat" },
          ]}
        />
        <Kicker>Request a seat · no payment now</Kicker>
        <h1 className="m-0 type-h1">Request your seat</h1>
        <p className="m-0 max-w-[56ch] type-body-l text-muted">
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
