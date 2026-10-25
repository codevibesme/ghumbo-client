"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextLink } from "@/components/ui/text-link";
import { textLinkClasses } from "@/components/ui/variants";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { signIn, signUp, verifyOtp } from "../api";
import { safeNext } from "../lib";
import { clearChallenge, loadUser, setChallenge, useChallenge } from "../session";
import type { PendingChallenge } from "../types";

type Message = { error?: string; notice?: string };

/** 6-digit code entry, with a "Resend code" that unlocks after the backend's cooldown. */
export function VerifyForm() {
  const router = useRouter();
  const stored = useChallenge();
  // A resend replaces the challenge; until then it's the one /sign-in stored.
  const [resent, setPendingChallenge] = useState<PendingChallenge | null>(null);
  const challenge = resent ?? stored ?? null;
  const [message, setMessage] = useState<Message>({});
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const wait = useSecondsUntil(challenge?.resendAt ?? 0);

  if (stored === null) redirect("/sign-in");

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    const otp = String(new FormData(event.currentTarget).get("otp") ?? "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(otp)) return setMessage({ error: "Enter the 6-digit code from the email." });

    setVerifying(true);
    setMessage({});
    try {
      await verifyOtp(challenge.challengeId, otp);
    } catch (err) {
      setVerifying(false);
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 401) return setMessage({ error: "That code doesn't match. Check the email and try again." });
      if (err.status === 400) return setMessage({ error: `${err.message} Send a new code to try again.` });
      if (err.status === 409) return setMessage({ error: "That email already has an account. Go back and sign in." });
      return setMessage({ error: "We couldn't verify the code right now. Try again in a minute." });
    }

    clearChallenge();
    await loadUser();
    router.replace(safeNext(challenge.next));
  }

  async function onResend() {
    if (!challenge) return;
    setResending(true);
    try {
      const fresh = challenge.name ? await signUp(challenge.email, challenge.name) : await signIn(challenge.email);
      const next = { ...challenge, challengeId: fresh.challengeId, resendAt: Date.now() + fresh.resendAfter * 1000 };
      setChallenge(next);
      setPendingChallenge(next);
      setMessage({ notice: `New code sent to ${challenge.email}.` });
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 429 && err.resendAfter) {
        setPendingChallenge({ ...challenge, resendAt: Date.now() + err.resendAfter * 1000 });
      }
      setMessage({ error: err.status === 429 ? err.message : "We couldn't send a new code right now. Try again in a minute." });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 type-body text-muted">
        We sent a 6-digit code to{" "}
        <strong className="font-semibold text-ink">{challenge?.email ?? "your email"}</strong>. It works for 5 minutes.
      </p>

      <form onSubmit={onVerify} noValidate className="flex flex-col gap-6">
        <Field label="6-digit code" error={message.error}>
          <Input
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            autoFocus
            required
            className="font-mono tracking-[0.3em]"
          />
        </Field>
        {message.notice && (
          <p role="status" className="m-0 type-small text-green">
            {message.notice}
          </p>
        )}
        <Button type="submit" fullWidth disabled={verifying || !challenge}>
          {verifying ? "Verifying…" : "Verify"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-x-6">
        <button
          type="button"
          onClick={onResend}
          disabled={wait > 0 || resending || !challenge}
          className={cn(
            textLinkClasses(),
            "cursor-pointer disabled:cursor-not-allowed disabled:text-muted disabled:no-underline",
          )}
        >
          {resending ? "Sending…" : wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
        </button>
        <TextLink href="/sign-in">Change email</TextLink>
      </div>
    </div>
  );
}

function useSecondsUntil(at: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (at <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [at]);
  return Math.max(0, Math.ceil((at - now) / 1000));
}
