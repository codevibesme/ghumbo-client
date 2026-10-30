export type NavKey = "trips" | "destinations" | "how-it-works" | "my-trips";

/** Main nav: exactly Trips · Destinations · How it works (no Departures item). */
export const mainNav: { key: NavKey; label: string; href: string }[] = [
  { key: "trips", label: "Trips", href: "/trips" },
  { key: "destinations", label: "Destinations", href: "/destinations" },
  { key: "how-it-works", label: "How it works", href: "/how-it-works" },
];

export const footerTagline = "Just show up. Fixed-date group trips across India.";

export const supportEmail = "support@ghumbo.com";

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
