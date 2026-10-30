import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/ui/section-header";
import { getAllTrips } from "@/features/tours/api";
import { getTripPageData } from "@/features/tours/trip-data";
import { pad2 } from "@/lib/format";
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

function nextSteps(meetingPoint: string | null) {
  return [
    { when: "Within 24 hours", title: "We call you", body: "Save our number so you know it’s us." },
    {
      when: "On the call",
      title: "Confirm your seat",
      body: "We sort room sharing and answer questions, then send a secure link for the deposit. We never ask for an OTP on a call.",
    },
    {
      when: "7 days before",
      title: "Your trip pack lands",
      body: `Meeting time${meetingPoint ? ` at ${meetingPoint}` : ""}, your coordinator’s number and a packing list.`,
    },
  ];
}

// Unknown slugs 404 before anything streams (see the trip page).
export const instant = false;

// B09 Request sent. The request itself comes from the form via sessionStorage.
export default async function SentPage({ params }: PageProps<"/trips/[slug]/request/sent">) {
  const { slug } = await params;
  const data = await getTripPageData(slug);
  if (!data) notFound();

  return (
    <main className="page-container flex flex-1 flex-col gap-14 pt-6 pb-10 md:gap-20 md:pt-12 md:pb-16">
      <SentRequestView tripSlug={slug} tripName={data.trip.name} departures={data.departures}>
        <section aria-labelledby="h-next" className="flex flex-col gap-6">
          <SectionHeader kicker="No payment yet" title={<span id="h-next">What happens next</span>} />
          <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
            {nextSteps(data.ends.from).map((s, i) => (
              <li key={s.title} className="ticket-surface flex flex-col gap-2 p-5">
                <span className="text-[36px] font-extrabold leading-none text-link [font-stretch:115%]">{pad2(i + 1)}</span>
                <span className="pt-1 type-label text-red">{s.when}</span>
                <h3 className="m-0 type-h3">{s.title}</h3>
                <p className="m-0 text-[14px] leading-[1.45] text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </SentRequestView>
    </main>
  );
}
