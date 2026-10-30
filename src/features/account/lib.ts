import type { BadgeTone } from "@/components/ui/badge";
import type { StampTone } from "@/components/ui/stamp";
import type { BookingRequestStatus, UserBookingRequest } from "@/features/booking-requests/types";
import type { User } from "@/features/auth/types";
import { formatINR, formatTicketDate, pad2 } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Request status                                                      */
/* ------------------------------------------------------------------ */

type StatusMeta = {
  label: string;
  tone: BadgeTone;
  /** Rotated stamp on the request page; closed states get a flat badge instead. */
  stamp?: StampTone;
};

export const STATUS: Record<BookingRequestStatus, StatusMeta> = {
  new: { label: "Request received", tone: "tint", stamp: "passport" },
  contacted: { label: "We called you", tone: "outline", stamp: "passport" },
  in_progress: { label: "Confirming", tone: "few", stamp: "amber" },
  converted: { label: "Booked", tone: "open", stamp: "green" },
  closed: { label: "Closed", tone: "muted" },
  withdrawn: { label: "Withdrawn", tone: "muted" },
};

/** The four steps of "Where it stands", in order. Closed and withdrawn sit outside them. */
export const STEPS: { status: BookingRequestStatus; body: (r: UserBookingRequest) => string }[] = [
  {
    status: "new",
    body: (r) =>
      `You asked for ${r.travelerCount} ${r.travelerCount === 1 ? "seat" : "seats"} on the ${formatShortDate(r.startDate)} departure.`,
  },
  { status: "contacted", body: () => "We call you to go over the trip, rooms and dates." },
  {
    status: "in_progress",
    body: () => "We check rooms for your dates, then call again with the deposit details.",
  },
  {
    status: "converted",
    body: () => "A deposit confirms your seats. Your trip pack follows 7 days before departure.",
  },
];

/** One line under each card: what happens next at this status. */
export function statusLine(r: UserBookingRequest) {
  switch (r.status) {
    case "new":
      return "We’ll call you within 24 hours.";
    case "contacted":
      return "We called and talked you through the trip. Waiting for your go-ahead.";
    case "in_progress":
      return `We’re checking rooms for your ${travellers(r.travelerCount)}. Expect a call with the deposit details.`;
    case "converted":
      return "Seat booked. Your trip pack arrives 7 days before you leave.";
    case "closed":
      return "This request is closed.";
    case "withdrawn":
      return "You withdrew this request.";
  }
}

export const canWithdraw = (status: BookingRequestStatus) =>
  status === "new" || status === "contacted" || status === "in_progress";

/* ------------------------------------------------------------------ */
/* Grouping: Requests · Upcoming · Past                                */
/* ------------------------------------------------------------------ */

export type TripGroups = { requests: UserBookingRequest[]; upcoming: UserBookingRequest[]; past: UserBookingRequest[] };

/** `today` is YYYY-MM-DD. Anything whose trip has ended, or that was closed/withdrawn, is past. */
export function groupRequests(list: UserBookingRequest[], today: string): TripGroups {
  const groups: TripGroups = { requests: [], upcoming: [], past: [] };
  for (const r of list) {
    const ended = r.endDate.slice(0, 10) < today;
    if (ended || r.status === "closed" || r.status === "withdrawn") groups.past.push(r);
    else if (r.status === "converted") groups.upcoming.push(r);
    else groups.requests.push(r);
  }
  const byStart = (a: UserBookingRequest, b: UserBookingRequest) => a.startDate.localeCompare(b.startDate);
  groups.requests.sort(byStart);
  groups.upcoming.sort(byStart);
  groups.past.sort((a, b) => b.startDate.localeCompare(a.startDate));
  return groups;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function travellers(n: number) {
  return `${n} ${n === 1 ? "adult" : "adults"}`;
}

/** "SAT 26 DEC → TUE 29 DEC 2026" */
export function dateRange(r: Pick<UserBookingRequest, "startDate" | "endDate">) {
  return `${formatTicketDate(r.startDate)} → ${formatTicketDate(r.endDate, { year: true })}`;
}

/** "4D / 3N", from the departure's own dates. */
export function daysNights(r: Pick<UserBookingRequest, "startDate" | "endDate">) {
  const nights = Math.round((Date.parse(r.endDate.slice(0, 10)) - Date.parse(r.startDate.slice(0, 10))) / 86_400_000);
  return nights > 0 ? `${nights + 1}D / ${nights}N` : null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sat 26 Dec" (with year: "Sat 26 Dec 2026"). Date-only strings use their UTC parts. */
export function formatShortDate(value: string, { year = false } = {}) {
  const d = new Date(value);
  const base = `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return year ? `${base} ${d.getUTCFullYear()}` : base;
}

/** "Oct 2026", in the traveller's own time zone. */
export function formatMonthYear(value: string) {
  const d = new Date(value);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** A timestamp in the traveller's own time zone: "11 OCT · 17:05". */
export function formatStamp(value: string) {
  const d = new Date(value);
  return `${pad2(d.getDate())} ${MONTHS[d.getMonth()].toUpperCase()} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** "₹18,998", or with another currency code "USD 18,998". The backend sends codes in lowercase ("inr"). */
export function formatMoney(amount: number, currency: string) {
  const code = currency.toUpperCase();
  if (code === "INR") return formatINR(amount);
  return `${code} ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

/** "+919830012345" → "+91 98300 12345". */
export function formatPhone(phone: string) {
  const m = /^\+91(\d{5})(\d{5})$/.exec(phone);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

const mrzPart = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[^A-Za-z ]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "<");

/**
 * Passport-style code strip, decoration only:
 * "G<INDSEN<<RIYA<<<<<<<<<<" / "GH2610RS<<<<<<<<<<<<<<<<" (account month + initials).
 */
export function machineLines(user: User, initials: string) {
  const surname = user.lastName.trim() || user.firstName;
  const given = user.lastName.trim() ? user.firstName : "";
  const width = 28;
  const fill = (s: string) => (s + "<".repeat(width)).slice(0, width);
  const created = new Date(user.createdAt);
  const stamp = `${String(created.getFullYear()).slice(2)}${pad2(created.getMonth() + 1)}`;
  return [fill(`G<IND${mrzPart(surname)}<<${mrzPart(given)}`), fill(`GH${stamp}${initials}`)];
}
