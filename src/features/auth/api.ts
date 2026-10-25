import { API_URL, api } from "@/lib/api";
import type { AuthChallenge, User } from "./types";

/*
 * ghumbo-backend /auth and /users, called from the browser. The backend sets
 * and clears the session cookies itself; responses carry no tokens.
 */

export function signIn(email: string) {
  return api<AuthChallenge>("POST", "/auth/sign-in", { email });
}

export function signUp(email: string, name: string) {
  return api<AuthChallenge>("POST", "/auth/sign-up", { email, name });
}

export function verifyOtp(challengeId: string, otp: string) {
  return api<unknown>("POST", "/auth/verify", { challengeId, otp });
}

export function signOut() {
  return api<unknown>("POST", "/auth/sign-out");
}

export function getMe() {
  return api<User>("GET", "/users/me");
}

/** Full-page navigation: the backend redirects to Google, then back to /auth/callback. */
export const GOOGLE_SIGN_IN_URL = `${API_URL}/auth/google`;
