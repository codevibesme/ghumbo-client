import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { type SeatState, seatLabel, seatState } from "@/lib/format";

/*
 * Badges are flat (never rotated), 24px tall, Plex Mono 600 12px caps, 4px radius.
 */

const tones = {
  /** Seats ≥ 7, Booked, Live destination */
  open: "bg-green-tint text-green",
  /** Seats 2–6, Confirming */
  few: "bg-amber-tint text-amber",
  /** One seat left */
  last: "bg-red-fill text-on-red",
  /** Sold out, Closed */
  muted: "bg-rule text-muted",
  /** Peak dates */
  peak: "bg-card text-red border-[1.5px] border-red",
  /** Ghumbo pick */
  pick: "bg-passport text-on-passport",
  /** Opening 2027, We called you */
  outline: "bg-card text-ink border-[1.5px] border-line",
  /** Request received, Add-on */
  tint: "bg-passport-tint text-link",
  /** Pay direct (meals you buy yourself) */
  dashed: "bg-card text-muted border-[1.5px] border-dashed border-dash-muted",
} as const;

export type BadgeTone = keyof typeof tones;

type BadgeProps = ComponentProps<"span"> & { tone?: BadgeTone };

export function Badge({ tone = "outline", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-chip px-2",
        "font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.04em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const seatTone: Record<SeatState, BadgeTone> = {
  open: "open",
  few: "few",
  last: "last",
  soldOut: "muted",
};

/** "14 OPEN" / "04 LEFT" / "LAST SEAT" / "SOLD OUT" from a seats-left count. */
export function SeatBadge({ left, className }: { left: number; className?: string }) {
  return (
    <Badge tone={seatTone[seatState(left)]} className={className}>
      {seatLabel(left)}
    </Badge>
  );
}

export type InquiryStatus = "received" | "called" | "confirming" | "booked" | "closed";

const statusMeta: Record<InquiryStatus, { label: string; tone: BadgeTone }> = {
  received: { label: "Request received", tone: "tint" },
  called: { label: "We called you", tone: "outline" },
  confirming: { label: "Confirming", tone: "few" },
  booked: { label: "Booked", tone: "open" },
  closed: { label: "Closed", tone: "muted" },
};

export function StatusBadge({ status, className }: { status: InquiryStatus; className?: string }) {
  const { label, tone } = statusMeta[status];
  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
