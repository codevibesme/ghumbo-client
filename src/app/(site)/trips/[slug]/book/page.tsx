import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Kicker } from "@/components/ui/section-header";
import { CheckoutForm } from "@/features/bookings/components/checkout-form";
import { duration, imageOf } from "@/features/tours/mappers";
import { getAllTrips } from "@/features/tours/api";
import { getTripPageData, shortName } from "@/features/tours/trip-data";
import type { TripPageData } from "@/features/tours/trip-data";
import { seatState } from "@/lib/format";

// Same slugs as the trip page, so the shell (and the header's active nav) prerenders.
export async function generateStaticParams() {
  const trips = await getAllTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export const metadata: Metadata = {
  title: "Grab your seat",
  robots: { index: false, follow: false },
};

// Unknown slugs 404 before anything streams; ?departure= and ?travellers= are read under Suspense.
export const instant = false;

/** "FRI 13 NOV" → "Fri 13 Nov" (departure-selection has the same, but it's a client module). */
const sentenceDate = (d: string) => d.replace(/\b([A-Z])([A-Z]+)\b/g, (_, a: string, b: string) => a + b.toLowerCase());

/** "Only 3 left. Move fast." / "11 seats left". */
function seatsLine(left: number) {
  const state = seatState(left);
  if (state === "soldOut") return "Sold out";
  if (state === "last") return "Last seat. Move fast.";
  if (state === "few") return `Only ${left} left. Move fast.`;
  return `${left} seats left`;
}

// B08 Checkout. ?departure=<id> is the date picked on the trip page; ?travellers=a,b ticks saved travellers
// ("Create a new booking" after a hold ran out). Signed-in only: the form sends visitors to sign in.
export default async function BookPage({ params, searchParams }: PageProps<"/trips/[slug]/book">) {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  if (!data) notFound();
  const { trip } = data;

  return (
    <main className="page-container flex flex-1 flex-col gap-8 pt-5 pb-24 md:pt-8">
      <Breadcrumb
        items={[
          { label: "Trips", href: "/trips" },
          { label: shortName(trip.name), href: `/trips/${trip.slug}` },
          { label: "Grab your seat" },
        ]}
      />
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <Checkout data={data} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Checkout({ data, searchParams }: { data: TripPageData } & Pick<PageProps<"/trips/[slug]/book">, "searchParams">) {
  const { departure: wanted, travellers } = await searchParams;
  const { trip, ends, departures } = data;
  const departure =
    departures.find((d) => d.id === wanted) ?? departures.find((d) => d.seatsLeft > 0) ?? departures[0];

  if (!departure) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-ticket border-2 border-dashed border-tear px-6 py-8">
        <h1 className="m-0 type-h2">No dates open right now</h1>
        <p className="m-0 type-body text-muted">New departures for {shortName(trip.name)} are on the way.</p>
        <Link href={`/trips/${trip.slug}`}>Back to the trip →</Link>
      </div>
    );
  }

  const ids = typeof travellers === "string" ? travellers.split(",").filter(Boolean) : [];

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <Kicker>
          {sentenceDate(departure.start)} · {seatsLine(departure.seatsLeft)}
        </Kicker>
        <h1 className="m-0 type-h1">Who’s coming to {shortName(trip.name)}?</h1>
        <p className="m-0 max-w-[58ch] text-[18px] leading-normal text-muted">
          Tick everyone on this trip. Names must match their ID, because the homestay and permit checks will ask.
        </p>
      </div>
      <CheckoutForm
        trip={{
          slug: trip.slug,
          name: trip.name,
          length: duration(trip.durationDays, trip.durationNights),
          image: imageOf(trip.assets.find((a) => a.type === "image"), trip.name),
          from: ends.from,
        }}
        departure={departure}
        initialTravellers={ids}
      />
    </>
  );
}
