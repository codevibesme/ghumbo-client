"use client";

import { RefreshCw, SearchX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { supportEmail, supportPhone } from "@/config/site";
import { useSignedInUser } from "@/features/account/hooks";
import { formatStamp } from "@/features/account/lib";
import { HoldClock } from "@/features/bookings/components/hold-banner";
import { PayButton } from "@/features/bookings/components/pay-button";
import { useMyBooking, useNow } from "@/features/bookings/hooks";
import {
  VIEW_META,
  amountLabel,
  bookingView,
  firstNames,
  rebookHref,
} from "@/features/bookings/lib";
import type { UserBooking } from "@/features/bookings/types";
import { formatTicketDate } from "@/lib/format";
import { useToday } from "@/lib/use-today";
import { ConfirmedBooking } from "./confirmed-booking";

export function BookingDetail({ id }: { id: string }) {
  const user = useSignedInUser(`/my-trips/${encodeURIComponent(id)}`);
  // Unpaid bookings are re-read every 5s, so a payment that clears (or a hold that ends) shows without a refresh.
  const { result, retry } = useMyBooking(id, Boolean(user), 5000);
  const now = useNow();
  const today = useToday();

  const crumbs = (code?: string) => <Breadcrumb items={[{ label: "My trips", href: "/my-trips" }, { label: code ?? "Booking" }]} />;

  if (!user || result.status === "loading" || now === null || !today) {
    return (
      <>
        {crumbs()}
        <div className="flex min-h-[60vh] flex-col gap-6" aria-busy="true">
          <span className="sr-only">Loading your booking…</span>
          <div className="h-24 w-2/3 animate-pulse rounded-ticket bg-rule" />
          <div className="h-72 animate-pulse rounded-ticket border-[1.5px] border-rule bg-card" />
        </div>
      </>
    );
  }

  if (result.status === "error") {
    return (
      <>
        {crumbs()}
        {result.notFound ? (
          <EmptyState
            icon={<SearchX size={22} aria-hidden />}
            title="We can’t find that booking"
            action={
              <Link href="/my-trips" className={buttonClasses({ variant: "secondary", size: "m" })}>
                Back to my trips
              </Link>
            }
          >
            It isn’t one of your bookings. Find it under My trips, or check you’re signed in with the right account.
          </EmptyState>
        ) : (
          <EmptyState
            icon={<RefreshCw size={22} aria-hidden />}
            title="We couldn’t load this booking"
            action={
              <button type="button" onClick={retry} className={buttonClasses({ variant: "secondary", size: "m" })}>
                Try again
              </button>
            }
          >
            Your booking is safe. This one’s on our side; give it a moment and try again.
          </EmptyState>
        )}
      </>
    );
  }

  const b = result.data;
  const view = bookingView(b, now);
  return (
    <>
      {crumbs(b.code)}
      {view === "pending" && <Pending booking={b} onGone={retry} />}
      {view === "confirmed" && <ConfirmedBooking booking={b} today={today} />}
      {view === "expired" && <Expired booking={b} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* T13c · payment pending                                              */
/* ------------------------------------------------------------------ */

function Pending({ booking: b, onGone }: { booking: UserBooking; onGone: () => void }) {
  return (
    <>
      <section aria-labelledby="trip-h" className="flex flex-col rounded-ticket border-[1.5px] border-line bg-card">
        <div className="flex flex-wrap justify-between gap-3 rounded-t-[4.5px] border-b-[1.5px] border-line bg-flap px-5 py-3.5 text-board">
          <span className="font-mono text-[12px] font-semibold tracking-[0.08em]">ON HOLD · {b.code}</span>
          <span className="font-mono text-[14px] font-bold tracking-[0.06em]">
            SEATS HELD FOR <HoldClock expiresAt={b.expiresAt} />
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6 p-5 md:p-7">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
            <Badge tone={VIEW_META.pending.tone}>{VIEW_META.pending.label}</Badge>
            <h1 id="trip-h" className="m-0 type-h1">
              {b.tripName}
            </h1>
            <p className="m-0 max-w-[52ch] type-body-l text-muted">
              Not booked yet: nothing’s been charged. Pay before the timer runs out and the seats are yours. After that, they
              go back on sale.
            </p>
          </div>
          <div className="flex flex-[0_1_320px] flex-col items-stretch gap-2.5">
            <HoldClock expiresAt={b.expiresAt} className="text-center text-[48px] leading-none md:text-[56px]" />
            <PayButton booking={b} fullWidth label={`Pay ${amountLabel(b)}`} onGone={onGone} />
            <span className="text-center font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
              Takes you to Razorpay’s secure checkout
            </span>
          </div>
        </div>
        <TearLine />
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-5 px-5 pt-5 pb-6 md:grid-cols-4 md:px-7">
          <Fact label="Dates" mono>
            {formatTicketDate(b.startDate)} → {formatTicketDate(b.endDate)}
          </Fact>
          <Fact label="Travellers">{firstNames(b)}</Fact>
          <Fact label="To pay" mono>
            {amountLabel(b)}
          </Fact>
          <Fact label="Started" mono>
            {formatStamp(b.createdAt)}
          </Fact>
        </dl>
      </section>
      <p className="m-0 text-[14px] leading-normal text-muted">
        Money left your account but this still says pending? Give it a minute; we confirm automatically. Otherwise it comes
        back in 5–7 working days. Questions?{" "}
        {supportPhone ? <a href={supportPhone.href}>{supportPhone.display}</a> : <a href={`mailto:${supportEmail}`}>{supportEmail}</a>}.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* T13d · expired                                                      */
/* ------------------------------------------------------------------ */

function Expired({ booking: b }: { booking: UserBooking }) {
  const late = b.refundStatus !== null;
  return (
    <>
      <section aria-labelledby="trip-h" className="flex flex-col overflow-hidden rounded-ticket border-[1.5px] border-tear bg-card">
        <div className="flex flex-wrap justify-between gap-3 bg-rule px-5 py-3.5">
          <span className="font-mono text-[12px] font-semibold tracking-[0.08em]">
            {b.code} · STARTED {formatStamp(b.createdAt)}
          </span>
          <span className="font-mono text-[12px] font-semibold tracking-[0.08em]">
            HOLD ENDED {formatStamp(b.expiresAt).split(" · ")[1]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6 p-5 md:p-7">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
            <Badge tone="muted">{late ? "Expired · refund on its way" : "Expired · nothing charged"}</Badge>
            <h1 id="trip-h" className="m-0 type-h1">
              {b.tripName}
            </h1>
            <p className="m-0 max-w-[52ch] type-body-l text-muted">
              {late
                ? `Your payment came in after the hold ended and the seats had gone, so the full ${amountLabel(b)} is on its way back to you.`
                : `The 10 minutes ran out before payment went through, so the ${b.travelerCount === 1 ? "seat" : "seats"} went back on sale. This booking can’t be paid any more, but a new one takes two taps.`}
            </p>
          </div>
          <div className="flex flex-[0_1_320px] flex-col items-stretch gap-2.5">
            <Link href={rebookHref(b)} className={buttonClasses({ variant: "danger", fullWidth: true, className: "h-14 text-[17px]" })}>
              Create a new booking →
            </Link>
            <span className="text-center font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-muted">
              Same trip, date &amp; {b.travelerCount === 1 ? "traveller" : "travellers"}
            </span>
          </div>
        </div>
        <TearLine />
        <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-5 px-5 pt-5 pb-6 md:grid-cols-4 md:px-7">
          <Fact label="Dates" mono>
            {formatTicketDate(b.startDate)} → {formatTicketDate(b.endDate)}
          </Fact>
          <Fact label={b.travelerCount === 1 ? "Traveller" : "Travellers"}>{firstNames(b)}</Fact>
          <Fact label="Amount" mono>
            {amountLabel(b)} · {late ? "REFUNDING" : "NOT CHARGED"}
          </Fact>
          <Fact label="Destination">{b.destinationName}</Fact>
        </dl>
      </section>
      <p className="m-0 type-small text-muted">
        Money left your account for this one? It comes back automatically in 5–7 working days. Still missing after that?
        Write to <a href={`mailto:${supportEmail}`}>{supportEmail}</a> and quote {b.code}.
      </p>
    </>
  );
}

function Fact({ label, mono, children }: { label: string; mono?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className={mono ? "m-0 font-mono text-[15px] font-semibold leading-[1.3]" : "m-0 text-[15px] font-semibold leading-[1.35]"}>
        {children}
      </dd>
    </div>
  );
}
