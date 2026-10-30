"use client";

import { redirect, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextLink } from "@/components/ui/text-link";
import { ApiError } from "@/lib/api";
import { GOOGLE_SIGN_IN_URL, signIn, signUp } from "../api";
import { OTP_LENGTH, OTP_LIFETIME_MINUTES, safeNext } from "../lib";
import { setChallenge, setNextAfterGoogle, useSession } from "../session";
import { GoogleMark } from "./google-mark";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 50;

/** `?error=` codes the backend's Google callback redirects with. */
const GOOGLE_ERRORS: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled.",
  google_email_unverified: "Your Google account's email isn't verified. Use your email below instead.",
  google_failed: "Google sign-in didn't work. Try again, or use your email below.",
};

type Errors = { email?: string; firstName?: string; lastName?: string; form?: string };

function waitMessage(err: ApiError) {
  if (!err.resendAfter) return err.message;
  const wait = err.resendAfter < 90 ? `${err.resendAfter}s` : `${Math.ceil(err.resendAfter / 60)} min`;
  return `${err.message} Try again in ${wait}.`;
}

/*
 * Google, or email first. An email without an account comes back with a name
 * field (same form, email kept), and that submit creates the account. Both
 * email paths end at /verify.
 */
export function SignInForm({ next, error }: { next: string; error?: string }) {
  const router = useRouter();
  const session = useSession();
  const [needsName, setNeedsName] = useState(false);
  const [errors, setErrors] = useState<Errors>(() => ({ form: error ? GOOGLE_ERRORS[error] : undefined }));
  const [pending, setPending] = useState(false);

  if (session.status === "signed-in") redirect(safeNext(next));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const firstName = needsName ? String(form.get("firstName") ?? "").trim() : undefined;
    const lastName = needsName ? String(form.get("lastName") ?? "").trim() : undefined;

    if (!EMAIL_RE.test(email)) return setErrors({ email: "Enter a valid email address." });
    if (firstName !== undefined && !firstName) return setErrors({ firstName: "Tell us your first name." });
    if (firstName && firstName.length > NAME_MAX) return setErrors({ firstName: `Keep it under ${NAME_MAX} characters.` });
    if (lastName && lastName.length > NAME_MAX) return setErrors({ lastName: `Keep it under ${NAME_MAX} characters.` });

    setPending(true);
    setErrors({});
    try {
      const challenge = firstName ? await signUp(email, firstName, lastName) : await signIn(email);
      setChallenge({
        challengeId: challenge.challengeId,
        email,
        firstName,
        lastName,
        next,
        resendAt: Date.now() + challenge.resendAfter * 1000,
      });
      router.push("/verify");
    } catch (err) {
      setPending(false);
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 404 && !firstName) return setNeedsName(true);
      if (err.status === 409) return setErrors({ form: "That email already has an account. Sign in instead." });
      if (err.status === 429) return setErrors({ form: waitMessage(err) });
      if (err.status === 400 || err.status === 422) return setErrors({ email: err.message });
      setErrors({ form: "We couldn't send a code right now. Try again in a minute." });
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-5">
        <Button asChild variant="secondary" fullWidth>
          <a href={GOOGLE_SIGN_IN_URL} onClick={() => setNextAfterGoogle(next)}>
            <GoogleMark />
            Continue with Google
          </a>
        </Button>

        <div className="flex items-center gap-3 font-mono text-[12px] font-medium leading-none tracking-[0.08em] text-muted" aria-hidden>
          <span className="h-0 flex-1 border-t-2 border-dashed border-tear" />
          OR
          <span className="h-0 flex-1 border-t-2 border-dashed border-tear" />
        </div>

        <form onSubmit={onSubmit} noValidate aria-label="Sign in with email" className="flex flex-col gap-4">
          <Field
            label="Email"
            hint={`We email you a ${OTP_LENGTH}-digit code. It expires in ${OTP_LIFETIME_MINUTES} minutes.`}
            error={errors.email}
          >
            <Input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              required
            />
          </Field>

          {needsName && (
            <div className="flex flex-col gap-2">
              <p className="m-0 type-small text-muted">New to Ghumbo? Add your name to create your account.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" error={errors.firstName}>
                  <Input name="firstName" autoComplete="given-name" maxLength={NAME_MAX} placeholder="Riya" autoFocus required />
                </Field>
                <Field label="Last name" optional error={errors.lastName}>
                  <Input name="lastName" autoComplete="family-name" maxLength={NAME_MAX} placeholder="Sen" />
                </Field>
              </div>
            </div>
          )}

          {errors.form && (
            <p role="alert" className="m-0 type-small text-red">
              {errors.form}
            </p>
          )}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Sending code…" : needsName ? "Create account" : "Email me a code"}
          </Button>
        </form>
      </div>

      <div className="mt-6 flex flex-col gap-1 border-t-2 border-dashed border-tear pt-4">
        <p className="m-0 type-small text-muted">Just browsing? You can request a seat without an account.</p>
        <div className="flex">
          <TextLink href={next}>Continue as guest</TextLink>
        </div>
      </div>
    </>
  );
}
