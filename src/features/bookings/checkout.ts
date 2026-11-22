import { API_URL } from "@/lib/api";
import type { PaymentOrder } from "./types";

/*
 * Hand-off to Razorpay's hosted checkout, in the same tab. Razorpay POSTs the
 * result (paid or failed) to the backend's callback, which 303s back to
 * /trips/:bookingId/payment. Pressing Cancel on Razorpay's page lands on the
 * booking in My trips, where the hold timer and Pay button are.
 */

const HOSTED_CHECKOUT_URL = "https://api.razorpay.com/v1/checkout/embedded";

export const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || null;

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** A ULID (26 chars, Crockford base32): 48-bit time + 80 random bits. Booking ids are ULIDs. */
export function ulid(now = Date.now()) {
  let time = "";
  for (let i = 0, t = now; i < 10; i++, t = Math.floor(t / 32)) time = CROCKFORD[t % 32] + time;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let rand = "";
  for (const b of bytes) rand += CROCKFORD[b % 32];
  return time + rand;
}

export type Prefill = { name: string; email: string | null; contact: string | null };

/** Builds and submits the hosted-checkout form. The page navigates away. */
export function goToRazorpay(order: PaymentOrder, prefill: Prefill, description: string) {
  if (!razorpayKeyId) throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not set");
  const origin = window.location.origin;
  const fields: Record<string, string> = {
    key_id: razorpayKeyId,
    order_id: order.orderId,
    amount: String(Math.round(Number(order.amount) * 100)),
    currency: order.currency.toUpperCase(),
    name: "Ghumbo",
    description,
    "prefill[name]": prefill.name,
    ...(prefill.email && { "prefill[email]": prefill.email }),
    ...(prefill.contact && { "prefill[contact]": prefill.contact }),
    "notes[bookingId]": order.bookingId,
    callback_url: `${API_URL}/billings/razorpay/callback`,
    cancel_url: `${origin}/my-trips/${encodeURIComponent(order.bookingId)}`,
  };

  const form = document.createElement("form");
  form.method = "POST";
  form.action = HOSTED_CHECKOUT_URL;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.append(input);
  }
  document.body.append(form);

  // Back from Razorpay should land on the booking, not on a checkout that would book again.
  window.history.replaceState(window.history.state, "", `/my-trips/${encodeURIComponent(order.bookingId)}`);
  form.submit();
}
