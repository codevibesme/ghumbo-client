import { getTripsByDestination } from "@/features/tours/api";
import { ComingSoonCard, DestinationTicket } from "@/features/destinations/components/destination-card";
import { dayRange, destinationHref, firstSentence, tripStats } from "@/features/destinations/lib";
import type { Destination } from "@/features/destinations/types";
import { formatINR } from "@/lib/format";

/** Live destinations as tickets, coming-soon ones as drawings. Shared by /destinations and country pages. */
export async function PlaceCards({ live, soon }: { live: Destination[]; soon: Destination[] }) {
  const withTrips = await Promise.all(live.map(async (d) => ({ d, trips: await getTripsByDestination(d.slug) })));
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
      {withTrips.map(({ d, trips }) => {
        const stats = tripStats(trips);
        const range = dayRange(stats);
        const word = stats.count === 1 ? "trip" : "trips";
        const cover = d.assets[0];
        return (
          <DestinationTicket
            key={d.id}
            href={destinationHref(d)}
            name={d.name}
            blurb={firstSentence(d.overview)}
            badge={`Live · ${stats.count} ${word}`}
            image={cover ? { src: cover.url, alt: cover.label ?? d.name } : null}
            facts={range ? [{ label: "Trips", value: range }] : []}
            priceLabel={`${stats.count} ${word} · from, per person`}
            price={stats.priceFrom !== null ? formatINR(stats.priceFrom) : "Dates soon"}
            cta={`See ${d.name} trips →`}
          />
        );
      })}
      {soon.map((d) => (
        <ComingSoonCard key={d.id} name={d.name} blurb={firstSentence(d.overview)} opening="Opening soon" />
      ))}
    </div>
  );
}
