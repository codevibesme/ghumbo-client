"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/variants";
import { dateRange, formatShortDate, formatStamp } from "@/features/account/lib";
import { shortName } from "@/features/tours/mappers";
import { cn } from "@/lib/cn";
import { amountLabel, bookingHref, cancelledRefund, daysUntil, departsIn, firstNames, travellersWord } from "../lib";
import type { UserBooking } from "../types";
import { HoldClock } from "./hold-banner";
import { PayButton } from "./pay-button";

/** T12 · an unpaid booking with its hold running: timer, details link and Pay. */
export function PendingCard({ booking: b, onGone }: { booking: UserBooking; onGone: () => void }) {
  return (
    <article
      aria-label="Unfinished booking"
      className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-ticket border-[1.5px] border-line bg-[color-mix(in_srgb,var(--g-flap)_18%,var(--g-card))] px-5 py-[18px]"
    >
      <span className="inline-flex h-[26px] items-center rounded-chip bg-flap px-2.5 font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.04em] text-board">
        Payment pending
      </span>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <h3 className="m-0 text-[17px] font-bold leading-[1.25]">
          {shortName(b.tripName)} · {formatShortDate(b.startDate)}
        </h3>
        <p className="m-0 text-[14px] leading-[1.4] text-muted">
          {b.code} · nothing charged yet. {b.travelerCount === 1 ? "Seat" : "Seats"} held for{" "}
          <HoldClock expiresAt={b.expiresAt} className="text-[14px] text-ink" />, then{" "}
          {b.travelerCount === 1 ? "it goes" : "they go"} back on sale.
        </p>
      </div>
      <Link href={bookingHref(b)} className="inline-flex min-h-11 items-center px-1 text-[15px] font-semibold text-link">
        Details
      </Link>
      <PayButton booking={b} size="m" label={`Pay ${amountLabel(b)}`} onGone={onGone} />
    </article>
  );
}

function CardFact({ label, mono, children }: { label: string; mono?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className={cn("m-0 text-[15px] font-semibold leading-[1.3]", mono && "font-mono")}>{children}</dd>
    </div>
  );
}

/** T12 · a paid booking: navy strip (code, booked, countdown), trip and dates, facts, then a footer with the next step. */
export function BookingCard({ booking: b, today, past }: { booking: UserBooking; today: string; past?: boolean }) {
  const packDay = formatShortDate(new Date(Date.parse(b.startDate.slice(0, 10)) - 7 * 86_400_000).toISOString());
  return (
    <article aria-labelledby={`b-${b.id}`} className="overflow-hidden rounded-ticket border-[1.5px] border-line bg-card">
      <div className="flex flex-wrap justify-between gap-3 bg-passport px-5 py-3 font-mono text-[12px] font-semibold leading-none tracking-[0.08em] text-on-passport">
        <span>
          {b.code} · BOOKED {formatStamp(b.createdAt).split(" · ")[0]}
        </span>
        {!past && <span className="text-flap">{departsIn(b.startDate, today)}</span>}
      </div>
      <div className="flex flex-col gap-[18px] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h3 id={`b-${b.id}`} className="m-0 text-[26px] font-extrabold leading-[1.1] [font-stretch:115%]">
              {b.tripName}
            </h3>
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[15px] font-semibold leading-[1.3]">{dateRange(b)}</span>
              {b.isPeak && <Badge tone="peak">Peak</Badge>}
            </span>
          </div>
          <span className="flex flex-col items-end gap-2">
            <Badge tone={past ? "muted" : "open"} className="h-7 px-2.5">
              {past ? "Travelled" : "Confirmed · paid"}
            </Badge>
            {b.refundStatus && <RefundLine booking={b} />}
          </span>
        </div>
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          <CardFact label="Travellers">{firstNames(b)}</CardFact>
          <CardFact label="Paid" mono>
            {amountLabel(b)}
          </CardFact>
          {!past && <CardFact label="Trip pack">{daysUntil(b.startDate, today) > 7 ? `Lands ${packDay}` : `Sent ${packDay}`}</CardFact>}
        </dl>
      </div>
      <div aria-hidden className="border-t-2 border-dashed border-tear" />
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 md:px-6">
        <span className="flex-[1_1_260px] text-[14px] leading-[1.45] text-muted">
          {past ? "Hope it was a good one." : "Nothing to do till then."}
        </span>
        <Link href={bookingHref(b)} className={buttonClasses({ className: "h-12 px-5 text-[15px]" })}>
          View booking →
        </Link>
      </div>
    </article>
  );
}

/** T12 · "Didn't go through": an expired hold, one line with a way to book again. */
export function MissedRow({ booking: b }: { booking: UserBooking }) {
  return (
    <article className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-ticket border-[1.5px] border-tear bg-card px-5 py-[18px]">
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2.5">
          <Badge tone="muted">Expired</Badge>
          <span className="text-[16px] font-bold leading-[1.25]">
            {shortName(b.tripName)} · {formatShortDate(b.startDate)}
          </span>
        </span>
        <span className="font-mono text-[12px] font-medium uppercase leading-[1.3] tracking-[0.04em] text-muted">
          {b.code} · hold ended {formatStamp(b.expiresAt).replace(" · ", " ")} · nothing charged
        </span>
        {b.refundStatus && <RefundLine booking={b} />}
      </div>
      <Link href={bookingHref(b)} className="inline-flex min-h-11 items-center px-1 text-[15px] font-semibold text-link">
        Details
      </Link>
    </article>
  );
}

/** T12 · "Recently cancelled": struck-through trip, when it was cancelled, and where the refund is. */
export function CancelledRow({ booking: b }: { booking: UserBooking }) {
  const refund = cancelledRefund(b);
  return (
    <article className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-ticket border-[1.5px] border-tear bg-card px-5 py-[18px]">
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <span className="text-[16px] font-bold leading-[1.25] text-muted line-through">
          {shortName(b.tripName)} · {formatShortDate(b.startDate)}
        </span>
        <span className="font-mono text-[12px] font-medium uppercase leading-[1.3] tracking-[0.04em] text-muted">
          {b.code}
          {b.cancelledAt && ` · cancelled ${formatShortDate(b.cancelledAt)}`} · {travellersWord(b.travelerCount)}
        </span>
      </div>
      <span className="flex flex-col items-end gap-1">
        <span className={cn("font-mono text-[16px] font-bold leading-none", refund.back > 0 ? "text-green" : "text-muted")}>
          {refund.headline}
        </span>
        <span className="text-[13px] leading-[1.3] text-muted">{refund.detail}</span>
      </span>
      <Link href={bookingHref(b)} className="inline-flex min-h-11 items-center px-1 text-[15px] font-semibold text-link">
        Details
      </Link>
    </article>
  );
}

/** A refund in flight or done (late payment with no seats left, or a cancellation). */
function RefundLine({ booking: b }: { booking: UserBooking }) {
  const amount = b.refundAmount ? amountLabel({ amount: b.refundAmount, currency: b.currency }) : "Your money";
  const text =
    b.refundStatus === "processed"
      ? `${amount} refunded`
      : b.refundStatus === "failed"
        ? "Refund stuck: we’re on it"
        : `${amount} refund on its way`;
  return <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.04em] text-green">{text}</span>;
}
