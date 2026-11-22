import type { PaymentOrder } from "./types";

/*
 * Razorpay Standard Checkout, on our page (22 Nov 2026). Paying opens Razorpay's panel over
 * the page, branded from Razorpay Dashboard → Checkout Styling. When the payment succeeds the
 * panel calls `onPaid` and we move to /trips/:bookingId/payment, which polls the booking; only
 * the webhook (order.paid) confirms it. Failures are retried inside the panel. Closing it calls
 * `onDismiss`, and the booking keeps its 10-minute hold.
 */

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || null;

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  notes: Record<string, string>;
  theme: { color: string };
  handler: () => void;
  modal: { ondismiss: () => void; escape: boolean };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

let loading: Promise<void> | null = null;

/** Loads checkout.js once. A failed load can be retried. */
function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Razorpay checkout didn’t load"));
    };
    document.head.append(script);
  });
  return loading;
}

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

/** Where a successful payment lands: the result page polls the booking until the webhook confirms it. */
export const paymentResultHref = (bookingId: string) => `/trips/${encodeURIComponent(bookingId)}/payment?status=success`;

/**
 * Opens Razorpay's panel for this order. Resolves once it's open; rejects if checkout.js can't
 * load (offline, blocked) so the caller can show an error and let them try again.
 */
export async function openRazorpay(
  order: PaymentOrder,
  prefill: Prefill,
  description: string,
  on: { paid: () => void; dismissed: () => void },
) {
  if (!razorpayKeyId) throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not set");
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("Razorpay checkout didn’t load");
  const checkout = new window.Razorpay({
    key: razorpayKeyId,
    order_id: order.orderId,
    amount: Math.round(Number(order.amount) * 100),
    currency: order.currency.toUpperCase(),
    name: "Ghumbo",
    description,
    prefill: {
      name: prefill.name || undefined,
      email: prefill.email ?? undefined,
      contact: prefill.contact ?? undefined,
    },
    notes: { bookingId: order.bookingId },
    // Passport navy, as on our buttons; logo, font and background come from Checkout Styling.
    theme: { color: "#1F3A5F" },
    handler: on.paid,
    modal: { ondismiss: on.dismissed, escape: true },
  });
  checkout.open();
}
