import type { User } from "@/features/auth/types";
import { formatINR, formatTicketDate, pad2 } from "@/lib/format";

/** Anything with a trip's first and last day (bookings). */
type Dated = { startDate: string; endDate: string };

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function travellers(n: number) {
  return `${n} ${n === 1 ? "adult" : "adults"}`;
}

/** "SAT 26 DEC → TUE 29 DEC 2026" */
export function dateRange(r: Dated) {
  return `${formatTicketDate(r.startDate)} → ${formatTicketDate(r.endDate, { year: true })}`;
}

/** "4D / 3N", from the departure's own dates. */
export function daysNights(r: Dated) {
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
const WHOLE_NUMBER = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatMoney(amount: number, currency: string) {
  const code = currency.toUpperCase();
  if (code === "INR") return formatINR(amount);
  return `${code} ${WHOLE_NUMBER.format(amount)}`;
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
