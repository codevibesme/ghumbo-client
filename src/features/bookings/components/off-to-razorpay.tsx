"use client";

import { LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { Kicker } from "@/components/ui/section-header";
import { HoldBanner } from "./hold-banner";

/**
 * B08b: shown for the moment between creating the order and Razorpay's page
 * loading in this tab. `onRetry` submits the hand-off again ("Nothing
 * happening?").
 */
export function OffToRazorpay({ expiresAt, amount, onRetry }: { expiresAt: string; amount: string; onRetry: () => void }) {
  // Back from Razorpay can restore this page from the back/forward cache; the
  // URL already points at the booking, so load that instead.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <HoldBanner expiresAt={expiresAt}>Your booking is saved. Find it any time in My trips.</HoldBanner>
      <section
        role="status"
        aria-labelledby="off-h"
        className="ticket-surface flex flex-col items-center gap-4 px-6 py-12 text-center md:py-16"
      >
        <LockKeyhole size={40} strokeWidth={1.75} aria-hidden className="text-link" />
        <Kicker>Step 2 of 2 · Payment</Kicker>
        <h1 id="off-h" className="m-0 type-h1">
          Off to Razorpay…
        </h1>
        <p className="m-0 max-w-[46ch] type-body-l text-muted">
          Taking you to Razorpay’s secure checkout to pay {amount}. Once you pay, you land straight back here.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 cursor-pointer font-sans text-[15px] font-semibold text-link underline underline-offset-[3px] hover:text-red"
        >
          Nothing happening? Tap here
        </button>
      </section>
    </div>
  );
}
