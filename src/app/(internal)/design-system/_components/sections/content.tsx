import { Calendar, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FactTile } from "@/components/ui/fact-tile";
import { TextLink } from "@/components/ui/text-link";
import { DepartureBoard } from "@/features/tours/components/departure-board";
import { InclusionList } from "@/features/tours/components/inclusion-list";
import { ItineraryDay } from "@/features/tours/components/itinerary-day";
import { RouteLine } from "@/features/tours/components/route-line";
import { Section, Spec } from "../parts";
import { boardRows } from "../sample-data";
import { icons } from "../specimens";

export function ContentSections() {
  return (
    <>
<Section id="content" kicker="08 · Content" title="Itinerary, inclusions, facts, empty state" note="Only optional paid extras get ADD-ON; meals you buy yourself get PAY DIRECT. Included items carry no tag.">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <ItineraryDay
              day="Day 02"
              title="Tiger Hill sunrise, Ghum and the toy train"
              date="SUN 27 DEC"
              activities={[
                { time: "04:00", title: "Pre-dawn drive to Tiger Hill", note: "Shared local jeeps up to 2,567 m. Bring a jacket, cap and gloves." },
                { time: "04:45", title: "Sunrise over Kanchenjunga", note: "First light turns the range pink, then gold. Views depend on weather." },
                { time: "10:40", title: "Darjeeling Himalayan Railway joyride", note: "Loops around Batasia. Not riding? Walk Observatory Hill instead.", addOn: "from ₹800" },
                { time: "13:00", title: "Lunch near the Mall", note: "At a local restaurant.", payDirect: "≈ ₹250" },
              ]}
              meals="Breakfast"
              stay="Family-run homestay below Chowrasta"
            />
            <div className="flex flex-col gap-7">
              <Spec label="Route line">
                <div className="ticket-surface px-5 py-4">
                  <RouteLine stops={["NJP", "Kurseong", "Ghum", "Darjeeling"]} />
                </div>
              </Spec>
              <div className="grid gap-4 sm:grid-cols-2">
                <FactTile icon={<Calendar size={20} aria-hidden />} label="Best time" value="Oct – Mar" note="Hills also Mar – May." />
                <FactTile icon={<MapPin size={20} aria-hidden />} label="Hubs" value="CCU · IXB · NJP" note="Kolkata, Bagdogra, New Jalpaiguri." />
              </div>
              <EmptyState
                icon={<Ticket size={24} aria-hidden />}
                title="No past trips yet"
                action={
                  <Button asChild variant="secondary" size="m">
                    <Link href="/trips">See departures</Link>
                  </Button>
                }
              >
                Your stamps show up here after your first trip. The hills are waiting.
              </EmptyState>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <InclusionList
              title="Included"
              kind="included"
              items={[
                { title: "3 nights' homestay", note: "Twin rooms, attached bath and geyser." },
                { title: "Daily breakfast", note: "Day 2 to Day 4 at the homestay." },
                { title: "Group transfers", note: "NJP / Bagdogra pickup and drop." },
              ]}
            />
            <InclusionList
              title="Not included"
              kind="excluded"
              items={[
                { title: "Train or flight to NJP", note: "Travel to and from the start point." },
                { title: "Lunches and dinners", note: "Budget about ₹600–700 a day." },
                { title: "Toy-train joyride", note: "From ₹800. We help book." },
              ]}
            />
          </div>
        </Section>

<Section id="surfaces" kicker="09 · Surfaces" title="Departure board and icons" note="Board: flap-yellow mono data, stock trip names, light badges unchanged. One board per page.">
          <DepartureBoard title="Leaving soon" action={<TextLink href="/trips" tone="board">All trips →</TextLink>} rows={boardRows} />
          <Spec label="Icons · lucide-react · 1.75 stroke (set app-wide) · 16 / 20 / 24 · currentColor">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-11">
              {icons.map(([name, Icon]) => (
                <div key={name} className="ticket-surface flex flex-col items-center gap-2 px-1.5 py-3.5">
                  <Icon size={24} aria-hidden />
                  <span className="font-mono text-[11px] text-muted">{name}</span>
                </div>
              ))}
            </div>
          </Spec>
        </Section>
    </>
  );
}
