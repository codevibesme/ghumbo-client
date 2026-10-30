import type { BoardRow, Departure, TourSummary } from "@/features/tours/types";

// Canvas sample content, used only by the /design-system showcase.
// Photos are the seed data's Wikimedia Commons images (CC licensed; credits live in the backend seed).

export const tours = {
  darjeeling: {
    href: "/trips/darjeeling-queen-of-the-hills",
    title: "Darjeeling: Queen of the Hills",
    route: "NJP → Darjeeling · 4D / 3N",
    blurb: "Tiger Hill sunrise, Ghum Monastery, tea gardens and three nights in a family homestay.",
    image: { src: "https://cdn.ghumbo.com/catalog/trips/darjeeling-queen-of-the-hills-budget/01-kanchenjunga-from-tiger-hill.jpg", alt: "Kanchenjunga from Tiger Hill" },
    nextDeparture: "FRI 13 NOV",
    seatsLeft: 14,
    price: 7799,
    pick: true,
  },
  kolkata: {
    href: "/trips/kolkata-city-of-joy",
    title: "Kolkata: City of Joy Heritage Trail",
    route: "Kolkata · 3D / 2N",
    blurb: "Flower market at dawn, Kumartuli clay workshops, trams and a long food walk.",
    image: { src: "https://cdn.ghumbo.com/catalog/destinations/west-bengal/02-victoria-memorial-kolkata.jpg", alt: "Victoria Memorial, Kolkata" },
    nextDeparture: "SAT 14 NOV",
    seatsLeft: 3,
    price: 5499,
  },
  kolkataSoldOut: {
    href: "/trips/kolkata-city-of-joy",
    title: "Kolkata: City of Joy Heritage Trail",
    route: "Kolkata · 3D / 2N",
    blurb: "Flower market at dawn, Kumartuli clay workshops, trams and a long food walk.",
    image: { src: "https://cdn.ghumbo.com/catalog/trips/kolkata-city-of-joy-heritage-budget/02-howrah-bridge-from-the-ghats.jpg", alt: "Howrah Bridge from the ghats" },
    nextDeparture: "SAT 14 NOV",
    seatsLeft: 0,
    price: 5499,
  },
  hillCircuit: {
    href: "/trips/darjeeling-kalimpong-mirik",
    title: "Darjeeling, Kalimpong & Mirik Hill Circuit",
    route: "NJP → Kalimpong · 6D / 5N",
    blurb: "A lakeside night in Mirik, two in Darjeeling, then Kalimpong. One Tempo Traveller, six days.",
    image: { src: "https://cdn.ghumbo.com/catalog/trips/darjeeling-kalimpong-mirik-hill-circuit-budget/01-sumendu-lake-mirik.jpg", alt: "Sumendu Lake, Mirik" },
    nextDeparture: "SAT 07 NOV",
    seatsLeft: 11,
    price: 12999,
    stops: ["NJP", "Mirik", "Darjeeling", "Kalimpong"],
  },
  sundarbans: {
    href: "/trips/sundarbans-mangrove-tiger-safari",
    title: "Sundarbans: Mangrove & Tiger Safari",
    route: "Kolkata → Godkhali · 3D / 2N",
    blurb: "A full day on the creeks, the Dobanki canopy walk and a folk night.",
    image: { src: "https://cdn.ghumbo.com/catalog/trips/sundarbans-mangrove-tiger-safari-budget/01-royal-bengal-tiger-sundarban-tiger-reserve.jpg", alt: "Royal Bengal tiger in the Sundarbans" },
    nextDeparture: "SAT 14 NOV",
    seatsLeft: 9,
    price: 6599,
    stops: ["Kolkata", "Godkhali", "Sajnekhali", "Dobanki"],
  },
} satisfies Record<string, TourSummary>;

export const departures: Departure[] = [
  { id: "2026-11-13", start: "FRI 13 NOV", end: "MON 16 NOV 2026", price: 7799, seatsLeft: 14, totalSeats: 18, departTime: "11:00", returnTime: "13:30" },
  { id: "2026-12-26", start: "SAT 26 DEC", end: "TUE 29 DEC 2026", price: 9499, seatsLeft: 4, totalSeats: 18, peak: true, departTime: "11:00", returnTime: "13:30" },
  { id: "2027-03-19", start: "FRI 19 MAR", end: "MON 22 MAR 2027", price: 7799, seatsLeft: 18, totalSeats: 18, departTime: "11:00", returnTime: "13:30" },
  { id: "2027-05-01", start: "SAT 01 MAY", end: "TUE 04 MAY 2027", price: 9499, seatsLeft: 18, totalSeats: 18, peak: true, departTime: "11:00", returnTime: "13:30" },
];

export const boardRows: BoardRow[] = [
  { href: tours.hillCircuit.href, date: "SAT 07 NOV", trip: tours.hillCircuit.title, days: "6D", price: 12999, seatsLeft: 11 },
  { href: tours.darjeeling.href, date: "FRI 13 NOV", trip: tours.darjeeling.title, days: "4D", price: 7799, seatsLeft: 14 },
  { href: tours.kolkata.href, date: "SAT 14 NOV", trip: tours.kolkata.title, days: "3D", price: 5499, seatsLeft: 3 },
  { href: tours.sundarbans.href, date: "SAT 14 NOV", trip: tours.sundarbans.title, days: "3D", price: 6599, seatsLeft: 9 },
];

export const colourTokens: { name: string; token: string; light: string; dark: string; use: string }[] = [
  { name: "Ticket stock", token: "stock", light: "#F2F4EC", dark: "#121821", use: "Page ground" },
  { name: "Card white", token: "card", light: "#FFFFFF", dark: "#1B2330", use: "Cards, inputs" },
  { name: "Sunk", token: "sunk", light: "#F7F8F3", dark: "#222B39", use: "Prefix cells, strips" },
  { name: "Ink", token: "ink", light: "#1A2230", dark: "#E8EBE2", use: "Text" },
  { name: "Line", token: "line", light: "#1A2230", dark: "#4E596B", use: "1.5px outlines" },
  { name: "Muted", token: "muted", light: "#4B5563", dark: "#A4ADBA", use: "Secondary text" },
  { name: "Placeholder", token: "placeholder", light: "#6B7280", dark: "#7E8898", use: "Input placeholder" },
  { name: "Tear line", token: "tear", light: "#B9C0AE", dark: "#3A4352", use: "2px dashed tears" },
  { name: "Rule", token: "rule", light: "#E2E5DC", dark: "#2A3342", use: "Hairlines, sold out" },
  { name: "Passport", token: "passport", light: "#1F3A5F", dark: "#30598F", use: "Primary fill" },
  { name: "Passport hover", token: "passport-hover", light: "#152B48", dark: "#3A69A8", use: "Primary hover" },
  { name: "Link", token: "link", light: "#1F3A5F", dark: "#9CC0EC", use: "Links, tertiary" },
  { name: "Passport tint", token: "passport-tint", light: "#E3EAF3", dark: "#1D2D45", use: "Received, add-on" },
  { name: "Stamp red", token: "red", light: "#C2362B", dark: "#FF8A7A", use: "Kickers, PEAK, errors" },
  { name: "Red fill", token: "red-fill", light: "#C2362B", dark: "#C2362B", use: "Last seat, delete" },
  { name: "Signal green", token: "signal", light: "#2E8B6A", dark: "#3DAA82", use: "Seat squares only" },
  { name: "Green text", token: "green", light: "#1C6247", dark: "#7BD3AE", use: "Open, booked" },
  { name: "Green tint", token: "green-tint", light: "#DCEFE6", dark: "#133528", use: "Open chip" },
  { name: "Seat amber", token: "seat-amber", light: "#B07A00", dark: "#D69A20", use: "Few-left squares only" },
  { name: "Amber text", token: "amber", light: "#7A5200", dark: "#F0C46A", use: "Few left, confirming" },
  { name: "Amber tint", token: "amber-tint", light: "#FBEBC4", dark: "#3A2B0C", use: "Few-left chip" },
  { name: "Board", token: "board", light: "#141A24", dark: "#080B10", use: "Departure board, footer" },
  { name: "Flap yellow", token: "flap", light: "#F4D35E", dark: "#F4D35E", use: "Data on the board" },
  { name: "Coral", token: "coral", light: "#FF8A7A", dark: "#FF8A7A", use: "Logo pin on dark" },
];
