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
  addOn?: string;
  payDirect?: string;
};
