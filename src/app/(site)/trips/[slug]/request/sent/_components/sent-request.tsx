"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Kicker } from "@/components/ui/section-header";
import { TearLine } from "@/components/ui/tear-line";
import { TextLink } from "@/components/ui/text-link";
import { buttonClasses } from "@/components/ui/variants";
import { useSentRequest } from "@/features/booking-requests/sent";
import type { Departure } from "@/features/tours/types";
import { formatINR, formatTicketDate } from "@/lib/format";

/**
 * B09 body for the request this tab just sent. Without one (opened directly,
 * or a new tab) it goes back to the trip. `children` is the static
 * "What happens next" section, rendered on the server.
 */
export function SentRequestView({
  tripSlug,
  tripName,
  departures,
  children,
}: {
  tripSlug: string;
  tripName: string;
  departures: Departure[];
  children: ReactNode;
}) {
  const sent = useSentRequest(tripSlug);

  if (sent === null) redirect(`/trips/${tripSlug}`);
  if (!sent) return <div className="min-h-[60vh]" aria-busy="true" />;

  const dep = departures.find((d) => d.id === sent.departureId);
  const firstName = sent.name.split(/\s+/)[0];
  const rows = [
    { label: "Trip", value: tripName },
    {
      label: "Dates",
      value: dep
        ? `${dep.start} → ${dep.end}`
        : sent.travelDate
          ? `Flexible · around ${formatTicketDate(sent.travelDate, { year: true })}`
          : "Flexible",
    },
    { label: "Travellers", value: `${sent.travelers} ${sent.travelers === 1 ? "adult" : "adults"}` },
    ...(dep ? [{ label: "Estimate", value: `≈ ${formatINR(dep.price * sent.travelers)} · GST included` }] : []),
    ...(sent.phone ? [{ label: "Mobile", value: sent.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2") }] : []),
    { label: "Email", value: sent.email },
  ];

  return (
    <>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-4">
          <Kicker>All done · no payment yet</Kicker>
          <h1 className="m-0 type-display">Request sent</h1>
          <p className="m-0 max-w-[52ch] type-body-l">
            Thanks, {firstName}. Your seat request for {tripName} is in. We call you within 24 hours. No payment yet.
          </p>
        </div>
        <section aria-label="Seat request" className="ticket-surface flex flex-col">
          <div className="flex items-center justify-between rounded-t-[4.5px] bg-passport px-5 py-3.5 text-on-passport">
            <span className="font-mono text-[12px] font-semibold tracking-[0.08em]">SEAT REQUEST</span>
            <span className="font-mono text-[12px] font-semibold tracking-[0.08em]">{sent.code}</span>
          </div>
          <div className="flex flex-col gap-1.5 px-5 py-4">
            <span className="type-stub text-muted">Your reference</span>
            <span className="font-mono text-[28px] font-semibold leading-none">{sent.code}</span>
          </div>
          <TearLine />
          <dl className="m-0 flex flex-col gap-3 px-5 py-4">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                <dt className="type-stub text-muted">{r.label}</dt>
                <dd className="m-0 text-[15px] leading-[1.35]">{r.value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <dt className="type-stub text-muted">Status</dt>
              <dd className="m-0">
                <StatusBadge status="received" />
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {children}

      <section className="flex flex-col gap-4 rounded-ticket border-2 border-dashed border-tear p-6">
        <h2 className="m-0 type-h3">Follow it from your phone</h2>
        <p className="m-0 max-w-[60ch] type-body text-muted">
          Sign in or create an account with {sent.email} to track it. Every status change shows up in My trips.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/sign-in?next=/my-trips" className={buttonClasses()}>
            Track it in My trips →
          </Link>
          <TextLink href="/trips">Browse more trips</TextLink>
        </div>
      </section>

      <p className="m-0 type-small text-muted">
        Need to change something? Write to <a href="mailto:support@ghumbo.com">support@ghumbo.com</a> and quote {sent.code}.
      </p>
    </>
  );
}
