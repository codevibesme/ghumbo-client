import type { Asset } from "@/features/destinations/types";

/** POST /booking-requests body. The trip comes from the departure; `userId` (from the session) and `status` are set by the backend. */
export type CreateBookingRequest = {
  tripDepartureId: string;
  firstName: string;
  lastName: string;
  email: string;
  /** E.164, "+919830012345". Required: we call every request within 24 hours. */
  phone: string;
  travelerCount: number;
  query: string | null;
};

export type BookingRequestStatus = "new" | "contacted" | "in_progress" | "converted" | "closed" | "withdrawn";

export type BookingRequest = CreateBookingRequest & {
  id: string;
  /** "GR-7K2M9Q", quoted to support. */
  code: string;
  status: BookingRequestStatus;
  createdAt: string;
};

/** GET /booking-requests/me item and GET /booking-requests/:code (owner only). */
export type UserBookingRequest = {
  id: string;
  tripDepartureId: string;
  status: BookingRequestStatus;
  statusNotes: string | null;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** When the request was sent. */
  createdAt: string;
  /** When the status (or anything else) last changed. */
  updatedAt: string;
  travelerCount: number;
  tripName: string;
  tripSlug: string;
  /** The trip's cover photo, or null if it has none. */
  tripAsset: Asset | null;
  destinationName: string;
  isPeak: boolean;
  startDate: string;
  endDate: string;
  currency: string;
  /** Per-person price × travellers, numeric string. */
  estimate: string;
};

export type RequestFormErrors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "departure" | "consent" | "form", string>>;

/** What the "Request sent" page shows, handed over in sessionStorage so it renders without a round trip. */
export type SentRequest = {
  code: string;
  tripSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  travelers: number;
  departureId: string;
  sentAt: string;
};
