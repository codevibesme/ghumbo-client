import { cacheLife } from "next/cache";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/section-header";
import { RoundStamp } from "@/components/ui/stamp";
import { TextLink } from "@/components/ui/text-link";
import { getCountries, getDestinations } from "@/features/destinations/api";
import { DestinationTicket } from "@/features/destinations/components/destination-card";
import { countrySlug, dayRange, destinationHref, firstSentence, tripStats } from "@/features/destinations/lib";
import { getAllTrips } from "@/features/tours/api";
import { DepartureBoard } from "@/features/tours/components/departure-board";
import { isListable, monthLabel, toBoardRows, vibeOptions } from "@/features/tours/mappers";
import { formatINR, formatTicketDate } from "@/lib/format";
import { BookingSteps, HeroSearch, WhyGhumbo } from "./_components/home-parts";

// T01 Home. Catalog data is cached, so the whole page prerenders.
export default async function Home() {
  "use cache";
  cacheLife("minutes");

  const [trips, countries] = await Promise.all([getAllTrips(), getCountries()]);
  const listable = trips.filter(isListable);
  const priceFrom = listable.length ? Math.min(...listable.map((t) => t.startingPrice.amount)) : null;
  // Hero ticket: a Ghumbo pick if there is one, else the next departure out.
  const pick = listable.find((t) => t.isRecommended);
  const heroTrip = pick ?? listable[0];

  // Destination cards: live places, with their trips grouped from the one catalog request.
  const liveCountries = countries.filter((c) => c.status === "live");
  const destinations = (await Promise.all(liveCountries.map((c) => getDestinations(countrySlug(c))))).flat();
  const places = destinations.map((d) => ({ destination: d, trips: trips.filter((t) => t.destination?.slug === d.slug) }));

  const months = [...new Set(listable.map((t) => t.nextDeparture.startDate.slice(0, 7)))]
    .sort()
    .map((m) => ({ value: m, label: monthLabel(m) }));

  return (
    <main className="flex-1">
      <section className="page-container flex flex-wrap items-center gap-12 pt-12 pb-10">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col">
          <span className="type-label text-red">Just show up{priceFrom !== null && ` · from ${formatINR(priceFrom)}`}</span>
          <h1 className="m-0 mt-2 flex flex-col gap-3">
            <span className="text-[clamp(44px,6.4vw,88px)] font-extrabold leading-[0.95] tracking-[-0.02em] [font-stretch:125%]">
              Group trips across India,
            </span>
            <span className="text-[clamp(28px,3vw,40px)] font-extrabold leading-none tracking-[-0.01em] [font-stretch:125%]">
              on fixed dates.
            </span>
          </h1>
          <p className="m-0 mt-4 max-w-[52ch] type-body-l">
            Pick a date and grab a seat in a group of up to 18. We sort the stays, transfers, permits and 4 am alarms. You
            bring the playlist.
          </p>
          <div className="mt-6">
            <HeroSearch
              destinations={places.map((p) => ({ value: p.destination.slug, label: p.destination.name }))}
              months={months}
              vibes={vibeOptions(listable)}
            />
          </div>
        </div>
        {heroTrip && (
          <figure className="m-0 min-w-0 max-w-[420px] flex-[1_1_320px] ticket-surface p-3">
            <div className="relative h-[380px] overflow-hidden rounded-[4px]">
              <Image
                src={heroTrip.asset.url}
                alt={heroTrip.asset.label ?? heroTrip.name}
                fill
                priority
                sizes="420px"
                className="object-cover"
              />
              <span className="absolute right-6 bottom-6">
                <RoundStamp
                  tone="red"
                  top={pick ? "Ghumbo pick" : "Next out"}
                  middle={formatTicketDate(heroTrip.nextDeparture.startDate).slice(4)}
                  bottom={heroTrip.destination?.name}
                />
              </span>
            </div>
            <figcaption className="flex justify-between gap-2 pt-3 type-label text-ink">
              <span>{heroTrip.asset.label ?? heroTrip.name}</span>
              <span>{formatTicketDate(heroTrip.nextDeparture.startDate)}</span>
            </figcaption>
          </figure>
        )}
      </section>

      {listable.length > 0 && (
        <section className="page-container py-10">
          <DepartureBoard
            title="Leaving soon"
            action={
              <TextLink href="/trips" tone="board">
                All trips →
              </TextLink>
            }
            rows={toBoardRows(listable, 6)}
            footnote="PER PERSON, TWIN SHARING · GST INCLUDED · SEATS UPDATE LIVE"
          />
        </section>
      )}

      {places.length > 0 && (
        <section className="page-container flex flex-col gap-6 py-10">
          <SectionHeader kicker="Destinations" title="Where we go" action={<TextLink href="/destinations">All destinations →</TextLink>} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
            {places.map(({ destination, trips: placeTrips }) => {
              const stats = tripStats(placeTrips);
              const range = dayRange(stats);
              const tripWord = stats.count === 1 ? "trip" : "trips";
              const cover = destination.assets[0];
              return (
                <DestinationTicket
                  key={destination.id}
                  href={destinationHref(destination)}
                  name={destination.name}
                  blurb={firstSentence(destination.overview)}
                  badge={`Live · ${stats.count} ${tripWord}`}
                  image={cover ? { src: cover.url, alt: cover.label ?? destination.name } : null}
                  facts={range ? [{ label: "Trips", value: range }] : []}
                  priceLabel={`${stats.count} ${tripWord} · from, per person`}
                  price={stats.priceFrom !== null ? formatINR(stats.priceFrom) : "Dates soon"}
                  cta={`See ${destination.name} trips →`}
                />
              );
            })}
          </div>
        </section>
      )}

      <WhyGhumbo />
      <BookingSteps />
    </main>
  );
}
