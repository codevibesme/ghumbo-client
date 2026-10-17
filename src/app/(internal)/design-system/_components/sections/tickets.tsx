import { Button } from "@/components/ui/button";
import { ComingSoonCard, DestinationCard } from "@/features/destinations/components/destination-card";
import { DepartureChooser } from "@/features/tours/components/departure-picker";
import { TourCard, TourCompactCard, TourListCard } from "@/features/tours/components/tour-cards";
import { Section, Spec } from "../parts";
import { departures, tours } from "../sample-data";

export function TicketsSections() {
  return (
    <>
<Section id="tickets" kicker="06 · Tickets" title="Tour ticket cards" note="The whole card is one link. Stub below a notched tear holds next date, seats and price.">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TourCard tour={tours.darjeeling} />
            <TourCard tour={tours.kolkata} />
            <TourCard tour={tours.kolkataSoldOut} />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <Spec label="List card · desktop" className="hidden flex-1 md:flex">
              <TourListCard tour={tours.hillCircuit} />
            </Spec>
            <Spec label="Compact card · phone">
              <TourCompactCard tour={tours.sundarbans} className="w-full max-w-[358px]" />
            </Spec>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DestinationCard
              href="/destinations/west-bengal"
              name="West Bengal"
              blurb="Tea towns, tigers, terracotta and trams. 9 trips from ₹5,299."
              tripCount={9}
              image={{ src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Toy_Train_Darjeeling_West_Bengal_India.jpg/1920px-Toy_Train_Darjeeling_West_Bengal_India.jpg", alt: "Darjeeling toy train" }}
            />
            <ComingSoonCard
              name="Sikkim"
              blurb="Monasteries, high lakes and mountain roads. No dates yet."
              opening="Opening 2027"
              action={<Button variant="secondary" size="m">Notify me</Button>}
            />
          </div>
        </Section>

<Section id="decide" kicker="07 · Decide" title="Departure picker and group pass" note="Each square is one seat. Open = signal green, few left = amber, taken = tear grey. The caption repeats the count as text.">
          <DepartureChooser
            departures={departures}
            from="NJP"
            to="Darjeeling"
            requestHref="/trips/darjeeling-queen-of-the-hills/request"
            defaultId="2026-12-26"
          />
        </Section>
    </>
  );
}
