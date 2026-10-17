import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge, SeatBadge, StatusBadge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeader } from "@/components/ui/section-header";
import { RoundStamp, Stamp } from "@/components/ui/stamp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextLink } from "@/components/ui/text-link";
import { ChipsDemo } from "../demos";
import { Section, Spec } from "../parts";

export function NavigationSections() {
  return (
    <>
<Section id="navigation" kicker="04 · Navigation" title="Chips, tabs, accordion, breadcrumb" note="Mono caps wherever a control is a filter or a switch. Chips use 4px radius, never pills.">
          <div className="grid items-start gap-x-12 gap-y-8 md:grid-cols-2">
            <Spec label="Filter chips · default / active / removable">
              <ChipsDemo />
            </Spec>
            <Spec label="Tabs">
              <Tabs defaultValue="requests">
                <TabsList aria-label="My trips">
                  <TabsTrigger value="requests">Requests (3)</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming (1)</TabsTrigger>
                  <TabsTrigger value="past">Past (0)</TabsTrigger>
                </TabsList>
                <TabsContent value="requests" className="pt-4 type-small text-muted">Three open requests.</TabsContent>
                <TabsContent value="upcoming" className="pt-4 type-small text-muted">One booked trip.</TabsContent>
                <TabsContent value="past" className="pt-4 type-small text-muted">No past trips yet.</TabsContent>
              </Tabs>
            </Spec>
            <Spec label="Breadcrumb">
              <Breadcrumb items={[{ label: "Trips", href: "/trips" }, { label: "West Bengal", href: "/destinations/west-bengal" }, { label: "Darjeeling" }]} />
            </Spec>
            <Spec label="Section header">
              <SectionHeader kicker="Leaving soon" title="Next four departures" action={<TextLink href="/trips">All trips →</TextLink>} />
            </Spec>
            <Spec label="Accordion · one open" className="md:col-span-2">
              <Accordion defaultValue="after">
                <AccordionItem value="after" question="What happens after I request a seat?">
                  We call you within 24 hours from [Support phone], answer questions and hold your seat. A [Deposit amount] deposit
                  confirms it. Nothing is charged online.
                </AccordionItem>
                <AccordionItem value="solo" question="Can I come solo?">
                  [Answer to be written.]
                </AccordionItem>
              </Accordion>
            </Spec>
          </div>
        </Section>

<Section id="status" kicker="05 · Status" title="Badges and stamps" note="Badges are flat. Stamps are rotated and reserved for one moment per view.">
          <div className="grid gap-x-8 gap-y-7 md:grid-cols-3">
            <Spec label="Seats · <SeatBadge left={n} />">
              <div className="flex flex-wrap gap-2">
                <SeatBadge left={14} />
                <SeatBadge left={4} />
                <SeatBadge left={1} />
                <SeatBadge left={0} />
              </div>
            </Spec>
            <Spec label="Trip flags">
              <div className="flex flex-wrap gap-2">
                <Badge tone="peak">Peak</Badge>
                <Badge tone="pick">Ghumbo pick</Badge>
                <Badge tone="outline">Opening 2027</Badge>
              </div>
            </Spec>
            <Spec label="Itinerary tags">
              <div className="flex flex-wrap gap-2">
                <Badge tone="tint">Add-on · from ₹800</Badge>
                <Badge tone="dashed">Pay direct · ≈ ₹250</Badge>
              </div>
            </Spec>
            <Spec label="Inquiry status · <StatusBadge />">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="received" />
                <StatusBadge status="called" />
                <StatusBadge status="confirming" />
                <StatusBadge status="booked" />
                <StatusBadge status="closed" />
              </div>
            </Spec>
            <Spec label="Stamps S · −6°">
              <div className="flex flex-wrap items-center gap-5 py-2">
                <Stamp tone="amber">Confirming</Stamp>
                <Stamp tone="green">Booked</Stamp>
                <Stamp>Peak dates</Stamp>
              </div>
            </Spec>
            <Spec label="Stamps M / L · −10°">
              <div className="flex items-center gap-7 py-2">
                <Stamp size="m">Sold out</Stamp>
                <RoundStamp top="Request sent" middle="26 DEC" bottom="GH-26DEC-4821" />
              </div>
            </Spec>
          </div>
        </Section>
    </>
  );
}
