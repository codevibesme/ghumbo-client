/**
 * Copy rules from the Ticket system (B · Colour, type, parts → Badges):
 *   seats ≥ 7 → "14 OPEN", 2–6 → "04 LEFT", 1 → "LAST SEAT", 0 → "SOLD OUT"
 *   captions beside seat squares → "14 OF 18 OPEN" / "04 OF 18 LEFT"
 * Counts are always two digits, zero-padded.
 */

export const FEW_SEATS = 6;

export type SeatState = "open" | "few" | "last" | "soldOut";

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function seatState(left: number): SeatState {
  if (left <= 0) return "soldOut";
  if (left === 1) return "last";
  if (left <= FEW_SEATS) return "few";
  return "open";
}

export function seatLabel(left: number) {
  switch (seatState(left)) {
    case "soldOut":
      return "Sold out";
    case "last":
      return "Last seat";
    case "few":
      return `${pad2(left)} left`;
    default:
      return `${pad2(left)} open`;
  }
}

export function seatCaption(left: number, total: number) {
  return left <= FEW_SEATS
    ? `${pad2(left)} of ${total} left`
    : `${pad2(left)} of ${total} open`;
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 7799 → "₹7,799"; 1299900 → "₹12,99,900" (Indian grouping). */
export function formatINR(amount: number) {
  return `₹${inr.format(amount)}`;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Date → "FRI 13 NOV" (or "FRI 13 NOV 2026" with year). Uses the date's UTC parts. */
export function formatTicketDate(date: Date | string, { year = false } = {}) {
  const d = typeof date === "string" ? new Date(date) : date;
  const base = `${WEEKDAYS[d.getUTCDay()]} ${pad2(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]}`;
  return year ? `${base} ${d.getUTCFullYear()}` : base;
}
