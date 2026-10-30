"use client";

import { Clock, TriangleAlert } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { textLinkClasses } from "@/components/ui/variants";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { signIn, signUp, verifyOtp } from "../api";
import { OTP_LENGTH, OTP_LIFETIME_MINUTES, formatCountdown, safeNext } from "../lib";
import { clearChallenge, loadUser, setChallenge, useChallenge } from "../session";
import type { PendingChallenge } from "../types";
import { OtpInput } from "./otp-input";

type Message = { error?: string; notice?: string };

const EMPTY = Array<string>(OTP_LENGTH).fill("");

/** Six digit boxes, a "Resend in 0:24" countdown that turns into "Resend code", and Verify once all six are in. */
export function VerifyForm() {
  const router = useRouter();
  const stored = useChallenge();
  // A resend replaces the challenge; until then it's the one /sign-in stored.
  const [resent, setPendingChallenge] = useState<PendingChallenge | null>(null);
  const challenge = resent ?? stored ?? null;
  const [digits, setDigits] = useState(EMPTY);
  const [message, setMessage] = useState<Message>({});
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const wait = useSecondsUntil(challenge?.resendAt ?? 0);
  const firstBox = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const code = digits.join("");
  const complete = code.length === OTP_LENGTH;

  const ready = Boolean(challenge);
  useEffect(() => {
    if (ready) firstBox.current?.focus();
  }, [ready]);

  if (stored === null) redirect("/sign-in");

  function reset(next: Message) {
    setDigits(EMPTY);
    setMessage(next);
    firstBox.current?.focus();
  }

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge || !complete) return;

    setVerifying(true);
    setMessage({});
    try {
      await verifyOtp(challenge.challengeId, code);
    } catch (err) {
      setVerifying(false);
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 401) return reset({ error: "That code doesn't match. Check the email and try again." });
      if (err.status === 400) return reset({ error: `${err.message} Send a new code to try again.` });
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
      const fresh = challenge.firstName
        ? await signUp(challenge.email, challenge.firstName, challenge.lastName)
        : await signIn(challenge.email);
      const next = { ...challenge, challengeId: fresh.challengeId, resendAt: Date.now() + fresh.resendAfter * 1000 };
      setChallenge(next);
      setPendingChallenge(next);
      reset({ notice: `New code sent to ${challenge.email}.` });
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

  const changeEmailHref =
    challenge && challenge.next !== "/" ? `/sign-in?next=${encodeURIComponent(challenge.next)}` : "/sign-in";

  return (
    <>
      <p className="m-0 mt-2 max-w-[52ch] type-body-l">
        Enter the {OTP_LENGTH}-digit code we emailed to{" "}
        <span className="font-mono font-semibold [overflow-wrap:anywhere]">{challenge?.email ?? "your email"}</span>. It expires in{" "}
        {OTP_LIFETIME_MINUTES} minutes.
      </p>

      <form onSubmit={onVerify} noValidate aria-label="Verify your email" className="mt-6 flex flex-col gap-5">
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={cn("pb-2 type-label", message.error ? "text-red" : "text-ink")}>
            {OTP_LENGTH}-digit code
          </legend>
          <OtpInput
            ref={firstBox}
            digits={digits}
            onChange={(d) => {
              setDigits(d);
              if (message.error) setMessage({});
            }}
            invalid={Boolean(message.error)}
            describedBy={message.error ? errorId : undefined}
            disabled={!challenge}
          />
          {message.error && (
            <p
              id={errorId}
              role="alert"
              className="m-0 mt-2 flex items-center gap-1.5 text-[14px] font-medium leading-[1.4] text-red"
            >
              <TriangleAlert size={16} aria-hidden className="shrink-0" />
              {message.error}
            </p>
          )}
          {message.notice && (
            <p role="status" className="m-0 mt-2 type-small text-green">
              {message.notice}
            </p>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-x-4">
          {wait > 0 ? (
            <span
              role="timer"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-[14px] font-semibold uppercase leading-none tracking-[0.02em] text-muted"
            >
              <Clock size={16} strokeWidth={1.75} aria-hidden />
              Resend in {formatCountdown(wait)}
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={resending || !challenge}
              className={cn(textLinkClasses(), "cursor-pointer disabled:cursor-not-allowed disabled:text-muted")}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
          <TextLink href={changeEmailHref}>Change email</TextLink>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="submit" fullWidth disabled={!complete || verifying || !challenge}>
            {verifying ? "Verifying…" : "Verify"}
          </Button>
          {!complete && <span className="type-small text-muted">Verify unlocks once all {OTP_LENGTH} digits are in.</span>}
        </div>
      </form>

      <div className="mt-6 border-t-2 border-dashed border-tear pt-4">
        <p className="m-0 type-small text-muted">
          Code not arriving? Check spam and Promotions, wait for the timer, then resend.
        </p>
      </div>
    </>
  );
}

function useSecondsUntil(at: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (at <= Date.now()) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= at) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [at]);
  return Math.max(0, Math.ceil((at - now) / 1000));
}
