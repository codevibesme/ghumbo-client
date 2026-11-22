export type TravelerGender = "male" | "female" | "other";

/** GET /travelers/user/:userId item. `dateOfBirth` is a date string ("2000-02-14"). */
export type Traveler = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: TravelerGender;
  phone: string | null;
  email: string | null;
};

/** POST /travelers body. The backend takes the account from the session. */
export type CreateTraveler = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: TravelerGender;
  phone: string | null;
  email: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  dietaryNotes: string | null;
  medicalNotes: string | null;
};

export type TravelerFormErrors = Partial<Record<"firstName" | "lastName" | "dateOfBirth" | "gender" | "form", string>>;
