"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Kicker } from "@/components/ui/section-header";
import { RoundStamp } from "@/components/ui/stamp";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { travellersLine } from "@/features/booking-requests/rooms";
import { useSentRequest } from "@/features/booking-requests/sent";
import { shortName, startYear } from "@/features/tours/mappers";
import type { Departure } from "@/features/tours/types";
import { formatINR, pad2 } from "@/lib/format";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** ISO → "11 OCT · 14:20", in the traveller's own time zone. */
function sentStamp(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

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
  const firstName = sent.firstName;
  const field = "flex min-w-0 flex-col gap-2";
  const label = "type-stub text-muted";
  const mono = "m-0 font-mono text-[16px] font-semibold leading-[1.2] tracking-[0.02em]";
  const text = "m-0 text-[16px] font-semibold leading-[1.35]";

  return (
    <>
      <section aria-labelledby="h-sent" className="ticket-surface flex flex-col">
        <div className="flex items-center justify-between rounded-t-[4.5px] bg-passport px-5 py-3.5 text-on-passport">
          <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em]">SEAT REQUEST</span>
          <Logo tone="stock" ground="var(--g-passport)" className="w-[96px]" />
        </div>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6 p-5 md:p-8">
          {dep && (
            <div className="flex flex-none justify-center p-3">
              <RoundStamp top="Request sent" middle={dep.start.replace(/^\w+ /, "")} bottom={sent.code} />
            </div>
          )}
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Kicker>All done · no payment yet</Kicker>
              <h1 id="h-sent" className="m-0 type-h1">
                Request sent
              </h1>
            </div>
            <p className="m-0 max-w-[52ch] type-body-l">
              Thanks, {firstName}. Your seat request for {shortName(tripName)} is in. We call you within 24 hours. No payment
              yet.
            </p>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
              <span className="flex flex-col gap-2">
                <span className={label}>Your reference</span>
                <span className="font-mono text-[28px] font-semibold leading-none tracking-[0.02em]">{sent.code}</span>
              </span>
              <span className="pb-0.5 font-mono text-[12px] font-medium leading-[1.2] tracking-[0.08em] text-muted">
                SENT {sentStamp(sent.sentAt)}
              </span>
            </div>
          </div>
        </div>
        <TearLine />
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-5 px-5 pt-6 pb-8 md:grid-cols-3 md:px-8">
          <div className={`${field} col-span-2 md:col-span-1`}>
            <dt className={label}>Trip</dt>
            <dd className={text}>{tripName}</dd>
          </div>
          <div className={`${field} col-span-2 md:col-span-1`}>
            <dt className={label}>Dates</dt>
            <dd className={mono}>
              {dep ? `${dep.start} → ${dep.end.replace(/ \d{4}$/, "")} ${startYear(dep)}` : "Confirmed on the call"}
            </dd>
          </div>
          <div className={field}>
            <dt className={label}>Travellers</dt>
            <dd className={text}>{travellersLine(sent.travelers)}</dd>
          </div>
          {dep && (
            <div className={field}>
              <dt className={label}>Estimate</dt>
              <dd className={text}>≈ {formatINR(dep.price * sent.travelers)} · GST included</dd>
            </div>
          )}
          {sent.phone && (
            <div className={field}>
              <dt className={label}>Mobile</dt>
              <dd className={`${mono} whitespace-nowrap`}>{sent.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2")}</dd>
            </div>
          )}
          <div className={`${field} col-span-2 md:col-span-1`}>
            <dt className={label}>Email</dt>
            <dd className={`${text} [overflow-wrap:anywhere]`}>{sent.email}</dd>
          </div>
          <div className={`${field} col-span-2 md:col-span-1`}>
            <dt className={label}>Status</dt>
            <dd className="m-0 flex flex-wrap gap-1.5">
              <StatusBadge status="received" />
              <Badge tone="outline">No payment yet</Badge>
            </dd>
          </div>
        </dl>
      </section>

      {children}

      <div className="flex flex-col gap-6">
        <section aria-label="Track your request" className="ticket-surface flex flex-col md:flex-row">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-5 md:p-8">
            <h2 className="m-0 type-h3">Follow it from your phone</h2>
            <p className="m-0 type-body text-muted">
              Sign in or create an account with {sent.email} to track it. Every status change shows up in My trips.
            </p>
          </div>
          <TearLine orientation="vertical" className="hidden md:block" />
          <TearLine className="md:hidden" />
          <div className="flex flex-col justify-center gap-3 p-5 md:w-[340px] md:flex-none md:p-8">
            <Link href="/my-trips" className={buttonClasses({ fullWidth: true })}>
              Track it in My trips →
            </Link>
            <Link href="/trips" className={buttonClasses({ variant: "secondary", fullWidth: true })}>
              Browse more trips
            </Link>
          </div>
        </section>
        <p className="m-0 text-[14px] leading-[1.45] text-muted">
          Need to change something? Write to <a href="mailto:support@ghumbo.com">support@ghumbo.com</a> and quote {sent.code}.
        </p>
      </div>
    </>
  );
}
