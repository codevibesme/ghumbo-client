export type NavKey = "trips" | "destinations" | "how-it-works" | "my-trips";

/** Main nav: exactly Trips · Destinations · How it works (no Departures item). */
export const mainNav: { key: NavKey; label: string; href: string }[] = [
  { key: "trips", label: "Trips", href: "/trips" },
  { key: "destinations", label: "Destinations", href: "/destinations" },
  { key: "how-it-works", label: "How it works", href: "/how-it-works" },
];

export const footerTagline = "Just show up. Fixed-date group trips across India.";

/** From NEXT_PUBLIC_GHUMBO_SUPPORT_EMAIL (the backend's GHUMBO_SUPPORT_EMAIL); support@ghumbo.com if unset. */
export const supportEmail = process.env.NEXT_PUBLIC_GHUMBO_SUPPORT_EMAIL?.trim() || "support@ghumbo.com";


/**
 * Support phone from NEXT_PUBLIC_GHUMBO_PHONE (the backend's GHUMBO_PHONE).
 * Stored as E.164 ("+919830012345"); spaces are tolerated. `display` is
 * "+91 98300 12345", `href` a tel: link. Null when unset, so callers drop the
 * sentence rather than show a placeholder.
 */
export const supportPhone = (() => {
  const digits = (process.env.NEXT_PUBLIC_GHUMBO_PHONE ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const e164 = `+${digits}`;
  const m = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return { e164, display: m ? `+91 ${m[1]} ${m[2]}` : e164, href: `tel:${e164}` };
})();

const darjeeling = { label: "Darjeeling", href: "/trips/darjeeling-queen-of-the-hills-budget" };
const westBengal = { label: "West Bengal", href: "/destinations/west-bengal" };
const andaman = { label: "Andaman Islands", href: "/destinations/andaman-islands" };
const allTrips = { label: "All trips", href: "/trips" };
const howItWorks = { label: "How it works", href: "/how-it-works" };
const faq = { label: "FAQ", href: "/how-it-works#faq" };
const email = { label: supportEmail, href: `mailto:${supportEmail}` };

/**
 * Footer link columns (desktop). The design also lists About / Contact /
 * Terms / Privacy (pages not planned).
 */
export const footerColumns = [
  { title: "Trips", links: [westBengal, andaman, darjeeling, allTrips] },
  { title: "Company", links: [howItWorks] },
  { title: "Help", links: [faq, email] },
];

/** Compact footer order on phones (two columns, read across). */
export const footerCompactLinks = [allTrips, howItWorks, westBengal, faq, darjeeling, email];
