"use client";

import { Check, Lock, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { buttonClasses } from "@/components/ui/variants";
import { CANCELLATION_CHARGES } from "@/config/legal";
import { supportEmail } from "@/config/site";
import { useSignedInUser } from "@/features/account/hooks";
import { formatPhone } from "@/features/account/lib";
import { fullName } from "@/features/auth/session";
import type { User } from "@/features/auth/types";
import { TravelerForm } from "@/features/travelers/components/traveler-form";
import { type TravelersLoad, useMyTravelers } from "@/features/travelers/hooks";
import { isAccountHolder, travelerName, travelerShortMeta } from "@/features/travelers/lib";
import type { Traveler } from "@/features/travelers/types";
import type { Departure } from "@/features/tours/types";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatINR, pad2 } from "@/lib/format";
import { useToday } from "@/lib/use-today";
import { createBooking, getAllMyBookings, retryPayment } from "../api";
import { openRazorpay, paymentResultHref, razorpayKeyId, ulid } from "../checkout";
import { bookingHref } from "../lib";
import type { PaymentOrder } from "../types";
import { HoldBanner } from "./hold-banner";

/** Most travellers on one booking; the date's seats left can lower it. */
const MAX_TRAVELLERS = 8;

const HOLD_MS = 10 * 60 * 1000;

type Errors = Partial<Record<"travellers" | "consent" | "form", ReactNode>>;

/** One numbered card: big passport-blue number, title, optional mono aside on the right. */
function Step({ n, title, aside, children }: { n: number; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="ticket-surface flex flex-col gap-4 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-[28px] font-extrabold leading-none text-link [font-stretch:115%]">{pad2(n)}</span>
        <h2 className="m-0 text-[22px] font-extrabold leading-[1.15] [font-stretch:115%]">{title}</h2>
        {aside && <span className="ml-auto">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export type CheckoutTrip = {
  slug: string;
  name: string;
  /** "4D / 3N" */
  length: string;
  image: { src: string; alt: string } | null;
  /** "NJP / IXB" */
  from: string | null;
};

/**
 * B08 checkout: tick travellers (saved to the account), check where the
 * receipt goes, agree to the refund rules, pay. Paying holds the seats for 10
 * minutes and hands off to Razorpay's page in this tab (B08b).
 */
export function CheckoutForm({
  trip,
  departure,
  initialTravellers,
}: {
  trip: CheckoutTrip;
  departure: Departure;
  /** Traveller ids to tick, from "Create a new booking" (?travellers=a,b). */
  initialTravellers: string[];
}) {
  const user = useSignedInUser(`/trips/${trip.slug}/book?departure=${encodeURIComponent(departure.id)}`);
  const router = useRouter();
  const formId = useId();
  const travellers = useMyTravelers(user);
  const [picked, setPicked] = useState<string[] | null>(null);
  const [e, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  // Set once the booking exists: its seats are held while Razorpay's panel is open, and after it's closed.
  const [held, setHeld] = useState<{ bookingId: string; expiresAt: string } | null>(null);
  const bookingId = useRef<string | null>(null);

  const max = Math.max(0, Math.min(MAX_TRAVELLERS, departure.seatsLeft));
  // Until the traveller ticks someone: the ids handed over, else the account holder.
  const selected = picked ?? firstPick(travellers.result, user, initialTravellers, max);
  const count = selected.length;
  const totalAmount = departure.price * count;

  /** Opens Razorpay's panel on this page. Paid → the result page; closed → back here with the hold. */
  function pay(order: PaymentOrder, user: User) {
    return openRazorpay(order, prefill(user), trip.name, {
      paid: () => router.push(paymentResultHref(order.bookingId)),
      dismissed: () => setPending(false),
    });
  }

  /** Pay again after closing the panel: same booking, a fresh order from the backend (which checks the hold). */
  async function reopen(user: User, bookingId: string) {
    setPending(true);
    setErrors({});
    try {
      await pay(await retryPayment(bookingId), user);
    } catch (err) {
      setPending(false);
      // Hold over or already paid: the booking page shows which.
      if (err instanceof ApiError && err.status === 409) return router.push(bookingHref({ id: bookingId }));
      setErrors({ form: openError(err) });
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || pending) return;
    if (held) return reopen(user, held.bookingId);
    const errors = checkErrors(count, max, new FormData(event.currentTarget).get("consent") === "on");
    if (Object.keys(errors).length) return setErrors(errors);

    setPending(true);
    setErrors({});
    // One id per attempt, so a double tap or a retry after a network blip can't book twice.
    bookingId.current ??= ulid();
    let order: PaymentOrder;
    try {
      order = await createBooking({ id: bookingId.current, departureId: departure.id, travelerIds: selected });
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError) bookingId.current = null;
      if (err instanceof ApiError && err.status === 409 && /active booking/i.test(err.message)) {
        // A booking for this date is already waiting for payment: open it.
        const mine = await getAllMyBookings().catch(() => []);
        const open = mine.find((b) => b.departureId === departure.id && b.status === "pending");
        if (open) return router.push(bookingHref(open));
      }
      return setErrors(bookingError(err));
    }
    setHeld({ bookingId: order.bookingId, expiresAt: new Date(Date.now() + HOLD_MS).toISOString() });
    try {
      await pay(order, user);
    } catch (err) {
      setPending(false);
      setErrors({ form: openError(err) });
    }
  }

  if (max === 0 && !held) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-ticket border-2 border-dashed border-tear px-6 py-8">
        <h2 className="m-0 type-h3">Sold out. Join the next one.</h2>
        <p className="m-0 type-body text-muted">Every seat on {departure.start} is taken. Other dates may still have room.</p>
        <Link href={`/trips/${trip.slug}#departures`}>Pick another date →</Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 min-[960px]:grid-cols-[minmax(0,1fr)_400px]">
      {held && !pending && (
        <HoldBanner expiresAt={held.expiresAt} className="min-[960px]:col-span-2">
          Closed Razorpay? Your seats are still yours. Tap Pay to pick up where you left off.
        </HoldBanner>
      )}
      <form id={formId} onSubmit={onSubmit} noValidate aria-label="Checkout" className="flex min-w-0 flex-col gap-6">
        {/* Once the booking exists its travellers are locked; Pay reopens Razorpay for the same booking. */}
        <fieldset disabled={Boolean(held)} className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
          <TravellersStep
            user={user}
            travellers={travellers}
            selected={selected}
            max={max}
            error={e.travellers}
            onChange={(ids) => {
              setErrors((prev) => ({ ...prev, travellers: undefined }));
              setPicked(ids);
            }}
          />

          <Step n={2} title="Where we send the good stuff">
            <p className="m-0 text-[15px] leading-normal text-muted">
              Your receipt, invoice and trip pack go here. Your coordinator texts this number on day one.
            </p>
            <dl className="m-0 flex flex-wrap gap-x-8 gap-y-3">
              <ContactFact label="Email">{user?.email ?? <span className="text-muted">Not added</span>}</ContactFact>
              <ContactFact label="Mobile">
                {user?.phone ? <span className="font-mono">{formatPhone(user.phone)}</span> : <span className="text-muted">Not added</span>}
              </ContactFact>
              <Link href="/profile" className="self-end py-3 text-[14px] font-semibold leading-none text-link">
                Change
              </Link>
            </dl>
          </Step>

          <RefundStep errors={e} />
        </fieldset>
      </form>

      <div className="flex w-full flex-col gap-4 min-[960px]:sticky min-[960px]:top-6">
        <TicketSummary trip={trip} departure={departure} count={count}>
          <div className="flex flex-col gap-3 px-5 pb-5">
            <button
              type="submit"
              form={formId}
              disabled={pending || !user}
              className={buttonClasses({ variant: "danger", fullWidth: true, className: "h-14 text-[17px]" })}
            >
              {pending ? (held ? "Opening Razorpay…" : "Holding your seats…") : count ? `Pay ${formatINR(totalAmount)}` : "Pick your travellers"}
            </button>
            <PayNote />
          </div>
        </TicketSummary>
      </div>
    </div>
  );
}

const prefill = (u: User) => ({ name: fullName(u), email: u.email, contact: u.phone });

/** Who's ticked before the traveller touches anything. */
function firstPick(result: TravelersLoad, user: User | null, handedOver: string[], max: number) {
  if (result.status !== "ready" || !user) return [];
  const wanted = new Set(handedOver);
  const pick = handedOver.length ? result.data.filter((t) => wanted.has(t.id)) : result.data.filter((t) => isAccountHolder(t, user));
  return pick.map((t) => t.id).slice(0, max);
}

function checkErrors(count: number, max: number, consent: boolean): Errors {
  const errors: Errors = {};
  if (count === 0) errors.travellers = "Tick at least one traveller.";
  else if (count > max) errors.travellers = `Only ${max} ${max === 1 ? "seat is" : "seats are"} left on this date.`;
  if (!consent) errors.consent = "Tick this to continue.";
  if (!razorpayKeyId) errors.form = `Payments are switched off right now. Write to ${supportEmail} and we’ll sort it.`;
  return errors;
}

/** checkout.js didn't load or the order couldn't be fetched again. */
function openError(err: unknown) {
  return err instanceof ApiError
    ? `We couldn’t open the payment just now. Try again in a moment, or write to ${supportEmail}.`
    : "Razorpay’s checkout didn’t open. Check your connection and tap Pay again.";
}

/** POST /billings/bookings failures, in words. */
function bookingError(err: unknown): Errors {
  if (!(err instanceof ApiError)) return { form: "We couldn’t reach Ghumbo. Check your connection and try again." };
  if (err.status === 409 && /active booking/i.test(err.message)) {
    return {
      form: (
        <>
          You already have a booking for this date waiting for payment. <Link href="/my-trips">Find it in My trips</Link>.
        </>
      ),
    };
  }
  if (err.status === 409) return { travellers: "Not enough seats left on this date for everyone. Untick someone or pick another date." };
  if (err.status === 404) return { form: "This date isn’t open for booking any more. Pick another date." };
  if (err.status === 401) return { form: "Your session ended. Sign in again to book." };
  return { form: `We couldn’t start your booking just now. Try again in a minute, or write to ${supportEmail}.` };
}

/** 01 · tick saved travellers, or add one (saved to the account). */
function TravellersStep({
  user,
  travellers,
  selected,
  max,
  error,
  onChange,
}: {
  user: User | null;
  travellers: ReturnType<typeof useMyTravelers>;
  selected: string[];
  max: number;
  error: ReactNode;
  onChange: (ids: string[]) => void;
}) {
  const today = useToday();
  const [adding, setAdding] = useState(false);
  const ticked = new Set(selected);
  const full = selected.length >= max;
  const { result } = travellers;

  const added = (t: Traveler) => {
    travellers.add(t);
    setAdding(false);
    if (!full) onChange([...selected, t.id]);
  };

  return (
    <Step
      n={1}
      title="Travellers"
      aside={
        <span className="font-mono text-[12px] font-medium uppercase leading-none tracking-[0.06em] text-muted">
          {selected.length} selected
        </span>
      }
    >
      {!user || !today || result.status === "loading" ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <span className="sr-only">Loading your travellers…</span>
          {[0, 1].map((i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-ticket border-[1.5px] border-rule bg-sunk" />
          ))}
        </div>
      ) : result.status === "error" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="type-small text-muted">We couldn’t load your saved travellers.</span>
          <Button size="m" variant="secondary" onClick={travellers.retry}>
            <RefreshCw size={16} aria-hidden /> Try again
          </Button>
        </div>
      ) : (
        <>
          {result.data.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-label="Saved travellers">
              {result.data.map((t) => (
                <li key={t.id}>
                  <TravellerTick
                    traveller={t}
                    today={today}
                    you={isAccountHolder(t, user)}
                    checked={ticked.has(t.id)}
                    disabled={!ticked.has(t.id) && full}
                    onToggle={() => onChange(ticked.has(t.id) ? selected.filter((x) => x !== t.id) : [...selected, t.id])}
                  />
                </li>
              ))}
            </ul>
          )}
          {adding || result.data.length === 0 ? (
            <TravelerForm today={today} onCancel={result.data.length ? () => setAdding(false) : undefined} onSaved={added} />
          ) : (
            <Button variant="secondary" size="m" className="self-start border-dashed bg-transparent" onClick={() => setAdding(true)}>
              <Plus size={18} aria-hidden /> Add a traveller
            </Button>
          )}
          {error && (
            <p role="alert" className="m-0 type-small text-red">
              {error}
            </p>
          )}
        </>
      )}
    </Step>
  );
}

const BANDS = ["30+ days out", "15–29 days", "7–14 days", "Under 7 days"];

/** 03 · the refund table, consent, and any form-level error. */
function RefundStep({ errors: e }: { errors: Errors }) {
  return (
    <Step n={3} title="If plans change">
      <dl className="m-0 grid grid-cols-2 overflow-hidden rounded-ticket border-[1.5px] border-line md:grid-cols-4">
        {CANCELLATION_CHARGES.map((c, i) => (
          <div
            key={c.when}
            className={cn(
              "flex flex-col gap-1.5 p-3.5",
              i % 2 === 0 && "border-r-[1.5px] border-line",
              i < 2 && "max-md:border-b-[1.5px]",
              i === 1 && "md:border-r-[1.5px]",
            )}
          >
            <dt className="font-mono text-[11px] font-medium uppercase leading-[1.2] tracking-[0.06em] text-muted">{BANDS[i]}</dt>
            <dd className={cn("m-0 text-[20px] font-extrabold leading-none", c.keep === 100 ? "text-red" : "text-link")}>
              {c.keep === 100 ? "No refund" : `${100 - c.keep}% back`}
            </dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-[14px] leading-normal text-muted">
        Cancel any time from My trips. Seats can’t be passed to someone else. If we cancel, you get every rupee back or a free
        move to another date.
      </p>
      <div className="flex flex-col gap-1">
        <Checkbox name="consent" aria-invalid={e.consent ? true : undefined}>
          I’ve read the{" "}
          <Link href="/terms" target="_blank">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/cancellation-policy" target="_blank">
            Cancellation policy
          </Link>
          .
        </Checkbox>
        {e.consent && <span className="type-small text-red">{e.consent}</span>}
      </div>
      {e.form && (
        <p role="alert" className="m-0 type-small text-red [&_a]:text-link [&_a]:underline">
          {e.form}
        </p>
      )}
    </Step>
  );
}

function PayNote() {
  return (
    <>
      <p className="m-0 text-center text-[13px] leading-[1.45] text-muted">
        Razorpay’s secure checkout opens right here. Your seats are held for 10 minutes.
      </p>
      <p className="m-0 flex flex-wrap items-center justify-center gap-1.5 text-center font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.06em] text-muted">
        <Lock size={14} aria-hidden />
        Secure payment · UPI, card, netbanking ·{" "}
        <Link href="/cancellation-policy" className="text-link">
          Refund rules →
        </Link>
      </p>
    </>
  );
}

function TravellerTick({
  traveller: t,
  today,
  you,
  checked,
  disabled,
  onToggle,
}: {
  traveller: Traveler;
  today: string;
  you: boolean;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-center gap-3.5 rounded-ticket border-[1.5px] border-line bg-card px-4 py-3",
        checked && "border-passport bg-passport-tint",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-chip border-[1.5px] border-line bg-card peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-passport",
          checked && "border-passport bg-passport text-on-passport",
        )}
      >
        {checked && <Check size={16} strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[16px] font-bold leading-[1.2]">{travelerName(t)}</span>
        <span className="font-mono text-[12px] font-medium leading-[1.2] tracking-[0.04em] text-muted">{travelerShortMeta(t, today)}</span>
      </span>
      {you && <Badge tone="tint" className="ml-auto">You</Badge>}
    </label>
  );
}

function ContactFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 break-words text-[16px] font-semibold leading-[1.3]">{children}</dd>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  muted,
  mono,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", strong && "border-t-[1.5px] border-line pt-3", muted && "text-muted")}>
      <dt className={strong ? "text-[18px] font-extrabold leading-none" : "text-[15px] leading-[1.3]"}>{label}</dt>
      <dd
        className={cn(
          "m-0 text-right",
          strong ? "text-[30px] font-extrabold leading-none [font-stretch:110%]" : "text-[15px] leading-[1.3]",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** The ticket beside the form: trip, dates, seats, price × travellers, total. */
function TicketSummary({
  trip,
  departure,
  count,
  children,
}: {
  trip: CheckoutTrip;
  departure: Departure;
  count: number;
  children: ReactNode;
}) {
  return (
    <aside aria-label="Your trip" className="ticket-surface flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 rounded-t-[4.5px] bg-passport px-5 py-3.5 text-on-passport">
        <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em]">YOUR TICKET</span>
        <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em] text-flap">{trip.length}</span>
      </div>
      <div className="flex flex-col gap-3.5 p-5">
        <h2 className="m-0 text-[24px] font-extrabold leading-[1.1] [font-stretch:115%]">{trip.name}</h2>
        <dl className="m-0 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <dt className="type-stub text-muted">Depart</dt>
            <dd className="m-0 font-mono text-[15px] font-semibold leading-[1.2]">{departure.start}</dd>
            {(trip.from || departure.departTime) && (
              <dd className="m-0 text-[13px] leading-[1.3] text-muted">
                {[trip.from, departure.departTime].filter(Boolean).join(" · ")}
              </dd>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <dt className="type-stub text-muted">Return</dt>
            <dd className="m-0 font-mono text-[15px] font-semibold leading-[1.2]">{departure.end.replace(/ \d{4}$/, "")}</dd>
            {departure.returnTime && <dd className="m-0 text-[13px] leading-[1.3] text-muted">Drop by {departure.returnTime}</dd>}
          </div>
        </dl>
      </div>
      <div aria-hidden className="mx-5 border-t-2 border-dashed border-tear" />
      <dl className="m-0 flex flex-col gap-2.5 p-5">
        <SummaryRow
          label={`${formatINR(departure.price)} × ${count} ${count === 1 ? "traveller" : "travellers"}`}
          value={formatINR(departure.price * count)}
          mono
        />
        <SummaryRow label="Taxes" value="Included" muted />
        <SummaryRow label="Booking fee" value="₹0" muted />
        <SummaryRow label="Total" value={formatINR(departure.price * count)} strong />
        <span className="font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.06em] text-muted">Per person, twin sharing</span>
      </dl>
      {children}
    </aside>
  );
}
