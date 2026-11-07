/*
 * Facts the legal pages (terms, privacy, cancellation) and their summaries
 * elsewhere read from. Business details come from the env (the backend's
 * GHUMBO_* keys, mirrored as NEXT_PUBLIC_*); the policy numbers are decisions,
 * kept here so every page quotes the same ones.
 */

const fromEnv = (value: string | undefined, fallback: string) => value?.trim() || fallback;

/** Who runs Ghumbo. The founder is also the Grievance Officer. */
export const business = {
  name: fromEnv(process.env.NEXT_PUBLIC_GHUMBO_COMPANY_NAME, "Ghumbo"),
  address: fromEnv(process.env.NEXT_PUBLIC_GHUMBO_ADDRESS, "Kolkata, West Bengal, India"),
  /** Not GST-registered yet; set NEXT_PUBLIC_GHUMBO_GSTIN once it is and the pages print it. */
  gstin: process.env.NEXT_PUBLIC_GHUMBO_GSTIN?.trim() || null,
  founder: fromEnv(process.env.NEXT_PUBLIC_GHUMBO_FOUNDER_NAME, "Our founder"),
};

/** "Ghumbo", or "Wander Pvt Ltd (“Ghumbo”)" once the registered name differs from the brand. */
export const operator = business.name === "Ghumbo" ? "Ghumbo" : `${business.name} (“Ghumbo”)`;

/** Shown as "Updated …" on all three pages. Change it whenever a policy changes. */
export const LEGAL_UPDATED = { iso: "2026-11-06", label: "6 November 2026" };

export const legalLinks = {
  terms: { label: "Terms of use", short: "Terms", href: "/terms" },
  privacy: { label: "Privacy policy", short: "Privacy", href: "/privacy" },
  cancellation: { label: "Cancellation policy", short: "Cancellation", href: "/cancellation-policy" },
};

/**
 * What we keep when a traveller cancels a paid trip, by days left before the
 * first day of the trip. The rest is refunded.
 */
export const CANCELLATION_CHARGES = [
  { when: "30 days or more before departure", keep: 10 },
  { when: "15 to 29 days before", keep: 50 },
  { when: "7 to 14 days before", keep: 75 },
  { when: "Less than 7 days before, or not turning up", keep: 100 },
] as const;

/** Working days to send a refund once a cancellation is confirmed. */
export const REFUND_WORKING_DAYS = 7;

/** One paragraph for FAQs and summaries; the policy page has the detail. */
export const cancellationSummary =
  "Nothing is charged until you pay, so withdrawing a request costs nothing. Once paid, we keep 10% of the trip cost if you cancel 30 or more days before departure, 50% at 15 to 29 days, 75% at 7 to 14 days, and everything after that, and refund the rest within 7 working days. Seats can't be passed to someone else. If we cancel, you choose a full refund or a free move to another date.";
