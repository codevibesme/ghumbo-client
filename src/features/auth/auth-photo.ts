import { searchTrips } from "@/features/tours/api";
import type { AuthPhoto } from "./components/auth-art";

/**
 * The sign-in art: the seeded Sandakphu trek's cover. Shared by the auth
 * layout (desktop panel) and the sign-in page (phone strip); searchTrips is
 * cached, so it's one request. Null if the catalog is down.
 */
export async function sandakphuTrip() {
  try {
    const trips = await searchTrips("sandakphu");
    return trips[0] ?? null;
  } catch {
    return null;
  }
}

export async function authPhoto(): Promise<AuthPhoto | null> {
  const trip = await sandakphuTrip();
  return trip?.asset?.url
    ? { src: trip.asset.url, alt: trip.asset.label || "Kanchenjunga from Sandakphu on the Singalila Ridge" }
    : null;
}
