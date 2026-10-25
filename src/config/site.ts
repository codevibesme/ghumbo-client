export type NavKey = "trips" | "destinations" | "how-it-works" | "my-trips";

/** Main nav: exactly Trips · Destinations · How it works (no Departures item). */
export const mainNav: { key: NavKey; label: string; href: string }[] = [
  { key: "trips", label: "Trips", href: "/trips" },
  { key: "destinations", label: "Destinations", href: "/destinations" },
  { key: "how-it-works", label: "How it works", href: "/how-it-works" },
];

/** Footer link columns (desktop). */
export const footerColumns = [
  {
    title: "Trips",
    links: [
      { label: "Darjeeling", href: "/trips/darjeeling-queen-of-the-hills-budget" },
      { label: "Sundarbans", href: "/trips/sundarbans-mangrove-tiger-safari-budget" },
      { label: "Kolkata", href: "/trips/kolkata-city-of-joy-heritage-budget" },
      { label: "All trips", href: "/trips" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQ", href: "/how-it-works#faq" },
      { label: "Contact", href: "/contact" },
      { label: "support@ghumbo.com", href: "mailto:support@ghumbo.com" },
    ],
  },
];

/** Compact footer order on phones (two columns, read across). */
export
const footerCompactLinks = [
  { label: "All trips", href: "/trips" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Darjeeling", href: "/trips/darjeeling-queen-of-the-hills-budget" },
  { label: "FAQ", href: "/how-it-works#faq" },
  { label: "Sundarbans", href: "/trips/sundarbans-mangrove-tiger-safari-budget" },
  { label: "Contact", href: "/contact" },
  { label: "Kolkata", href: "/trips/kolkata-city-of-joy-heritage-budget" },
  { label: "support@ghumbo.com", href: "mailto:support@ghumbo.com" },
];
