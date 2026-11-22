import { api } from "@/lib/api";
import type { Paginated } from "@/lib/api";
import type { CancelBooking, CancelQuote, CancelResult, CreateBooking, PaymentOrder, UserBooking } from "./types";

/** Holds the seats for 10 minutes and creates the Razorpay order. */
export function createBooking(body: CreateBooking) {
  return api<PaymentOrder>("POST", "/billings/bookings", body);
}

/** The same order again, while the hold lasts. 409 once it has expired or been paid. */
export function retryPayment(bookingId: string) {
  return api<PaymentOrder>("POST", `/billings/retry-payment/${encodeURIComponent(bookingId)}`);
}

/** The signed-in traveller's bookings, newest first. `size` is capped at 50 by the backend. */
export function getMyBookings(page = 1) {
  return api<Paginated<UserBooking>>("GET", `/bookings/me?page=${page}&size=50`);
}

/** One of the signed-in traveller's bookings, by id. 404 if it isn't theirs. */
export function getMyBooking(id: string) {
  return api<UserBooking>("GET", `/bookings/details/${encodeURIComponent(id)}`);
}

/** Every booking of the signed-in traveller, all pages. */
export async function getAllMyBookings() {
  const all: UserBooking[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await getMyBookings(page);
    all.push(...res.data);
    if (!res.hasNext) break;
  }
  return all;
}

/** What cancelling now gives back. 409 once it can't be cancelled (not paid, already cancelled, trip started). */
export function getCancelQuote(bookingId: string) {
  return api<CancelQuote>("GET", `/billings/bookings/cancel/quote/${encodeURIComponent(bookingId)}`);
}

/** Cancels a paid booking: seats go back on sale and the refund starts. Can't be undone. */
export function cancelBooking(body: CancelBooking) {
  return api<CancelResult>("POST", "/billings/bookings/cancel", body);
}
