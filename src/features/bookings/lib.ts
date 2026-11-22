import type { BadgeTone } from "@/components/ui/badge";
import { CANCELLATION_CHARGES } from "@/config/legal";
import { formatMoney, formatShortDate } from "@/features/account/lib";
import { pad2 } from "@/lib/format";
import type { UserBooking } from "./types";

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

/** What a booking shows as. An unpaid booking past its hold reads as expired even before the sweeper runs. */
export type BookingView = "pending" | "confirmed" | "expired" | "cancelled";

export function bookingView(b: Pick<UserBooking, "status" | "expiresAt">, now: number): BookingView {
  if (b.status === "pending" && Date.parse(b.expiresAt) <= now) return "expired";
  return b.status;
}

export const VIEW_META: Record<BookingView, { label: string; tone: BadgeTone }> = {
  pending: { label: "Payment pending", tone: "few" },
  confirmed: { label: "Confirmed · paid", tone: "open" },
  expired: { label: "Expired", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "muted" },
};

/* ------------------------------------------------------------------ */
/* Hold timer                                                          */
/* ------------------------------------------------------------------ */

/** Whole seconds left on the hold, never negative. */
export const secondsLeft = (expiresAt: string, now: number) => Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));

/** 412 → "06:52". */
export const clock = (seconds: number) => `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`;

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

export const total = (b: Pick<UserBooking, "amount">) => Number(b.amount);

export const perPerson = (b: Pick<UserBooking, "amount" | "travelerCount">) =>
  b.travelerCount > 0 ? Number(b.amount) / b.travelerCount : Number(b.amount);

export const money = (amount: number, currency: string) => formatMoney(amount, currency);

/** The booking total: "₹23,397". */
export const amountLabel = (b: Pick<UserBooking, "amount" | "currency">) => formatMoney(Number(b.amount), b.currency);

/* ------------------------------------------------------------------ */
/* Cancellation preview (config/legal.ts holds the numbers)            */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;

/** Whole days from `today` (YYYY-MM-DD) to the first day of the trip. */
export function daysUntil(startDate: string, today: string) {
  return Math.round((Date.parse(startDate.slice(0, 10)) - Date.parse(today)) / DAY);
}

/** The share kept if cancelled today, from CANCELLATION_CHARGES: 30+ → 10, 15–29 → 50, 7–14 → 75, under 7 → 100. */
export function keepPercent(days: number) {
  const [d30, d15, d7, late] = CANCELLATION_CHARGES;
  if (days >= 30) return d30.keep;
  if (days >= 15) return d15.keep;
  if (days >= 7) return d7.keep;
  return late.keep;
}

/**
 * Refund if cancelled today (YYYY-MM-DD), and the last day this band holds:
 * "90% back until Wed 17 Feb". `lastDay` is null once nothing comes back.
 */
export function refundPreview(b: Pick<UserBooking, "amount" | "startDate">, today: string) {
  const days = daysUntil(b.startDate, today);
  const keep = keepPercent(days);
  const back = Math.round((total(b) * (100 - keep)) / 100);
  const floor = days >= 30 ? 30 : days >= 15 ? 15 : days >= 7 ? 7 : null;
  const lastDay =
    floor === null ? null : formatShortDate(new Date(Date.parse(b.startDate.slice(0, 10)) - floor * DAY).toISOString());
  return { days, keep, back, backPercent: 100 - keep, lastDay, nextBackPercent: floor === null ? null : 100 - keepPercent(floor - 1) };
}

/**
 * Where a cancelled booking's refund stands, in the words My trips and the
 * booking page use. `back` is 0 when it was cancelled under 7 days out.
 */
export function cancelledRefund(b: Pick<UserBooking, "refundAmount" | "refundStatus" | "refundedAt" | "currency" | "paymentMethod">) {
  const back = Number(b.refundAmount ?? 0);
  const to = `your ${paymentMethodLabel(b.paymentMethod) ?? "account"}`;
  const amount = money(back, b.currency);
  if (back <= 0) return { back, badge: "Cancelled", headline: "No refund", detail: "Cancelled under 7 days out", to };
  if (b.refundStatus === "processed") {
    const on = b.refundedAt ? ` on ${formatShortDate(b.refundedAt)}` : "";
    return { back, badge: "Cancelled · refunded", headline: `${amount} refunded`, detail: `To ${to}${on}`, to };
  }
  if (b.refundStatus === "failed") {
    return { back, badge: "Cancelled · refund stuck", headline: `${amount} refund`, detail: "Stuck: we’re on it", to };
  }
  return { back, badge: "Cancelled · refund on its way", headline: `${amount} on its way`, detail: `To ${to} in 5–7 working days`, to };
}

/** "What changed?" in the cancel dialog (T13b). Sent as the cancellation reason. */
export const CANCEL_REASONS = [
  "Couldn’t get leave",
  "Found another date",
  "Health or family",
  "Budget",
  "Something else",
] as const;

/* ------------------------------------------------------------------ */
/* My trips grouping                                                    */
/* ------------------------------------------------------------------ */

export type BookingGroups = {
  pending: UserBooking[];
  upcoming: UserBooking[];
  /** Expired bookings for dates that haven't passed: "Didn't go through". */
  missed: UserBooking[];
  past: UserBooking[];
  /** Cancelled by the traveller, newest first: "Recently cancelled". */
  cancelled: UserBooking[];
};

export function groupBookings(list: UserBooking[], today: string, now: number): BookingGroups {
  const groups: BookingGroups = { pending: [], upcoming: [], missed: [], past: [], cancelled: [] };
  for (const b of list) {
    if (b.status === "cancelled") {
      groups.cancelled.push(b);
      continue;
    }
    const ended = b.endDate.slice(0, 10) < today;
    const view = bookingView(b, now);
    if (ended) {
      if (view === "confirmed") groups.past.push(b);
    } else if (view === "pending") groups.pending.push(b);
    else if (view === "confirmed") groups.upcoming.push(b);
    else groups.missed.push(b);
  }
  const byStart = (a: UserBooking, b: UserBooking) => a.startDate.localeCompare(b.startDate);
  groups.pending.sort(byStart);
  groups.upcoming.sort(byStart);
  groups.missed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  groups.past.sort((a, b) => b.startDate.localeCompare(a.startDate));
  groups.cancelled.sort((a, b) => (b.cancelledAt ?? b.updatedAt).localeCompare(a.cancelledAt ?? a.updatedAt));
  return groups;
}

/* ------------------------------------------------------------------ */
/* Links and lines                                                     */
/* ------------------------------------------------------------------ */

export const bookingHref = (b: Pick<UserBooking, "id">) => `/my-trips/${encodeURIComponent(b.id)}`;

/** Checkout for the same trip, date and travellers: "Create a new booking". */
export function rebookHref(b: Pick<UserBooking, "tripSlug" | "departureId" | "travelers">) {
  const q = new URLSearchParams({ departure: b.departureId, travellers: b.travelers.map((t) => t.id).join(",") });
  return `/trips/${b.tripSlug}/book?${q}`;
}

/** "Riya, Arjun, Meera". */
export const firstNames = (b: Pick<UserBooking, "travelers">) => b.travelers.map((t) => t.firstName.trim()).join(", ");

export const travellersWord = (n: number) => `${n} ${n === 1 ? "traveller" : "travellers"}`;

/** Days until departure as "DEPARTS IN 118 DAYS" / "DEPARTS TOMORROW" / "DEPARTS TODAY". */
export function departsIn(startDate: string, today: string) {
  const d = daysUntil(startDate, today);
  if (d <= 0) return "DEPARTS TODAY";
  if (d === 1) return "DEPARTS TOMORROW";
  return `DEPARTS IN ${d} DAYS`;
}


/** "Add to calendar": an all-day .ics event for the trip, as a data: URL (B09). */
export function calendarHref(b: Pick<UserBooking, "code" | "tripName" | "tripSlug" | "startDate" | "endDate">) {
  const day = (iso: string, plus = 0) =>
    new Date(Date.parse(iso.slice(0, 10)) + plus * 86_400_000).toISOString().slice(0, 10).replaceAll("-", "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ghumbo//Trips//EN",
    "BEGIN:VEVENT",
    `UID:${b.code}@ghumbo.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${day(b.startDate)}`,
    // DTEND is exclusive for all-day events.
    `DTEND;VALUE=DATE:${day(b.endDate, 1)}`,
    `SUMMARY:${b.tripName.replace(/[,;]/g, "\\$&")} · Ghumbo`,
    `DESCRIPTION:Booking ${b.code}. https://ghumbo.com/trips/${b.tripSlug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

const METHOD_LABEL: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Netbanking",
  wallet: "Wallet",
  emi: "EMI",
  paylater: "Pay later",
};

/** "upi" → "UPI"; unknown methods are shown as Razorpay sends them; null when not recorded. */
export function paymentMethodLabel(method: string | null | undefined) {
  if (!method) return null;
  return METHOD_LABEL[method.toLowerCase()] ?? method;
}
