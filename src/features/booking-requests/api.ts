import { api } from "@/lib/api";
import type { BookingRequest, CreateBookingRequest } from "./types";

/** Seat request, from the browser. Works signed out; when signed in, the session cookie goes along. */
export function createBookingRequest(body: CreateBookingRequest) {
  return api<BookingRequest>("POST", "/booking-requests", body);
}
