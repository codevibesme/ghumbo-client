import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllTrips } from "@/features/tours/api";
import { getTripPageData } from "@/features/tours/trip-data";
import { SentRequestView } from "./_components/sent-request";

// Same slugs as the trip page, so the shell (and the header's active nav) prerenders.
export async function generateStaticParams() {
  const trips = await getAllTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export const metadata: Metadata = {
  title: "Request sent",
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  { when: "Within 24 hours", title: "We call you", body: "Save our number so you know it’s us." },
  {
    when: "On the call",
    title: "Confirm your seat",
    body: "We sort room sharing and answer questions, then send a secure link for the deposit. We never ask for an OTP on a call.",
  },
  { when: "7 days before", title: "Your trip pack lands", body: "Meeting time, your coordinator’s number and a packing list." },
];

// B09 Request sent. The request itself comes from the form via sessionStorage.
export default function SentPage({ params }: PageProps<"/trips/[slug]/request/sent">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-10 pt-10 pb-16">
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <SentContent params={params} />
      </Suspense>
    </main>
  );
}

async function SentContent({ params }: Pick<PageProps<"/trips/[slug]/request/sent">, "params">) {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  if (!data) notFound();

  return (
    <SentRequestView tripSlug={slug} tripName={data.trip.name} departures={data.departures}>
      <section className="flex flex-col gap-6">
        <h2 className="m-0 type-h2">What happens next</h2>
        <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
          {NEXT_STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2">
              <span className="type-label text-red">
                {String(i + 1).padStart(2, "0")} · {s.when}
              </span>
              <h3 className="m-0 type-h3">{s.title}</h3>
              <p className="m-0 type-body text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </SentRequestView>
  );
}
