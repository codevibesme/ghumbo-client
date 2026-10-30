/** Only same-site paths, so `?next=` can't send people off to another origin. */
export function safeNext(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : "/";
}

/** Digits in an emailed code. */
export const OTP_LENGTH = 6;

/** How long an emailed code works: the backend's OTP_TTL (300 s). */
export const OTP_LIFETIME_MINUTES = 5;

/** "1:05" for the resend countdown. */
export function formatCountdown(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Applies what was typed or pasted into box `at` of the code entry. One digit
 * fills that box; several (a paste, or the OS filling a one-time code) fill
 * from there on, or from the first box when it's a whole code. Returns the new
 * digits and the box to focus next.
 */
export function fillDigits(digits: readonly string[], at: number, input: string) {
  const typed = input.replace(/\D/g, "");
  const next = [...digits];
  if (typed.length <= 1) {
    next[at] = typed;
    return { digits: next, focus: typed && at < digits.length - 1 ? at + 1 : at };
  }
  const from = typed.length >= digits.length ? 0 : at;
  const chars = typed.slice(0, digits.length - from).split("");
  chars.forEach((c, k) => (next[from + k] = c));
  return { digits: next, focus: Math.min(digits.length - 1, from + chars.length) };
}
