import { CalendarDays, Check, ChevronDown, Mail, Phone, UserRound, UsersRound, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { supportEmail } from "@/config/site";
import { getAllTrips } from "@/features/tours/api";
import { RouteLine } from "@/features/tours/components/route-line";
import { isListable } from "@/features/tours/mappers";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";

/*
 * T07 How it works. Static copy from the canvas, with three changes forced by
 * product decisions: no child fares, no "I'm flexible", and sign-in is Google or
 * email only. Business values the canvas leaves open ([Support phone],
 * [Deposit amount] …) stay as the canvas's own placeholders until site config
 * exists. Trip count and lowest price come from the catalog.
 */

const UPDATED = { iso: "2026-10-28", label: "28 Oct 2026" };

export async function generateMetadata(): Promise<Metadata> {
  const trips = (await getAllTrips()).filter(isListable);
  const cover = trips[0]?.asset;
  return {
    title: "How Ghumbo group trips work",
    description:
      "Pick a fixed-date group trip, request a seat in two minutes and we call you within 24 hours. No payment until we’ve talked, and never over the phone.",
    alternates: { canonical: "/how-it-works" },
    openGraph: cover ? { images: [{ url: cover.url, alt: cover.label ?? "A Ghumbo group trip" }] } : undefined,
  };
}

const STEPS: { kicker: string; title: string; body: string; points: string[]; note?: string }[] = [
  {
    kicker: "Pick a departure",
    title: "Choose a trip and a fixed date",
    body: "Every trip leaves on set dates with a set plan. Each departure shows the price and how many seats are left in the group.",
    points: [
      "Prices are per person, twin sharing, GST included",
      "Couples share a room (ask for a double bed) and pay per person",
      "Peak dates (Christmas week, May holidays) cost more",
    ],
  },
  {
    kicker: "Request your seat",
    title: "Tell us who’s coming",
    body: "A short form: your name, email, mobile, how many of you and the date.",
    points: ["No card details, no account needed", "Sign in if you want to track the request", "We hold nothing until we talk"],
    note: "NO PAYMENT NOW · WE CALL WITHIN 24 HOURS",
  },
  {
    kicker: "We call, you confirm",
    title: "A real person calls you",
    body: "Someone from Ghumbo calls from [Support phone], answers your questions and holds your seat. Then we email a secure link for the [Deposit amount] deposit, from billing@mail.ghumbo.com.",
    points: [
      "Room sharing sorted on the call",
      "The balance is due by [Balance due date]",
      "Your trip pack lands 7 days before you leave",
      "Meet the group at the hub on day one",
    ],
  },
];

const FINE_PRINT = [
  {
    icon: CalendarDays,
    title: "What’s a fixed departure?",
    body: "A trip that leaves on a set date with a set plan, whether you come with friends or alone. You join a group, so stays, jeeps and a coordinator cost less per head.",
  },
  {
    icon: UserRound,
    title: "Coming solo?",
    body: "You’ll room with someone of the same gender, or pay a single supplement of [Single supplement] for a room to yourself. Plenty of travellers come alone.",
  },
  {
    icon: UsersRound,
    title: "How big are the groups?",
    body: "Up to 18 travellers plus a Ghumbo coordinator. Treks like Sandakphu cap at 14. Small enough to know everyone by day two.",
  },
];

const IN_EVERY_TRIP = [
  "Stays, twin sharing",
  "Transfers from the hub and back",
  "Sightseeing transport on the plan",
  "Entry fees and permits on the itinerary",
  "A Ghumbo coordinator on every trip",
  "Meals as listed on each trip",
];

const NEVER_INCLUDED = ["Train or flight to the hub", "Meals not listed", "Optional add-ons", "Tips and travel insurance"];

const MONEY = [
  { step: "Step 1 · the call", amount: "₹0", mono: true, body: "We confirm the date and room sharing, and answer every question." },
  {
    step: "Step 2 · deposit",
    amount: "[Deposit amount]",
    mono: true,
    body: "Holds your seat. Paid by secure link to [Legal company name], never to a personal account.",
  },
  {
    step: "Step 3 · balance",
    amount: "Before you go",
    mono: false,
    body: "The balance is due by [Balance due date]. We confirm the exact date on the call.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I pay, and how do I know it’s really you?",
    a: "After our call we email a secure payment link from billing@mail.ghumbo.com. The payee is [Legal company name]. We never ask for an OTP, card details or a transfer to a personal account over the phone. If anyone does, hang up and call [Support phone].",
  },
  {
    q: "Do I need an account to request a seat?",
    a: "No. Anyone can request a seat as a guest. Sign in with Google or your email if you want to follow your requests in My trips.",
  },
  {
    q: "Is the train or flight to the start point included?",
    a: "No. Trips are land only. They start and end at a hub: New Jalpaiguri (NJP) or Bagdogra (IXB) for the hills, Kolkata or Howrah for the south, Port Blair (IXZ) for the Andamans, where the island ferries are included. We share the meeting time so you can plan.",
  },
  {
    q: "What does twin sharing mean?",
    a: "Two people to a room. Couples share one room and each pays the per-person price. Solo travellers share with someone of the same gender.",
  },
  {
    q: "Can I bring a child?",
    a: "Yes. Mention them in the message when you request a seat, and we confirm their fare and the room on the call.",
  },
  {
    q: "Why do some dates cost more?",
    a: "Peak dates around Christmas, New Year and the May holidays cost more because stays and jeeps do. They carry a PEAK badge on every departure.",
  },
  {
    q: "What if I need to cancel?",
    a: "Our policy: [Cancellation policy]. We walk you through it on the call, before any deposit.",
  },
  {
    q: "Who is the coordinator?",
    a: "A Ghumbo team member who travels with the group and handles tickets, timings and the early starts. You get their name and number in your trip pack.",
  },
  {
    q: "How do I reach you?",
    a: `Call [Support phone] or write to ${supportEmail}. We reply within [Support reply time].`,
  },
];

/** FAQPage is optional (docs/seo-geo-guidelines.md §5); only the answers that carry no open placeholder go in. */
function faqLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.filter((f) => !f.a.includes("[")).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default async function HowItWorksPage() {
  const trips = (await getAllTrips()).filter(isListable);
  const from = trips.length ? Math.min(...trips.map((t) => t.startingPrice.amount)) : null;
  const count = `${trips.length} ${trips.length === 1 ? "trip" : "trips"}`;

  return (
    <main className="page-container flex flex-1 flex-col gap-14 pb-10 md:gap-20 md:pb-24">
      <JsonLd data={faqLd()} />

      <section className="grid items-center gap-12 pt-6 md:pt-12 min-[960px]:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="type-label text-red">How it works</span>
              <h1 className="m-0 type-h1">Pick a date. We sort the rest.</h1>
            </div>
            <p className="m-0 max-w-[52ch] type-body-l">
              Every Ghumbo trip runs on fixed dates with a small group. You request a seat, we call you, and the only thing
              left to plan is your playlist. No payment until we’ve talked, and never over the phone.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 *:flex-[1_1_100%] md:*:flex-none">
            <Link href="/trips" className={buttonClasses()}>
              See all {count} →
            </Link>
            <a href="#faq" className={buttonClasses({ variant: "secondary" })}>
              Jump to the FAQ
            </a>
          </div>
        </div>
        <TripPass />
      </section>

      <section aria-labelledby="h-steps" className="flex flex-col gap-6">
        <SectionHeader kicker="The plan" title={<span id="h-steps">Three steps, then you go</span>} />
        <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="ticket-surface flex flex-col">
              <div className="flex min-h-20 items-stretch md:min-h-24">
                <span className="flex w-20 flex-none items-center justify-center rounded-tl-[4.5px] bg-passport text-[36px] font-extrabold leading-none text-on-passport [font-stretch:115%]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col justify-center gap-2 px-5 py-4">
                  <span className="type-label text-red">{s.kicker}</span>
                  <h3 className="m-0 type-h3">{s.title}</h3>
                </span>
              </div>
              <TearLine />
              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="m-0 type-body">{s.body}</p>
                <CheckList items={s.points} />
                {s.note && (
                  <span className="font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-link">{s.note}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="h-fine" className="flex flex-col gap-6">
        <SectionHeader kicker="Good to know" title={<span id="h-fine">The fine print, in plain words</span>} />
        <div className="grid gap-6 md:grid-cols-3">
          {FINE_PRINT.map(({ icon: Icon, title, body }) => (
            <div key={title} className="ticket-surface flex flex-col gap-3 p-5">
              <Icon size={24} aria-hidden className="text-link" />
              <h3 className="m-0 type-h3">{title}</h3>
              <p className="m-0 text-[14px] leading-[1.45] text-muted">{body}</p>
            </div>
          ))}
        </div>
        <div className="ticket-surface flex flex-col md:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-6">
            <h3 className="m-0 text-[18px] font-bold leading-[1.3] [font-stretch:110%]">In every trip</h3>
            <IconList items={IN_EVERY_TRIP} kind="in" className="md:grid md:grid-cols-2 md:gap-x-6" />
          </div>
          <TearLine orientation="vertical" className="hidden md:block" />
          <TearLine className="md:hidden" />
          <div className="flex flex-col gap-2 p-6 md:w-[340px] md:flex-none">
            <h3 className="m-0 text-[18px] font-bold leading-[1.3] [font-stretch:110%]">Never included</h3>
            <IconList items={NEVER_INCLUDED} kind="out" />
          </div>
        </div>
      </section>

      <section aria-labelledby="h-money" className="on-board flex flex-col gap-6 rounded-ticket bg-board p-5 text-on-board md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span className="type-label text-flap">Payments</span>
            <h2 id="h-money" className="m-0 type-h2 text-on-board">
              How the money works
            </h2>
          </div>
          <span className="font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-board-label">
            NO PAYMENT UNTIL WE’VE TALKED · NEVER OVER THE PHONE
          </span>
        </div>
        <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
          {MONEY.map((m) => (
            <li key={m.step} className="flex flex-col gap-2.5 rounded-ticket border border-board-rule p-5">
              <span className="type-label text-board-label">{m.step}</span>
              <span
                className={cn(
                  "text-[26px] leading-[1.1] text-flap",
                  m.mono ? "font-mono font-semibold" : "font-extrabold [font-stretch:110%]",
                )}
              >
                {m.amount}
              </span>
              <span className="text-[15px] leading-normal">{m.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" aria-labelledby="h-faq" className="grid scroll-mt-24 items-start gap-6 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-12">
        <div className="flex flex-col gap-4">
          <SectionHeader kicker="FAQ" title={<span id="h-faq">Questions, answered</span>} />
          <p className="m-0 type-body text-muted">The things people ask us most. Still stuck? We’re a phone call away.</p>
          <div className="flex flex-col gap-2 rounded-ticket border-2 border-dashed border-tear px-5 py-4">
            <span className="type-stub text-muted">Talk to us</span>
            {/* The canvas leaves the number open; it gets a tel: link once site config has one. */}
            <span className="inline-flex min-h-11 items-center gap-2 font-mono text-[15px] font-semibold leading-[1.2] text-link">
              <Phone size={18} aria-hidden /> [Support phone]
            </span>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex min-h-11 items-center gap-2 font-mono text-[15px] font-semibold leading-[1.2] text-link underline"
            >
              <Mail size={18} aria-hidden /> {supportEmail}
            </a>
          </div>
          <span className="font-mono text-[12px] leading-none tracking-[0.04em] text-muted">
            UPDATED <time dateTime={UPDATED.iso}>{UPDATED.label.toUpperCase()}</time>
          </span>
        </div>
        {/* <details> keeps every answer in the server HTML (AGENTS.md SEO rule). */}
        <div className="border-b-2 border-dashed border-tear">
          {FAQS.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-t-2 border-dashed border-tear">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[18px] font-bold leading-[1.3] [font-stretch:110%] [&::-webkit-details-marker]:hidden">
                <h3 className="m-0 [font:inherit]">{f.q}</h3>
                <ChevronDown size={20} aria-hidden className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="m-0 max-w-[68ch] pb-5 type-body">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-cta" className="ticket-surface flex flex-col md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-5 md:p-8">
          <h2 id="h-cta" className="m-0 type-h2">
            Seen enough? Pick a date.
          </h2>
          <p className="m-0 type-body text-muted">
            {count} on the board{from !== null && `, from ${formatINR(from)}`}. New destinations every season.
          </p>
        </div>
        <TearLine orientation="vertical" className="hidden md:block" />
        <TearLine className="md:hidden" />
        <div className="flex items-center justify-center px-4 py-5 md:px-12 md:py-8">
          <Link href="/trips" className={buttonClasses({ variant: "secondary", className: "w-full md:w-auto" })}>
            See departures
          </Link>
        </div>
      </section>
    </main>
  );
}

function TripPass() {
  const facts = [
    ["Form", "2 minutes"],
    ["Payment now", "₹0"],
    ["We call", "Within 24 hours"],
    ["Group", "Up to 18"],
  ];
  return (
    <div className="ticket-surface flex min-w-0 flex-col max-[959px]:max-w-[460px]">
      <div className="flex items-center justify-between rounded-t-[4.5px] bg-passport px-5 py-3.5 text-on-passport">
        <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em]">YOUR TRIP · 3 STEPS</span>
        <Logo tone="stock" ground="var(--g-passport)" className="w-[96px]" />
      </div>
      <div className="p-5">
        <RouteLine stops={["Pick", "Request", "Call", "Go"]} className="[&_span[aria-hidden]]:max-w-none" />
      </div>
      <TearLine />
      <dl className="m-0 grid grid-cols-2 gap-4 px-5 pt-[18px] pb-5">
        {facts.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1.5">
            <dt className="type-stub text-muted">{k}</dt>
            <dd className="m-0 font-mono text-[15px] font-semibold uppercase leading-[1.2]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[20px_1fr] gap-2.5 text-[14px] leading-[1.45] text-muted">
          <Check size={18} aria-hidden className="mt-px text-green" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function IconList({ items, kind, className }: { items: string[]; kind: "in" | "out"; className?: string }) {
  const Icon = kind === "in" ? Check : X;
  return (
    <ul className={cn("m-0 list-none p-0", className)}>
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[20px_1fr] gap-3 py-2 text-[15px] leading-[1.4]">
          <Icon size={20} aria-hidden className={kind === "in" ? "text-green" : "text-muted"} />
          {item}
        </li>
      ))}
    </ul>
  );
}
