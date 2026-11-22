"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useRef, useState, type ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { buttonClasses } from "@/components/ui/variants";
import { REFUND_WORKING_DAYS } from "@/config/legal";
import { shortName } from "@/features/tours/mappers";
import { ApiError } from "@/lib/api";
import { cancelBooking, getCancelQuote } from "../api";
import { CANCEL_REASONS, daysUntil, money, paymentMethodLabel } from "../lib";
import type { CancelQuote, CancelResult, UserBooking } from "../types";

type Step =
  | { kind: "loading" }
  | { kind: "quote-error"; message: string }
  | { kind: "ready"; quote: CancelQuote }
  | { kind: "done"; result: CancelResult };

/**
 * T13b · cancel a paid booking. Opens on the backend's quote (the numbers the
 * refund will actually use), asks for an optional reason and a tick, then
 * cancels. `onCancelled` runs when the dialog closes after a cancellation, so
 * the page reloads the booking behind it without unmounting this mid-flow.
 */
export function CancelDialog({
  booking: b,
  today,
  onCancelled,
  trigger,
}: {
  booking: UserBooking;
  today: string;
  onCancelled: () => void;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ kind: "loading" });
  // Set when the cancel call failed after the backend may already have cancelled: reload on close either way.
  const stale = useRef(false);

  const loadQuote = () => {
    setStep({ kind: "loading" });
    getCancelQuote(b.id).then(
      (quote) => setStep({ kind: "ready", quote }),
      (err) =>
        setStep({
          kind: "quote-error",
          message:
            err instanceof ApiError && err.status === 409
              ? "This booking can’t be cancelled any more. It may already be cancelled, or the trip has started."
              : "We couldn’t work out your refund just now. Give it a moment and try again.",
        }),
    );
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      stale.current = false;
      loadQuote();
    } else if (step.kind === "done" || stale.current) {
      onCancelled();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-board/55" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[calc(100dvh-32px)] w-auto max-w-[560px] -translate-y-1/2 overflow-y-auto rounded-ticket border-[1.5px] border-line bg-card text-ink"
        >
          <div className="flex items-center justify-between bg-passport py-1.5 pr-1.5 pl-5 text-on-passport">
            <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em]">CANCEL · {b.code}</span>
            <Dialog.Close
              aria-label="Close"
              className="inline-flex size-11 cursor-pointer items-center justify-center text-on-passport"
            >
              <X size={20} aria-hidden />
            </Dialog.Close>
          </div>

          {step.kind === "loading" && (
            <div className="flex flex-col gap-4 p-6" aria-busy="true">
              <Dialog.Title className="sr-only">Working out your refund</Dialog.Title>
              <div className="h-9 w-2/3 animate-pulse rounded-ticket bg-rule" />
              <div className="h-36 animate-pulse rounded-ticket border-[1.5px] border-rule" />
            </div>
          )}

          {step.kind === "quote-error" && (
            <div className="flex flex-col gap-4 p-6">
              <Dialog.Title className="m-0 type-h3">Can’t cancel right now</Dialog.Title>
              <p className="m-0 type-body text-muted">{step.message}</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={loadQuote} className={buttonClasses({ variant: "secondary", size: "m" })}>
                  Try again
                </button>
                <Dialog.Close className={buttonClasses({ size: "m" })}>Close</Dialog.Close>
              </div>
            </div>
          )}

          {step.kind === "ready" && (
            <CancelForm
              booking={b}
              today={today}
              quote={step.quote}
              onDone={(result) => setStep({ kind: "done", result })}
              onMaybeCancelled={() => {
                stale.current = true;
              }}
            />
          )}

          {step.kind === "done" && <Done booking={b} result={step.result} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CancelForm({
  booking: b,
  today,
  quote,
  onDone,
  onMaybeCancelled,
}: {
  booking: UserBooking;
  today: string;
  quote: CancelQuote;
  onDone: (r: CancelResult) => void;
  onMaybeCancelled: () => void;
}) {
  const [reason, setReason] = useState("");
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paid = Number(quote.bookingAmount);
  const back = Number(quote.refundAmount);
  const fee = Number(quote.cancellationFee);
  const backPercent = paid > 0 ? Math.round((back / paid) * 100) : 0;
  const feePercent = 100 - backPercent;
  const days = daysUntil(b.startDate, today);
  const method = paymentMethodLabel(quote.paymentMethod);
  const seats = b.travelerCount === 1 ? "your seat goes" : `all ${b.travelerCount} seats go`;

  const submit = async () => {
    if (!sure || busy) return;
    setBusy(true);
    setError(null);
    try {
      onDone(await cancelBooking({ bookingId: b.id, ...(reason && { cancellationReason: reason }) }));
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.status === 409) {
        setError("This booking can’t be cancelled any more. Close this to see where it stands.");
      } else {
        // A 5xx can come after the cancellation went through (the refund call failed), so the page reloads on close.
        onMaybeCancelled();
        setError("Something went wrong on our side. Close this and check your booking before trying again.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-[18px] p-6">
      <div className="flex flex-col gap-2">
        <Dialog.Title className="m-0 text-[30px] font-extrabold leading-[1.05] tracking-[-0.01em] [font-stretch:120%]">
          Cancel {shortName(b.tripName)}?
        </Dialog.Title>
        <p className="m-0 type-body text-muted">
          {back > 0
            ? `You’re ${days} ${days === 1 ? "day" : "days"} out, so you get ${backPercent}% back.`
            : `It’s under 7 days to go, so cancelling now doesn’t bring anything back.`}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 rounded-ticket border-[1.5px] border-line p-4">
        <div className="flex justify-between gap-3 text-[15px] leading-[1.3]">
          <span>You paid</span>
          <span className="font-mono">{money(paid, b.currency)}</span>
        </div>
        <div className="flex justify-between gap-3 text-[15px] leading-[1.3] text-muted">
          <span>Cancellation charge ({feePercent}%)</span>
          <span className="font-mono">−{money(fee, b.currency)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t-[1.5px] border-line pt-3">
          <span className="text-[17px] font-extrabold leading-none">You get back</span>
          <span className="text-[30px] font-extrabold leading-none text-green">{money(back, b.currency)}</span>
        </div>
        {back > 0 && (
          <span className="font-mono text-[12px] font-medium uppercase leading-normal tracking-[0.04em] text-muted">
            To your {method ?? "original payment method"} · 5–{REFUND_WORKING_DAYS} working days
          </span>
        )}
      </div>

      <Field label="What changed?" optional>
        <Select value={reason} onChange={(e) => setReason(e.target.value)} disabled={busy}>
          <option value="">Pick one</option>
          {CANCEL_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <Checkbox checked={sure} onChange={(e) => setSure(e.target.checked)} disabled={busy}>
        I get it: {seats} back on sale and this can’t be undone.
      </Checkbox>

      {error && (
        <p role="alert" className="m-0 text-[14px] font-medium leading-[1.4] text-red">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!sure || busy}
          aria-busy={busy}
          className={buttonClasses({
            variant: sure ? "danger" : "destructive",
            className: "h-[52px] flex-[1_1_220px] disabled:cursor-not-allowed",
          })}
        >
          {busy ? "Cancelling…" : back > 0 ? `Cancel & refund ${money(back, b.currency)}` : "Cancel booking"}
        </button>
        <Dialog.Close className={buttonClasses({ className: "h-[52px] flex-[1_1_160px]" })} disabled={busy}>
          Keep my trip
        </Dialog.Close>
      </div>
    </div>
  );
}

function Done({ booking: b, result }: { booking: UserBooking; result: CancelResult }) {
  const back = Number(result.refundAmount);
  const method = paymentMethodLabel(result.paymentMethod);
  return (
    <div role="status" className="flex flex-col items-center gap-3.5 px-6 py-8 text-center">
      <span aria-hidden className="inline-flex size-[72px] items-center justify-center rounded-full border-[3px] border-green text-green">
        <Check size={34} strokeWidth={2.5} />
      </span>
      <Dialog.Title className="m-0 text-[30px] font-extrabold leading-[1.05] [font-stretch:120%]">
        {back > 0 ? `Done. ${money(back, b.currency)} is on its way back.` : "Done. Your booking is cancelled."}
      </Dialog.Title>
      <p className="m-0 max-w-[40ch] type-body text-muted">
        {back > 0
          ? `It lands in your ${method ?? "account"} in 5–${REFUND_WORKING_DAYS} working days.`
          : `The ${b.travelerCount === 1 ? "seat is" : "seats are"} back on sale.`}
      </p>
      <Link href={`/trips/${b.tripSlug}`} className={buttonClasses({ className: "h-[52px] px-6" })}>
        Find another date →
      </Link>
    </div>
  );
}
