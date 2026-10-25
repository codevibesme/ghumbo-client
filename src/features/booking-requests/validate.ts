import type { Departure } from "@/features/tours/types";
import type { CreateBookingRequest, RequestFormErrors } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_TRAVELERS = 8;
export const FLEXIBLE = "flexible";

/** B08 form → POST /booking-requests body, or field errors. The backend validates again. */
export function validateRequest(
  form: FormData,
  tripId: string,
  departures: Departure[],
): { errors: RequestFormErrors } | { body: CreateBookingRequest; departure: Departure | null } {
  const text = (k: string) => String(form.get(k) ?? "").trim();
  const name = text("name");
  const email = text("email").toLowerCase();
  const phone = text("phone").replace(/\D/g, "");
  const departureId = text("departure");
  const travelDate = text("travelDate");
  const message = text("message");
  const flexible = departureId === FLEXIBLE;
  const errors: RequestFormErrors = {};

  if (!name) errors.name = "Tell us your full name.";
  else if (name.length > 100) errors.name = "Keep it under 100 characters.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (phone && !/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a 10-digit mobile number.";
  if (!departureId) errors.departure = "Pick a departure, or choose “I’m flexible”.";
  if (flexible && !/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) errors.travelDate = "Pick a preferred date.";
  if (form.get("consent") !== "on") errors.consent = "We need your OK to call you about this request.";

  const departure = flexible ? null : (departures.find((d) => d.id === departureId) ?? null);
  if (!flexible && departureId && !departure) errors.departure = "That date isn’t open any more. Pick another.";

  const travelerCount = Math.min(Math.max(Number.parseInt(text("travelers"), 10) || 1, 1), MAX_TRAVELERS);
  if (departure && travelerCount > departure.seatsLeft) errors.departure = `Only ${departure.seatsLeft} seats left on this date.`;

  if (Object.keys(errors).length) return { errors };

  return {
    departure,
    body: {
      tripId,
      tripDepartureId: departure?.id ?? null,
      travelDate: flexible ? travelDate : null,
      name,
      email,
      phone: phone ? `+91${phone}` : null,
      travelerCount,
      query: message || null,
    },
  };
}
