"use client";

import { Timer } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useNow } from "../hooks";
import { clock, secondsLeft } from "../lib";

/** The flap-yellow strip: "Your seats are held for 06:52", with a line after it. */
export function HoldBanner({ expiresAt, children, className }: { expiresAt: string; children?: ReactNode; className?: string }) {
  const now = useNow();
  const left = now === null ? null : secondsLeft(expiresAt, now);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-ticket border-[1.5px] border-line bg-flap px-4 py-3.5 text-board md:px-5 md:py-4",
        className,
      )}
    >
      <Timer size={24} strokeWidth={2} aria-hidden className="shrink-0" />
      <span role="timer" aria-live="off" className="text-[17px] font-bold leading-[1.3] md:text-[18px]">
        Your seats are held for{" "}
        <span className="font-mono text-[20px] font-bold leading-none md:text-[22px]">{left === null ? "--:--" : clock(left)}</span>
      </span>
      {children && <span className="text-[15px] leading-[1.4]">{children}</span>}
    </div>
  );
}

/** Just the clock, for cards and stubs: "06:52". */
export function HoldClock({ expiresAt, className }: { expiresAt: string; className?: string }) {
  const now = useNow();
  return (
    <span role="timer" aria-live="off" className={cn("font-mono font-bold tabular-nums", className)}>
      {now === null ? "--:--" : clock(secondsLeft(expiresAt, now))}
    </span>
  );
}
