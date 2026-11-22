"use client";

import { Hourglass, RefreshCw, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Kicker } from "@/components/ui/section-header";
import { TearLine } from "@/components/ui/tear-line";
import { TextLink } from "@/components/ui/text-link";
import { buttonClasses } from "@/components/ui/variants";
import { supportEmail, supportPhone } from "@/config/site";
import { useSignedInUser } from "@/features/account/hooks";
import { dateRange, formatShortDate } from "@/features/account/lib";
import type { User } from "@/features/auth/types";
import {
  BookingStrip,
  MoneyLeftNote,
  PickAnotherDate,
  TripLine,
} from "@/features/bookings/components/booking-parts";
import { HoldBanner } from "@/features/bookings/components/hold-banner";
import { PayButton } from "@/features/bookings/components/pay-button";
import { useMyBooking, useNow } from "@/features/bookings/hooks";
import {
  amountLabel,
  bookingHref,
  bookingView,
  calendarHref,
  paymentMethodLabel,
  daysUntil,
  firstNames,
  rebookHref,
  refundPreview,
} from "@/features/bookings/lib";
import type { UserBooking } from "@/features/bookings/types";
import { shortName } from "@/features/tours/mappers";
import { useToday } from "@/lib/use-today";

/** After this long still unpaid, the confirming screen says it's taking a while. */
const SLOW_MS = 45_000;

/**
 * B09 · B09b · B09c. What Razorpay said (`returned`) only decides what to show
 * while we wait; the booking's own status, set by the webhook, is the truth.
 */
export function PaymentResult({ bookingId, returned }: { bookingId: string; returned: "success" | "failed" }) {
  const user = useSignedInUser(`/trips/${encodeURIComponent(bookingId)}/payment?status=${returned}`);
  // Paid: check every 2s for the webhook. Failed: every 5s, in case the bank clears it late.
  const { result, retry } = useMyBooking(bookingId, Boolean(user), returned === "success" ? 2000 : 5000);
  const now = useNow();

  if (!user || result.status === "loading" || now === null) {
    return returned === "success" ? <Confirming /> : <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (result.status === "error") {
    return result.notFound ? (
      <EmptyState
        icon={<SearchX size={22} aria-hidden />}
        title="We can’t find that booking"
        action={
          <Link href="/my-trips" className={buttonClasses({ variant: "secondary", size: "m" })}>
            Go to My trips
          </Link>
        }
      >
        It isn’t on this account. If you paid, check the email you booked with, or find it under My trips.
      </EmptyState>
    ) : (
      <EmptyState
        icon={<RefreshCw size={22} aria-hidden />}
        title="We couldn’t check your booking"
        action={
          <button type="button" onClick={retry} className={buttonClasses({ variant: "secondary", size: "m" })}>
            Try again
          </button>
        }
      >
        If you paid, your money is safe and your booking confirms on its own. This one’s on our side.
      </EmptyState>
    );
  }

  const b = result.data;
  const view = bookingView(b, now);
  if (view === "confirmed") return <Success booking={b} user={user} />;
  if (view === "expired") return <Expired booking={b} />;
  if (returned === "success") return <Confirming booking={b} user={user} />;
  return <Failed booking={b} onGone={retry} />;
}

/* ------------------------------------------------------------------ */
/* B09 · confirming                                                    */
/* ------------------------------------------------------------------ */

function Confirming({ booking: b, user }: { booking?: UserBooking; user?: User }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <section role="status" aria-live="polite" className="mx-auto flex max-w-[640px] flex-col items-center gap-5 py-10 text-center md:py-16">
      <span className="inline-flex size-16 items-center justify-center rounded-full border-[1.5px] border-line bg-card text-link">
        <Hourglass size={28} strokeWidth={1.75} aria-hidden className="motion-safe:animate-pulse" />
      </span>
      <Kicker>Payment received · confirming with the bank</Kicker>
      <h1 className="m-0 type-h1">Hang tight. Locking in your seats.</h1>
      <p className="m-0 max-w-[48ch] type-body-l text-muted">
        {slow
          ? `This is taking longer than usual. You don’t need to wait here: we’ll email ${user?.email ?? "you"} the moment it clears, and it shows in My trips.`
          : `This usually takes a few seconds. Please don’t refresh or pay again. If it takes longer, we’ll email ${user?.email ?? "you"} the moment it clears.`}
      </p>
      {b && (
        <div className="flex flex-col items-center gap-1 rounded-ticket border-[1.5px] border-line bg-card px-6 py-4">
          <TripLine booking={b} className="font-mono text-[13px] font-semibold uppercase tracking-[0.02em]" />
          <span className="type-price-m">{amountLabel(b)}</span>
        </div>
      )}
      <TextLink href={b ? bookingHref(b) : "/my-trips"}>Taking too long? Check My trips</TextLink>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* B09 · success                                                       */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;
const shift = (iso: string, days: number) => formatShortDate(new Date(Date.parse(iso.slice(0, 10)) + days * DAY).toISOString());

function Success({ booking: b, user }: { booking: UserBooking; user: User }) {
  const today = useToday();
  const name = shortName(b.tripName);
  const refund = today ? refundPreview(b, today) : null;
  const far = today ? daysUntil(b.startDate, today) > 30 : true;
  const steps = [
    {
      when: "Right now",
      title: "Check your inbox",
      body: `A confirmation from trips@ and a receipt with your invoice from billing@${user.email ? `, both to ${user.email}` : ""}.`,
    },
    ...(far
      ? [{ when: `Before ${shift(b.startDate, -28)}`, title: "Book your train or flight", body: "Prices only go up from here." }]
      : []),
    {
      when: shift(b.startDate, -7),
      title: "Trip pack lands",
      body: "Pickup point, your coordinator’s number and a packing list that remembers the woollens.",
    },
    { when: formatShortDate(b.startDate), title: "Just show up", body: "Your coordinator meets you at the station." },
  ];

  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <section aria-labelledby="ok-h" className="ticket-surface flex flex-col overflow-hidden md:flex-row">
        <div className="flex flex-col justify-between gap-6 bg-passport px-6 py-6 text-on-passport md:w-60 md:py-8">
          <span className="font-mono text-[12px] font-semibold tracking-[0.1em]">BOARDING PASS</span>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[12px] tracking-[0.08em] text-flap">PAID IN FULL</span>
            <span className="text-[34px] font-extrabold leading-none [font-stretch:120%]">Confirmed</span>
          </div>
          <span className="font-mono text-[14px] font-semibold tracking-[0.06em]">{b.code}</span>
        </div>
        <TearLine orientation="vertical" className="hidden md:block" />
        <TearLine className="md:hidden" />
        <div className="flex min-w-0 flex-1 flex-col gap-5 px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-2">
            <Kicker>{amountLabel(b)} paid · seats locked</Kicker>
            <h1 id="ok-h" className="m-0 type-h1">
              Pack your bags. You’re going to {name}.
            </h1>
            <p className="m-0 max-w-[60ch] type-body text-muted">
              Booking {b.code} is confirmed. Your receipt and invoice are on their way
              {user.email ? ` to ${user.email}` : ""}, and your trip pack arrives 7 days before you leave.
            </p>
          </div>
          <dl className="m-0 grid gap-4 sm:grid-cols-3">
            <Fact label="Dates">{dateRange(b)}</Fact>
            <Fact label="Travellers">{firstNames(b)}</Fact>
            <Fact label="Paid">
              {amountLabel(b)}
              {paymentMethodLabel(b.paymentMethod) && ` · ${paymentMethodLabel(b.paymentMethod)}`}
            </Fact>
          </dl>
          <div className="flex flex-wrap gap-3">
            <Link href={bookingHref(b)} className={buttonClasses()}>
              View my booking →
            </Link>
            <a href={calendarHref(b)} download={`ghumbo-${b.code}.ics`} className={buttonClasses({ variant: "secondary" })}>
              Add to calendar
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="next-h" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Kicker>Nothing to plan</Kicker>
          <h2 id="next-h" className="m-0 type-h2">
            Here’s what happens now
          </h2>
        </div>
        <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2 rounded-ticket border-[1.5px] border-line bg-card px-5 py-4">
              <span className="font-mono text-[12px] font-semibold tracking-[0.06em] text-red">
                {String(i + 1).padStart(2, "0")} · {s.when.toUpperCase()}
              </span>
              <span className="type-h4">{s.title}</span>
              <span className="type-small text-muted">{s.body}</span>
            </li>
          ))}
        </ol>
        <p className="m-0 type-small text-muted">
          Plans changed? Cancel from My trips
          {refund && refund.backPercent > 0 && refund.lastDay ? `: ${refund.backPercent}% back until ${refund.lastDay}` : ""}.
          Questions? <a href={`mailto:${supportEmail}`}>{supportEmail}</a>, quote {b.code}.
        </p>
      </section>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 font-mono text-[14px] font-semibold uppercase leading-[1.35] tracking-[0.02em]">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B09b · failed                                                       */
/* ------------------------------------------------------------------ */

function Failed({ booking: b, onGone }: { booking: UserBooking; onGone: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7">
      <HoldBanner expiresAt={b.expiresAt} />
      <div className="flex flex-col gap-3">
        <Kicker>Payment pending · nothing was charged</Kicker>
        <h1 className="m-0 type-h1">Payment didn’t go through.</h1>
        <p className="m-0 max-w-[54ch] type-body-l text-muted">
          Happens to the best of us: a UPI timeout, a bank hiccup, a back button pressed too soon. Your seats are still held,
          so give it another go. Try a different UPI app or card in the checkout if this one keeps saying no.
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <PayButton booking={b} label={`Retry payment · ${amountLabel(b)} →`} onGone={onGone} />
        <span className="font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-muted">
          Takes you to Razorpay’s secure checkout
        </span>
      </div>
      <BookingStrip booking={b}>
        <Link href={bookingHref(b)} className="min-h-11 py-3 text-[15px] font-semibold text-link">
          See it in My trips
        </Link>
      </BookingStrip>
      <MoneyLeftNote />
      <p className="m-0 type-small text-muted">
        If the timer runs out, the seats go back on sale and you’ll need a new booking. Stuck?{" "}
        {supportPhone ? <a href={supportPhone.href}>Call {supportPhone.display}</a> : <a href={`mailto:${supportEmail}`}>Write to {supportEmail}</a>}.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B09c · expired                                                      */
/* ------------------------------------------------------------------ */

function Expired({ booking: b }: { booking: UserBooking }) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7">
      <div className="flex flex-col gap-3">
        <Kicker>00:00 · Booking expired · nothing charged</Kicker>
        <h1 className="m-0 type-h1">This booking has expired.</h1>
        <p className="m-0 max-w-[54ch] type-body-l text-muted">
          Your 10 minutes ran out before the payment went through, so we released the seats. Good news: they’re still up
          for grabs. Start a new booking and it’s ready to pay.
        </p>
      </div>
      <BookingStrip booking={b} />
      <div className="flex flex-col items-start gap-2">
        <Link href={rebookHref(b)} className={buttonClasses({ variant: "danger", className: "h-14 text-[17px]" })}>
          Create a new booking →
        </Link>
        <span className="font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-muted">
          Same trip, date &amp; travellers
        </span>
      </div>
      <p className="m-0 type-small text-muted">
        Seats gone by the time you get there? We’ll show you the nearest dates. Or <PickAnotherDate booking={b} /> yourself.
      </p>
    </div>
  );
}
