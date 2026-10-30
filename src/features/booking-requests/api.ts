import { api } from "@/lib/api";
import type { Paginated } from "@/lib/api";
import type { BookingRequest, CreateBookingRequest, UserBookingRequest } from "./types";

/** Seat request, from the browser. Works signed out; when signed in, the session cookie goes along. */
export function createBookingRequest(body: CreateBookingRequest) {
  return api<BookingRequest>("POST", "/booking-requests", body);
}

/** The signed-in traveller's requests. */
export function getMyRequests(page = 1) {
  return api<Paginated<UserBookingRequest>>("GET", `/booking-requests/me?page=${page}&size=50`);
}

/** One of the signed-in traveller's requests, by reference ("GR-7K2M9Q"). 404 if it isn't theirs. */
export function getMyRequest(code: string) {
  return api<UserBookingRequest>("GET", `/booking-requests/${encodeURIComponent(code)}`);
}

export function withdrawRequest(code: string) {
  return api<string>("PATCH", `/booking-requests/withdraw/${encodeURIComponent(code)}`);
}
