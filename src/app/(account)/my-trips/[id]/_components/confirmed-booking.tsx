"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/variants";
import { legalLinks } from "@/config/legal";
import { supportEmail, supportPhone } from "@/config/site";
import { formatShortDate, formatStamp } from "@/features/account/lib";
import { amountLabel, departsIn, money, paymentMethodLabel, perPerson, refundPreview, travellersWord } from "@/features/bookings/lib";
import type { UserBooking } from "@/features/bookings/types";
import { GENDER_LABEL, ageOn, travelerName } from "@/features/travelers/lib";
import { cn } from "@/lib/cn";
import { formatTicketDate } from "@/lib/format";

const DAY = 86_400_000;
const shift = (iso: string, days: number) => new Date(Date.parse(iso.slice(0, 10)) + days * DAY).toISOString();

const card = "rounded-ticket border-[1.5px] border-line bg-card";
const cardTitle = "m-0 text-[22px] font-extrabold leading-[1.15] [font-stretch:115%]";

/**
 * T13 · a paid booking: the boarding pass (dates, coordinator), travellers and
 * payment side by side, the countdown, and what cancelling today gives back.
 * Pickup point, stay, payment method and the invoice aren't in the booking
 * response yet, so those parts of the canvas are left out.
 */
export function ConfirmedBooking({ booking: b, today }: { booking: UserBooking; today: string }) {
  const refund = refundPreview(b, today);
  const ended = b.endDate.slice(0, 10) < today;
  const packDay = shift(b.startDate, -7);
  const countdown = [
    { when: formatStamp(b.createdAt).split(" · ")[0], what: "Booked & paid", done: true },
    ...(refund.lastDay && refund.backPercent > 0
      ? [{ when: refund.lastDay.toUpperCase(), what: `Last day for ${refund.backPercent}% back`, done: false }]
      : []),
    { when: formatShortDate(packDay).toUpperCase(), what: "Trip pack lands", done: packDay.slice(0, 10) <= today },
    { when: formatShortDate(b.startDate).toUpperCase(), what: "Just show up", done: b.startDate.slice(0, 10) <= today },
  ];

  return (
    <>
      <section aria-labelledby="trip-h" className={cn(card, "overflow-hidden")}>
        <div className="flex flex-wrap justify-between gap-3 bg-passport px-5 py-3.5 font-mono text-[12px] font-semibold leading-none tracking-[0.08em] text-on-passport">
          <span>BOARDING PASS · {b.code}</span>
          {!ended && <span className="text-flap">{departsIn(b.startDate, today)}</span>}
        </div>
        <div className="flex flex-col gap-5 p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2.5">
              <Badge tone={ended ? "muted" : "open"} className="h-7 self-start px-2.5">
                {ended ? "Travelled" : "Confirmed · paid in full"}
              </Badge>
              <h1 id="trip-h" className="m-0 text-[clamp(34px,4vw,48px)] font-extrabold leading-[1.02] tracking-[-0.02em] [font-stretch:125%]">
                {b.tripName}
              </h1>
            </div>
            <Link href={`/trips/${b.tripSlug}`} className="py-3.5 text-[15px] font-semibold leading-none text-link">
              Day-by-day plan →
            </Link>
          </div>
          <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
            <Fact label="Depart">
              <span className="font-mono text-[18px] font-semibold leading-[1.2]">{formatTicketDate(b.startDate)}</span>
            </Fact>
            <Fact label="Return">
              <span className="font-mono text-[18px] font-semibold leading-[1.2]">{formatTicketDate(b.endDate)}</span>
            </Fact>
            <Fact label="Destination">
              <span className="text-[15px] font-semibold leading-[1.35]">{b.destinationName}</span>
            </Fact>
            <Fact label="Coordinator">
              <span className="text-[15px] font-semibold leading-[1.35]">
                Name &amp; number in your trip pack ({formatShortDate(packDay)})
              </span>
            </Fact>
          </dl>
        </div>
      </section>

      <div className="grid items-start gap-6 md:grid-cols-2">
        <section aria-labelledby="who-h" className={cn(card, "flex flex-col gap-3 p-6")}>
          <h2 id="who-h" className={cardTitle}>
            Travellers · {b.travelerCount}
          </h2>
          <ul className="m-0 list-none p-0">
            {b.travelers.map((t) => (
              <li key={t.id} className="flex justify-between gap-3 border-t-[1.5px] border-dashed border-tear py-3">
                <span className="text-[16px] font-bold leading-[1.2]">{travelerName(t)}</span>
                <span className="font-mono text-[12px] font-medium leading-[1.3] text-muted">
                  {GENDER_LABEL[t.gender][0]} · {ageOn(t.dateOfBirth, b.startDate)}
                </span>
              </li>
            ))}
          </ul>
          <p className="m-0 text-[13px] leading-[1.45] text-muted">
            Spelling wrong? Fix it in <Link href="/profile#travellers">Saved travellers</Link>. Seats can’t be passed to someone
            else.
          </p>
        </section>

        <section aria-labelledby="paid-h" className={cn(card, "flex flex-col gap-3 p-6")}>
          <h2 id="paid-h" className={cardTitle}>
            Payment
          </h2>
          <div className="flex justify-between gap-3 text-[15px] leading-[1.3]">
            <span>
              {money(perPerson(b), b.currency)} × {travellersWord(b.travelerCount)}
            </span>
            <span className="font-mono">{amountLabel(b)}</span>
          </div>
          <div className="flex justify-between gap-3 text-[15px] leading-[1.3] text-muted">
            <span>Taxes</span>
            <span>Included</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t-[1.5px] border-line pt-3">
            <span className="text-[17px] font-extrabold leading-none">Paid</span>
            <span className="text-[26px] font-extrabold leading-none">{amountLabel(b)}</span>
          </div>
          {(b.paymentMethod || b.paymentReferenceId) && (
            <span className="font-mono text-[12px] font-medium leading-normal tracking-[0.04em] text-muted">
              {/* "UPI · REF pay_…": Razorpay ids are case-sensitive, so only the labels are in caps. */}
              {paymentMethodLabel(b.paymentMethod)?.toUpperCase()}
              {b.paymentMethod && b.paymentReferenceId && " · "}
              {b.paymentReferenceId && (
                <>
                  <span className="uppercase">Ref</span> {b.paymentReferenceId}
                </>
              )}
            </span>
          )}
        </section>
      </div>

      {!ended && (
        <section aria-labelledby="when-h" className={cn(card, "flex flex-col gap-4 p-6")}>
          <h2 id="when-h" className={cardTitle}>
            Countdown
          </h2>
          <ol className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
            {countdown.map((c) => (
              <li
                key={c.what}
                className={cn("flex flex-col gap-1.5 border-t-4 pt-3", c.done ? "border-passport" : "border-tear")}
              >
                <span className={cn("font-mono text-[12px] font-semibold leading-none tracking-[0.06em]", c.done ? "text-link" : "text-muted")}>
                  {c.when}
                  {c.done ? " · DONE" : ""}
                </span>
                <span className="text-[16px] font-bold leading-[1.25]">{c.what}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!ended && <PlansChanged booking={b} refund={refund} />}

      <p className="m-0 text-[14px] leading-normal text-muted">
        Questions?{" "}
        {supportPhone && (
          <>
            Call <a href={supportPhone.href}>{supportPhone.display}</a> or write
          </>
        )}
        {!supportPhone && "Write"} to <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and quote {b.code}.
      </p>
    </>
  );
}

/**
 * "Plans changed?": what cancelling today gives back. There's no cancel endpoint
 * yet, so "Cancel booking" opens an email to support with the code.
 */
function PlansChanged({ booking: b, refund }: { booking: UserBooking; refund: ReturnType<typeof refundPreview> }) {
  const back = money(refund.back, b.currency);
  return (
    <section
      aria-labelledby="change-h"
      className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-ticket border-[1.5px] border-dashed border-line p-6"
    >
      <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-2">
        <h2 id="change-h" className={cardTitle}>
          Plans changed?
        </h2>
        <p className="m-0 text-[15px] leading-[1.55] text-muted">
          {refund.backPercent > 0 ? (
            <>
              Cancel today and get <strong className="text-ink">{back} back</strong> ({refund.backPercent}%).
              {refund.lastDay && refund.nextBackPercent !== null && (
                <>
                  {" "}
                  That drops to {refund.nextBackPercent > 0 ? `${refund.nextBackPercent}%` : "nothing"} after {refund.lastDay}, so
                  don’t sit on it.
                </>
              )}
            </>
          ) : (
            "It’s under 7 days to go, so cancelling now doesn’t bring anything back."
          )}{" "}
          <Link href={legalLinks.cancellation.href}>Refund rules</Link>
        </p>
      </div>
      <a
        href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Cancel ${b.code}`)}`}
        className={buttonClasses({ variant: "destructive", className: "h-12 px-5 text-[15px]" })}
      >
        Cancel booking
      </a>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 flex flex-col gap-1">{children}</dd>
    </div>
  );
}
