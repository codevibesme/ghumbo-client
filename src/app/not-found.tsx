import { ArrowRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Kicker } from "@/components/ui/section-header";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses, controlClasses, textLinkClasses } from "@/components/ui/variants";
import { getAllTrips } from "@/features/tours/api";
import { isListable } from "@/features/tours/mappers";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// T16 404. Root-level so unknown URLs anywhere get the site chrome.
/** The split-flap "404"; the two 4s need distinct keys. */
const FLAPS = [
  { id: "hundreds", digit: "4" },
  { id: "tens", digit: "0" },
  { id: "ones", digit: "4" },
];

export default async function NotFound() {
  const listable = (await getAllTrips()).filter(isListable);
  const priceFrom = listable.length ? Math.min(...listable.map((t) => t.startingPrice.amount)) : null;
  // "Try" links come from the catalog: the destinations that have trips on the board.
  const tryTerms = [...new Set(listable.flatMap((t) => (t.destination ? [t.destination.name] : [])))].slice(0, 3);

  const platforms = [
    { n: 1, title: "Home", href: "/", body: "Back to the start: leaving soon, where we go and how it works." },
    {
      n: 2,
      title: "All trips",
      href: "/trips",
      body: listable.length
        ? `${listable.length} group ${listable.length === 1 ? "trip" : "trips"} on the board${priceFrom !== null ? `, from ${formatINR(priceFrom)}` : ""}.`
        : "Every group trip on the board, with live seats.",
    },
    { n: 3, title: "How it works", href: "/how-it-works", body: "Request a seat, take our call, show up and go." },
  ];

  return (
    <>
      <SiteHeader />
      <main className="page-container flex flex-1 flex-col gap-12 py-12 md:gap-16 md:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_472px] lg:gap-16">
          <div className="flex flex-col">
            <Kicker>Error 404 · platform not found</Kicker>
            <h1 className="m-0 mt-3 type-h1">This road doesn’t go anywhere. Yet.</h1>
            <p className="m-0 mt-4 max-w-[52ch] type-body-l">
              The page you wanted has moved, or it never left the station. Search for a trip, or take one of the platforms
              below.
            </p>
            <form role="search" aria-label="Search trips" action="/trips" className="mt-6 flex flex-wrap items-end gap-3">
              <label className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
                <span className="type-label text-ink">Search trips</span>
                <input type="search" name="q" required placeholder="Darjeeling, beaches, December" className={controlClasses} />
              </label>
              <button type="submit" className={buttonClasses({ className: "flex-none" })}>
                <Search size={20} aria-hidden />
                Search
              </button>
            </form>
            {tryTerms.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-5">
                <span className="type-stub text-muted">Try</span>
                {tryTerms.map((term) => (
                  <Link key={term} href={`/trips?q=${encodeURIComponent(term)}`} className={textLinkClasses()}>
                    {term}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div
            role="img"
            aria-label="Departure board: platform 404, destination unknown, status cancelled"
            className="on-board flex flex-col gap-5 rounded-ticket bg-board p-6 text-on-board"
          >
            <div className="flex justify-between font-mono text-[12px] tracking-[0.08em] text-board-label">
              <span>DEPARTURES</span>
              <span>ERROR 404</span>
            </div>
            <div className="flex justify-center gap-2">
              {FLAPS.map(({ id, digit }) => (
                <span
                  key={id}
                  className="relative inline-flex h-[104px] w-[78px] items-center justify-center rounded-ticket bg-board-rule text-[78px] leading-none font-extrabold text-flap md:h-32 md:w-24 md:text-[96px]"
                >
                  {digit}
                  <span aria-hidden className="absolute inset-x-0 top-1/2 border-t border-board" />
                </span>
              ))}
            </div>
            <dl className="m-0 flex flex-col">
              {[
                { k: "DESTINATION", v: <span className="text-on-board">Unknown</span> },
                { k: "PLATFORM", v: <span className="text-flap">404</span> },
                { k: "STATUS", v: <Badge tone="muted">Cancelled</Badge> },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between gap-3 border-t border-board-rule py-3">
                  <dt className="font-mono text-[12px] tracking-[0.08em] text-board-label">{k}</dt>
                  <dd className="m-0 font-mono text-[15px] leading-[1.2]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Kicker>Now boarding</Kicker>
            <h2 className="m-0 type-h2">Platforms that do exist</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {platforms.map((p) => (
              <Link key={p.href} href={p.href} className="ticket-surface flex flex-col text-ink no-underline hover:bg-sunk">
                <span className="flex items-center justify-between px-5 py-4">
                  <span className="type-label text-red">Platform {p.n}</span>
                  <ArrowRight size={20} aria-hidden />
                </span>
                <TearLine />
                <span className="flex flex-col gap-2 px-5 pt-4 pb-5">
                  <span className="type-h3">{p.title}</span>
                  <span className="type-small text-muted">{p.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
