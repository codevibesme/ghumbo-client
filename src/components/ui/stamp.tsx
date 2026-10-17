import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
 * Stamps are rotated and reserved for ONE moment per view.
 * S: 13px mono, 2.5px border, −6°, in-card status.
 * M: 24px Archivo 800, 3.5px border, −10°, hero moments (e.g. sold-out photo).
 * L: 136px round with a double ring, −10° ("Request sent" confirmation).
 * Red = PEAK, SOLD OUT, errors. Status stamps use their status colour.
 */

const tones = {
  red: "text-red border-red",
  green: "text-green border-green",
  amber: "text-amber border-amber",
  passport: "text-link border-passport",
} as const;

export type StampTone = keyof typeof tones;

export function Stamp({
  size = "s",
  tone = "red",
  className,
  children,
}: {
  size?: "s" | "m";
  tone?: StampTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 whitespace-nowrap rounded-ticket bg-stamp-backing text-center uppercase",
        size === "s"
          ? "-rotate-6 border-[2.5px] px-2.5 py-[7px] font-mono text-[13px] font-semibold leading-[1.15] tracking-[0.06em]"
          : "-rotate-10 border-[3.5px] px-4 py-2.5 font-sans text-[24px] font-extrabold leading-[1.15] [font-stretch:120%]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Large round stamp: top line, big middle, bottom line. */
export function RoundStamp({
  top,
  middle,
  bottom,
  tone = "passport",
  className,
}: {
  top: ReactNode;
  middle: ReactNode;
  bottom?: ReactNode;
  tone?: StampTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-[136px] shrink-0 -rotate-10 flex-col items-center justify-center gap-1 rounded-full",
        "border-[3px] bg-stamp-backing text-center uppercase outline-[1.5px] -outline-offset-[9px] outline-current outline-solid",
        tones[tone],
        className,
      )}
    >
      <span className="font-mono text-[11px] font-semibold leading-none tracking-[0.08em]">{top}</span>
      <span className="whitespace-nowrap font-sans text-[22px] font-extrabold leading-none [font-stretch:105%]">
        {middle}
      </span>
      {bottom && (
        <span className="font-mono text-[11px] font-semibold leading-none tracking-[0.08em]">{bottom}</span>
      )}
    </span>
  );
}
