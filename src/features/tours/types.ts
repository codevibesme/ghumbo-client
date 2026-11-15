import type { Asset } from "@/features/destinations/types";

// Tour-domain shapes the UI renders. The backend API maps onto these.

export type TourSummary = {
  href: string;
  title: string;
  /** "NJP → Darjeeling · 4D / 3N" */
  route: string;
  blurb?: string;
  image: { src: string; alt: string };
  /** "FRI 13 NOV" */
  nextDeparture: string;
  seatsLeft: number;
  price: number;
  peak?: boolean;
  pick?: boolean;
  /** Stops for the route line on list cards. */
  stops?: string[];
};

export type Departure = {
  id: string;
  /** "SAT 26 DEC" */
  start: string;
  /** "TUE 29 DEC 2026" */
  end: string;
  /** ISO start date, for dating each itinerary day. */
  startDate?: string;
  price: number;
  seatsLeft: number;
  totalSeats: number;
  peak?: boolean;
  departTime?: string;
  returnTime?: string;
};

export type BoardRow = {
  href: string;
  /** "SAT 07 NOV" */
  date: string;
  trip: string;
  /** "6D" */
  days: string;
  price: number;
  seatsLeft: number;
};

export type Activity = {
  /** "04:45" */
  time: string;
  title: string;
  note?: string;
  /** true = tag without a price. */
  addOn?: string | true;
  payDirect?: string | true;
};

/* ------------------------------------------------------------------ */
/* Backend shapes (/trips, /departures, /reviews)                       */
/* ------------------------------------------------------------------ */

export type TripTier = "budget" | "standard" | "premium";

/** A trip's tag; the labels are the "vibes" (Hills, Heritage…) that /trips filters on. */
export type TripTag = { label: string; description: string | null };

/** A station, airport, port or bus stand with its code (NJP, IXB, HWH, IXZ). */
export type TripHub = {
  name: string;
  type: "airport" | "station" | "port" | "bus_stand";
  /** The city the hub serves: "Siliguri" for NJP and IXB. Groups hubs on destination pages. */
  city: string;
  code: string;
};

/** Title + one or two lines: highlights ("DAY 2 · 04:45"), heads-ups, packing items, meeting steps. */
export type TripNote = { title: string; description: string };

/** GET /trips list item. */
export type TripListItem = {
  id: string;
  name: string;
  /** Short card blurb; "" when not written yet. */
  tagline: string;
  slug: string;
  /** "Oct–Mar"; "" when unknown. */
  bestTime: string;
  /** Where the group is picked up, e.g. NJP and IXB. */
  sourceHubs: TripHub[];
  /** The place the trip is based at; the end of the card route. */
  destinationHub: TripHub | null;
  /** Places between the hubs and the destination, for the route line. */
  stops: string[];
  tier: TripTier;
  durationDays: number;
  durationNights: number;
  isRecommended: boolean;
  tags: TripTag[];
  destination: { id: number; name: string; slug: string } | null;
  nextDeparture: { id: string; startDate: string; endDate: string; seatsLeft: number; isPeak: boolean } | null;
  asset: Asset | null;
  startingPrice: { amount: number; currency: string } | null;
  rating: number | null;
  reviewCount: number;
};

export type ItineraryActivity = {
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  type: "sightseeing" | "activity" | "meal" | "transfer" | "accommodation" | "free_time" | "other";
  included: boolean;
};

export type ItineraryDayData = {
  day: number;
  title: string;
  overview: string | null;
  location: string | null;
  activities: ItineraryActivity[];
  meals: ("breakfast" | "lunch" | "dinner")[];
  accommodation: string | null;
};

/** GET /trips/:slug. */
export type Trip = {
  id: string;
  destinationId: number;
  status: "draft" | "live";
  name: string;
  slug: string;
  tagline: string;
  overview: string;
  tier: TripTier;
  audience: "open" | "couples";
  durationDays: number;
  durationNights: number;
  sourceHubs: TripHub[];
  destinationHub: TripHub | null;
  stops: string[];
  bestTime: string;
  tags: TripTag[];
  /** The best moments: title is "DAY 2 · 04:45" or "3 NIGHTS". */
  highlights: TripNote[];
  /** Heads-ups for things that vary: weekly closures, swapped days, weather. */
  callouts: TripNote[];
  whatToPack: TripNote[];
  meetingInstructions: TripNote[];
  faq: { question: string; answer: string }[];
  itinerary: { days: ItineraryDayData[] };
  inclusions: { title: string; description: string }[];
  exclusions: { title: string; description: string }[];
  assets: Asset[];
  isRecommended: boolean;
  /** ISO timestamp of the trip row's last edit (not its departures'). */
  updatedAt: string;
};

/** GET /departures/trip/:tripId item. One per-person price; `amount` is a numeric string ("7799.00"). */
export type TripDeparture = {
  id: string;
  tripId: string;
  status: "draft" | "open" | "cancelled" | "completed";
  isPeak: boolean;
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  currency: string;
  amount: string;
};

/** GET /departures/upcoming item: a departure with its trip and destination. Only the fields the board reads. */
export type UpcomingDeparture = TripDeparture & {
  trip: {
    id: string;
    name: string;
    slug: string;
    status: "draft" | "live";
    durationDays: number;
    destination: { slug: string; name: string; status: "live" | "coming_soon" } | null;
  };
};

/** GET /reviews/trip/:tripId item. */
export type TripReview = {
  id: string;
  userId: string | null;
  tripId: string;
  rating: number;
  feedback: string | null;
  assets: Asset[];
  createdAt: string;
};
