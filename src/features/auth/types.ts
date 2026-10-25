/** POST /auth/sign-in and /auth/sign-up: an OTP was sent. Times are in seconds. */
export type AuthChallenge = {
  challengeId: string;
  expiresIn: number;
  resendAfter: number;
};

/** GET /users/me. */
export type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: { url: string; thumbnail_url?: string } | null;
};

export type Session =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in"; user: User };

/** Between /sign-in and /verify, kept in sessionStorage. */
export type PendingChallenge = {
  challengeId: string;
  email: string;
  /** Set when signing up; resending replays sign-up instead of sign-in. */
  name?: string;
  /** Where to go after verifying. Always a same-site path. */
  next: string;
  /** Epoch ms. */
  resendAt: number;
};
