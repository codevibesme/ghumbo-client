"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supportEmail } from "@/config/site";
import { fullName, useSession } from "@/features/auth/session";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { retryPayment } from "../api";
import { goToRazorpay } from "../checkout";
import type { UserBooking } from "../types";

/**
 * "Pay ₹23,397" / "Retry payment" on an unpaid booking: fetches
 * the same Razorpay order again and hands off to Razorpay in this tab.
 * `onGone` runs when the backend says the booking can't be paid any more
 * (expired, or already paid), so the page can reload it.
 */
export function PayButton({
  booking,
  label,
  onGone,
  fullWidth,
  size,
  className,
}: {
  booking: Pick<UserBooking, "id" | "tripName" | "startDate">;
  label: string;
  onGone?: () => void;
  fullWidth?: boolean;
  size?: "l" | "m";
  className?: string;
}) {
  const { user } = useSession();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPending(true);
    setError(null);
    try {
      const order = await retryPayment(booking.id);
      goToRazorpay(
        order,
        { name: user ? fullName(user) : "", email: user?.email ?? null, contact: user?.phone ?? null },
        booking.tripName,
      );
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError && err.status === 409) {
        setError(
          /already been completed/i.test(err.message)
            ? "This one’s already paid. Refreshing…"
            : /expired|not allowed/i.test(err.message)
              ? "The hold just ran out, so this booking can’t be paid any more."
              : "We couldn’t set up the payment for this booking. Its seats go back on sale in a few minutes; book again after that.",
        );
        onGone?.();
        return;
      }
      setError(`We couldn’t open the payment just now. Try again in a moment, or write to ${supportEmail}.`);
    }
  }

  return (
    <span className={cn("flex flex-col gap-2", fullWidth && "w-full", className)}>
      {/* Every pay action on the canvas is the stamp-red fill: 56px on pages, 48px in rows. */}
      <Button
        onClick={pay}
        disabled={pending}
        fullWidth={fullWidth}
        size={size}
        variant="danger"
        className={size === "m" ? "h-12 px-5" : "h-14 text-[17px]"}
      >
        {pending ? "Opening Razorpay…" : label}
      </Button>
      {error && (
        <span role="alert" className={cn("text-[14px] font-medium leading-[1.4] text-red", !fullWidth && "max-w-[34ch]")}>
          {error}
        </span>
      )}
    </span>
  );
}
