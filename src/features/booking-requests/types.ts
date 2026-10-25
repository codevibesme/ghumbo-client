/** POST /booking-requests body. `userId` and `status` are left for the backend to set. */
export type CreateBookingRequest = {
  tripId: string;
  tripDepartureId: string | null;
  travelDate: string | null;
  name: string;
  email: string;
  /** E.164, "+919830012345". */
  phone: string | null;
  travelerCount: number;
  query: string | null;
};

export type BookingRequest = CreateBookingRequest & {
  id: string;
  /** "GR-7K2M9Q", quoted to support. */
  code: string;
  status: "new" | "contacted" | "in_progress" | "converted" | "closed";
  createdAt: string;
};

export type RequestFormErrors = Partial<Record<"name" | "email" | "phone" | "departure" | "travelDate" | "consent" | "form", string>>;

/** What the "Request sent" page shows, handed over in sessionStorage (the backend has no GET by code yet). */
export type SentRequest = {
  code: string;
  tripSlug: string;
  name: string;
  email: string;
  phone: string | null;
  travelers: number;
  departureId: string | null;
  travelDate: string | null;
  sentAt: string;
};
