import type { User } from "@/features/auth/types";
import type { CreateTraveler, Traveler, TravelerFormErrors, TravelerGender } from "./types";

const GENDERS: TravelerGender[] = ["female", "male", "other"];

export const GENDER_LABEL: Record<TravelerGender, string> = { female: "Female", male: "Male", other: "Other" };

export const travelerName = (t: Pick<Traveler, "firstName" | "lastName">) =>
  [t.firstName, t.lastName].map((s) => s.trim()).filter(Boolean).join(" ");

/** Whole years on `on` (YYYY-MM-DD), from a date-only birth date. */
export function ageOn(dateOfBirth: string, on: string) {
  const [by, bm, bd] = dateOfBirth.slice(0, 10).split("-").map(Number);
  const [y, m, d] = on.slice(0, 10).split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Checkout row: "Female · 26" (age on `today`, YYYY-MM-DD). */
export function travelerShortMeta(t: Pick<Traveler, "gender" | "dateOfBirth">, today: string) {
  return `${GENDER_LABEL[t.gender]} · ${ageOn(t.dateOfBirth, today)}`;
}

/** "FEMALE · BORN 14 FEB 2000". */
export function travelerMeta(t: Pick<Traveler, "gender" | "dateOfBirth">) {
  const [y, m, d] = t.dateOfBirth.slice(0, 10).split("-");
  return `${GENDER_LABEL[t.gender].toUpperCase()} · BORN ${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** The saved traveller who is the account holder, matched on name. */
export function isAccountHolder(t: Traveler, user: User) {
  return (
    t.firstName.trim().toLowerCase() === user.firstName.trim().toLowerCase() &&
    t.lastName.trim().toLowerCase() === user.lastName.trim().toLowerCase()
  );
}

/** Account holder first, then by first name. */
export function sortTravelers(list: Traveler[], user: User) {
  return [...list].sort(
    (a, b) => Number(isAccountHolder(b, user)) - Number(isAccountHolder(a, user)) || a.firstName.localeCompare(b.firstName),
  );
}

/** Reads the add-traveller form. `today` is YYYY-MM-DD. */
export function validateTraveler(form: FormData, today: string): { body: CreateTraveler } | { errors: TravelerFormErrors } {
  const text = (k: string) => String(form.get(k) ?? "").trim();
  const firstName = text("firstName");
  const lastName = text("lastName");
  const dateOfBirth = text("dateOfBirth");
  const gender = text("gender") as TravelerGender;
  const errors: TravelerFormErrors = {};

  if (!firstName) errors.firstName = "Add their first name.";
  else if (firstName.length > 50) errors.firstName = "Keep it under 50 characters.";
  if (!lastName) errors.lastName = "Add their last name, as on their ID.";
  else if (lastName.length > 50) errors.lastName = "Keep it under 50 characters.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) errors.dateOfBirth = "Add their date of birth.";
  else if (dateOfBirth >= today) errors.dateOfBirth = "That date hasn’t happened yet.";
  else if (ageOn(dateOfBirth, today) > 100) errors.dateOfBirth = "Check the year.";
  if (!GENDERS.includes(gender)) errors.gender = "Choose one.";

  if (Object.keys(errors).length) return { errors };
  return {
    body: {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone: null,
      email: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      dietaryNotes: null,
      medicalNotes: null,
    },
  };
}
