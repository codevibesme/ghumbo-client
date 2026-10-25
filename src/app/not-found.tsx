import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { Kicker } from "@/components/ui/section-header";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const PLATFORMS = [
  { n: 1, title: "Home", href: "/", body: "Back to the start: leaving soon, where we go and how it works." },
  { n: 2, title: "All trips", href: "/trips", body: "Every group trip on the board, with live seats." },
  { n: 3, title: "How it works", href: "/how-it-works", body: "Request a seat, take our call, show up and go." },
];

// B16 404. Root-level so unknown URLs anywhere get the site chrome.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="page-container flex flex-1 flex-col gap-12 py-12 md:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col gap-4">
            <Kicker>Error 404 · platform not found</Kicker>
            <h1 className="m-0 type-display">This road doesn’t go anywhere. Yet.</h1>
            <p className="m-0 max-w-[52ch] type-body-l">
              The page you wanted has moved, or it never left the station. Take one of the platforms below.
            </p>
            <Link href="/trips" className={buttonClasses({ className: "self-start" })}>
              See all trips →
            </Link>
          </div>
          <div aria-hidden className="on-board flex flex-col gap-4 rounded-ticket bg-board px-6 py-5 text-on-board">
            <span className="font-mono text-[12px] tracking-[0.08em] text-board-label">DEPARTURES · ERROR 404</span>
            <span className="font-mono text-[96px] font-semibold leading-none tracking-[0.1em] text-flap">404</span>
            <dl className="m-0 grid grid-cols-3 gap-3 font-mono text-[12px]">
              {[
                ["DESTINATION", "Unknown"],
                ["PLATFORM", "404"],
                ["STATUS", "Cancelled"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <dt className="text-board-label">{k}</dt>
                  <dd className="m-0 text-flap uppercase">{v}</dd>
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
            {PLATFORMS.map((p) => (
              <Link key={p.href} href={p.href} className="ticket-surface flex flex-col text-ink no-underline hover:bg-sunk">
                <span className="px-5 pt-4 pb-3 type-label text-red">Platform {p.n}</span>
                <TearLine />
                <span className="flex flex-col gap-2 px-5 pt-3 pb-5">
                  <span className="type-h3">{p.title}</span>
                  <span className="type-body text-muted">{p.body}</span>
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
