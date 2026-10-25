"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { GOOGLE_SIGN_IN_URL, signIn, signUp } from "../api";
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

type Errors = { email?: string; name?: string; form?: string };

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

  useEffect(() => {
    if (session.status === "signed-in") router.replace(next);
  }, [session.status, next, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const name = needsName ? String(form.get("name") ?? "").trim() : undefined;

    if (!EMAIL_RE.test(email)) return setErrors({ email: "Enter a valid email address." });
    if (name !== undefined && !name) return setErrors({ name: "Tell us your name." });
    if (name && name.length > NAME_MAX) return setErrors({ name: `Keep it under ${NAME_MAX} characters.` });

    setPending(true);
    setErrors({});
    try {
      const challenge = name ? await signUp(email, name) : await signIn(email);
      setChallenge({ challengeId: challenge.challengeId, email, name, next, resendAt: Date.now() + challenge.resendAfter * 1000 });
      router.push("/verify");
    } catch (err) {
      setPending(false);
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 404 && !name) return setNeedsName(true);
      if (err.status === 409) return setErrors({ form: "That email already has an account. Sign in instead." });
      if (err.status === 429) return setErrors({ form: waitMessage(err) });
      if (err.status === 400 || err.status === 422) return setErrors({ email: err.message });
      setErrors({ form: "We couldn't send a code right now. Try again in a minute." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="secondary" fullWidth>
        <a href={GOOGLE_SIGN_IN_URL} onClick={() => setNextAfterGoogle(next)}>
          <GoogleMark />
          Continue with Google
        </a>
      </Button>

      <div className="flex items-center gap-3 type-stub text-muted" aria-hidden>
        <span className="h-0 flex-1 border-t-[1.5px] border-dashed border-tear" />
        or use your email
        <span className="h-0 flex-1 border-t-[1.5px] border-dashed border-tear" />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Field label="Email" error={errors.email}>
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
          <Field label="Your name" hint="New to Ghumbo? This creates your account." error={errors.name}>
            <Input name="name" autoComplete="name" maxLength={NAME_MAX} placeholder="Riya Sen" autoFocus required />
          </Field>
        )}

        {errors.form && (
          <p role="alert" className="m-0 type-small text-red">
            {errors.form}
          </p>
        )}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Sending code…" : needsName ? "Create account →" : "Email me a code →"}
        </Button>
      </form>
    </div>
  );
}
