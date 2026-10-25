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
  price: number;
  /** Child (5–11) price, shown on the group pass. */
  childPrice?: number;
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

/** GET /trips/destination/:slug list item. */
export type TripListItem = {
  id: string;
  name: string;
  slug: string;
  tier: TripTier;
  durationDays: number;
  durationNights: number;
  destination: { id: number; name: string; slug: string } | null;
  nextDeparture: { id: string; startDate: string; endDate: string; seatsLeft: number } | null;
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
  overview: string;
  tier: TripTier;
  audience: "open" | "couples";
  durationDays: number;
  durationNights: number;
  tags: { label: string; description: string | null }[];
  itinerary: { days: ItineraryDayData[] };
  inclusions: { title: string; description: string }[];
  exclusions: { title: string; description: string }[];
  assets: Asset[];
  isRecommended: boolean;
};

/** GET /departures/trip/:tripId item. Prices are numeric strings ("7799.00"). */
export type TripDeparture = {
  id: string;
  tripId: string;
  status: "draft" | "open" | "cancelled" | "completed";
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  prices: { type: "adult" | "child"; currency: string; amount: string }[];
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
