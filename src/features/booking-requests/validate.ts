import type { Departure } from "@/features/tours/types";
import type { CreateBookingRequest, RequestFormErrors } from "./types";

/** Contact details taken from the account. Locked fields are disabled, so they're absent from the form data. */
export type LockedDetails = Partial<Pick<CreateBookingRequest, "firstName" | "lastName" | "email" | "phone">>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_TRAVELERS = 8;

/** B08 form → POST /booking-requests body, or field errors. The backend validates again. */
export function validateRequest(
  form: FormData,
  departures: Departure[],
  locked: LockedDetails = {},
): { errors: RequestFormErrors } | { body: CreateBookingRequest; departure: Departure } {
  const text = (k: string) => String(form.get(k) ?? "").trim();
  const firstName = locked.firstName ?? text("firstName");
  const lastName = locked.lastName ?? text("lastName");
  const email = locked.email ?? text("email").toLowerCase();
  const phone = locked.phone ? null : text("phone").replace(/\D/g, "");
  const departureId = text("departure");
  const message = text("message");
  const errors: RequestFormErrors = {};

  if (!firstName) errors.firstName = "Tell us your first name.";
  else if (firstName.length > 50) errors.firstName = "Keep it under 50 characters.";
  if (!lastName) errors.lastName = "Tell us your last name.";
  else if (lastName.length > 50) errors.lastName = "Keep it under 50 characters.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (phone && !/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a 10-digit mobile number.";
  if (!departureId) errors.departure = "Pick a departure.";
  if (form.get("consent") !== "on") errors.consent = "We need your OK to call you about this request.";

  const departure = departures.find((d) => d.id === departureId) ?? null;
  if (departureId && !departure) errors.departure = "That date isn’t open any more. Pick another.";

  const travelerCount = Math.min(Math.max(Number.parseInt(text("travelers"), 10) || 1, 1), MAX_TRAVELERS);
  if (departure && travelerCount > departure.seatsLeft) errors.departure = `Only ${departure.seatsLeft} seats left on this date.`;

  if (Object.keys(errors).length || !departure) return { errors };

  return {
    departure,
    body: {
      tripDepartureId: departure.id,
      firstName,
      lastName,
      email,
      phone: locked.phone ?? (phone ? `+91${phone}` : null),
      travelerCount,
      query: message || null,
    },
  };
}
