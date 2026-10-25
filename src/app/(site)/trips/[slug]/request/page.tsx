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

// B08 Request a seat. ?departure=<id> preselects the date picked on the trip page.
export default function RequestPage({ params, searchParams }: PageProps<"/trips/[slug]/request">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-8 pt-8 pb-16">
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <RequestContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function RequestContent({ params, searchParams }: Pick<PageProps<"/trips/[slug]/request">, "params" | "searchParams">) {
  const [{ slug }, { departure }] = await Promise.all([params, searchParams]);
  const data = await getTripPageData(slug);
  if (!data) notFound();
  const { trip, ends, departures } = data;
  const cover = trip.assets[0];

  return (
    <>
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
      <RequestForm
        tripId={trip.id}
        tripSlug={trip.slug}
        tripName={trip.name}
        route={[ends.from, duration(trip.durationDays, trip.durationNights)].filter(Boolean).join(" · ")}
        image={cover ? { src: cover.url, alt: cover.label ?? trip.name } : null}
        departures={departures}
        initialDeparture={typeof departure === "string" ? departure : undefined}
      />
    </>
  );
}
