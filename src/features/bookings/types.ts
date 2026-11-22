import type { Asset } from "@/features/destinations/types";
import type { TravelerGender } from "@/features/travelers/types";

export type BookingStatus = "pending" | "confirmed" | "expired" | "cancelled";
export type RefundStatus = "pending" | "processed" | "failed";

/** POST /billings/bookings body. `id` is a ULID made in the browser, so a double tap can't book twice. */
export type CreateBooking = {
  id: string;
  departureId: string;
  travelerIds: string[];
};

/** POST /billings/bookings and /billings/retry-payment/:bookingId: the Razorpay order to pay. */
export type PaymentOrder = {
  bookingId: string;
  orderId: string;
  /** Rupees, numeric string ("23397.00"). */
  amount: string;
  currency: string;
};

/**
 * GET /bookings/me item and GET /bookings/details/:id (owner only).
 * The backend also returns paymentCheckoutId, error and refundReason, which the UI doesn’t read.
 */
export type UserBooking = {
  id: string;
  /** "GH-K7Q4MX", quoted to support. */
  code: string;
  status: BookingStatus;
  departureId: string;
  travelerCount: number;
  /** Total for every traveller, numeric string. */
  amount: string;
  currency: string;
  /** End of the 10-minute seat hold. */
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  /** Razorpay payment id once paid. */
  paymentReferenceId: string | null;
  /** Razorpay's payment method once paid: "upi", "card", "netbanking", "wallet", "emi", "paylater". */
  paymentMethod: string | null;
  refundStatus: RefundStatus | null;
  refundAmount: string | null;
  /** When the refund cleared at Razorpay (refund.processed). */
  refundedAt: string | null;
  /** Set when the traveller cancelled. */
  cancelledAt: string | null;
  cancellationReason: string | null;
  /** What we kept, numeric string. */
  cancellationFee: string | null;
  tripName: string;
  tripSlug: string;
  tripAsset: Asset | null;
  destinationName: string;
  isPeak: boolean;
  startDate: string;
  endDate: string;
  travelers: { id: string; firstName: string; lastName: string; gender: TravelerGender; dateOfBirth: string }[];
};

/** GET /billings/bookings/cancel/quote/:bookingId: what cancelling right now gives back. Numeric strings, rupees. */
export type CancelQuote = {
  bookingAmount: string;
  refundAmount: string;
  cancellationFee: string;
  paymentMethod: string | null;
};

/** POST /billings/bookings/cancel body. */
export type CancelBooking = {
  bookingId: string;
  /** Up to 100 characters. */
  cancellationReason?: string;
};

/** POST /billings/bookings/cancel response. `refundId` is null when nothing comes back (under 7 days). */
export type CancelResult = CancelQuote & {
  bookingId: string;
  refundId: string | null;
};
