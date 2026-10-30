import { createContext, useContext } from "react";
import type { Departure } from "./types";

/** The departure picked on the trip page, shared by the picker, the group pass, the fares card and the sticky bar. */
export type DepartureSelection = {
  departures: Departure[];
  selected: Departure;
  select: (id: string) => void;
  /** Request page URL for the selected date. */
  requestHref: string;
};

export const DepartureSelectionContext = createContext<DepartureSelection | null>(null);

export function useDepartureSelection() {
  const ctx = useContext(DepartureSelectionContext);
  if (!ctx) throw new Error("useDepartureSelection needs a <DepartureSelectionProvider>");
  return ctx;
}

/** "FRI 13 NOV" → "Fri 13 Nov". */
export function sentenceDate(ticketDate: string) {
  return ticketDate
    .split(" ")
    .map((w) => (/^\d/.test(w) ? w : w[0] + w.slice(1).toLowerCase()))
    .join(" ");
}

/** Off-peak dates at the lowest off-peak price, for the "Peak dates cost more" note. */
export function offPeakAlternatives(departures: Departure[]) {
  const offPeak = departures.filter((d) => !d.peak && d.seatsLeft > 0);
  if (offPeak.length === 0) return null;
  const price = Math.min(...offPeak.map((d) => d.price));
  return { price, dates: offPeak.filter((d) => d.price === price).slice(0, 3).map((d) => sentenceDate(d.start)) };
}
