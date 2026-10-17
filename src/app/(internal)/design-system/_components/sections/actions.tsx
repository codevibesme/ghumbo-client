import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { Section, Spec } from "../parts";

export function ActionsSections() {
  return (
    <>
<Section id="chrome" kicker="01 · Chrome" title="Headers and footers" note="The page header above is the real <SiteHeader>; the footer below the page is <SiteFooter>. Resize under 720px for the mobile header, menu sheet and compact footer.">
          <Spec label="Signed in · My trips + avatar">
            <div className="rounded-ticket border-[1.5px] border-dashed border-tear">
              <SiteHeader current="my-trips" user={{ name: "Riya Sen", initials: "RS" }} />
            </div>
          </Spec>
          <Spec label="Auth screens · logo only">
            <div className="rounded-ticket border-[1.5px] border-dashed border-tear">
              <SiteHeader minimal />
            </div>
          </Spec>
        </Section>

<Section id="actions" kicker="02 · Actions" title="Buttons" note="One primary per view. → only on forward-moving primary actions and tertiary links. L 52px for page CTAs and forms; M 44px in headers, cards, dialogs, filters.">
          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {(["l", "m"] as const).map((size) => (
              <div key={size} className="contents">
                <Spec label={`Primary ${size.toUpperCase()}`}><Button size={size} className="self-start">Request my seat →</Button></Spec>
                <Spec label={`Secondary ${size.toUpperCase()}`}><Button size={size} variant="secondary" className="self-start">See departures</Button></Spec>
                <Spec label={`Destructive ${size.toUpperCase()}`}><Button size={size} variant="destructive" className="self-start">Withdraw request</Button></Spec>
                <Spec label={`Destructive confirm ${size.toUpperCase()}`}><Button size={size} variant="danger" className="self-start">Delete account</Button></Spec>
                <Spec label={`Disabled ${size.toUpperCase()}`}><Button size={size} disabled className="self-start">Verify</Button></Spec>
              </div>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-[1fr_1fr_2fr]">
            <Spec label="Tertiary / text link">
              <div className="flex gap-6">
                <TextLink href="/trips">All trips →</TextLink>
                <TextLink href="#forms">Change number</TextLink>
              </div>
            </Spec>
            <Spec label="On board · flap yellow">
              <div className="on-board flex items-center gap-4 rounded-ticket bg-board p-4">
                <Button variant="board" size="m">Find trips →</Button>
                <TextLink href="/trips" tone="board">All trips →</TextLink>
              </div>
            </Spec>
            <Spec label="asChild · a Next <Link> with button styles">
              <Button asChild variant="secondary" size="m" className="self-start">
                <Link href="/trips">See departures</Link>
              </Button>
            </Spec>
          </div>
        </Section>
    </>
  );
}
