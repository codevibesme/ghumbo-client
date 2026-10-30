"use client";

import { RadioGroup } from "radix-ui";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Badge, SeatBadge } from "@/components/ui/badge";
import { RadioDot } from "@/components/ui/radio-card";
import { radioCardClasses } from "@/components/ui/variants";
import {
  DepartureSelectionContext,
  offPeakAlternatives,
  useDepartureSelection,
} from "@/features/tours/departure-selection";
import { startYear } from "@/features/tours/mappers";
import type { Departure } from "@/features/tours/types";
import { cn } from "@/lib/cn";
import { FEW_SEATS, formatINR, pad2, seatCaption } from "@/lib/format";
import { GroupPass } from "./group-pass";

/*
 * Each square is one seat. Open = signal green, few left (≤ 6) = seat amber,
 * taken = tear-line grey. The caption repeats the count as text, so the
 * squares themselves are aria-hidden.
 */

export function SeatSquares({ left, total, className }: { left: number; total: number; className?: string }) {
  const few = left <= FEW_SEATS;
  const taken = total - left;
  return (
    <span aria-hidden className={cn("flex flex-wrap gap-[3px]", className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-3.5 w-2.5 rounded-[3px_3px_1px_1px]",
            i < taken ? "bg-tear" : few ? "bg-seat-amber" : "bg-signal",
          )}
        />
      ))}
    </span>
  );
}

export function SeatCaption({ left, total }: { left: number; total: number }) {
  return (
    <span
      className={cn(
        "font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.04em]",
        left <= FEW_SEATS ? "text-amber" : "text-green",
      )}
    >
      {seatCaption(left, total)}
    </span>
  );
}

/**
 * Departure rows as one radiogroup. Selected = 2.5px passport.
 * Desktop: dot · dates · seats · price · peak. Phone: seats wrap to a 2nd row.
 */
export function DeparturePicker({
  departures,
  className,
  ...props
}: ComponentProps<typeof RadioGroup.Root> & { departures: Departure[] }) {
  return (
    <RadioGroup.Root className={cn("flex flex-col gap-2 md:gap-2.5", className)} {...props}>
      {departures.map((d) => {
        const soldOut = d.seatsLeft <= 0;
        return (
          <RadioGroup.Item
            key={d.id}
            value={d.id}
            disabled={soldOut}
            aria-label={`${d.start} to ${d.end}, ${formatINR(d.price)} per person, ${seatCaption(d.seatsLeft, d.totalSeats)}${d.peak ? ", peak" : ""}`}
            className={cn(
              radioCardClasses,
              "grid grid-cols-[20px_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3.5",
              "data-[state=checked]:px-[15px] data-[state=checked]:py-[13px]",
              "md:grid-cols-[20px_150px_minmax(0,1fr)_120px_64px] md:gap-[18px] md:px-[18px]",
              "md:data-[state=checked]:px-[17px]",
            )}
          >
            <RadioDot />
            <span className="flex flex-col gap-1.5">
              <span className="font-mono text-[16px] font-semibold leading-none md:text-[18px]">{d.start}</span>
              <span className="whitespace-nowrap font-mono text-[12px] leading-none text-muted">→ {d.end}</span>
            </span>
            <span className="col-[2/-1] row-2 flex flex-col gap-1.5 md:col-auto md:row-auto">
              <SeatSquares left={d.seatsLeft} total={d.totalSeats} />
              <SeatCaption left={d.seatsLeft} total={d.totalSeats} />
            </span>
            <span className="col-4 row-1 flex flex-col items-end gap-1 md:col-auto md:row-auto md:items-start">
              <span className="text-[22px] font-extrabold leading-none tracking-[-0.02em] [font-stretch:115%] md:text-[26px]">
                {formatINR(d.price)}
              </span>
              <span className="font-mono text-[12px] leading-none text-muted">PER PERSON</span>
            </span>
            <span className="col-3 row-1 justify-self-end md:col-auto md:row-auto">
              {d.peak && <Badge tone="peak">Peak</Badge>}
            </span>
          </RadioGroup.Item>
        );
      })}
    </RadioGroup.Root>
  );
}

/** Picker + pass wired together; the common tour-page "Decide" block. */
export function DepartureChooser({
  departures,
  from,
  to,
  requestHref,
  defaultId,
}: {
  departures: Departure[];
  from: string;
  to: string;
  /** Request page URL; "?departure=<id>" is appended for the selected date. */
  requestHref: string;
  defaultId?: string;
}) {
  const [selected, setSelected] = useState(
    defaultId ?? departures.find((d) => d.seatsLeft > 0)?.id ?? departures[0]?.id,
  );
  const dep = departures.find((d) => d.id === selected) ?? departures[0];
  if (!dep) return null;
  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_380px]">
      <DeparturePicker
        departures={departures}
        value={selected}
        onValueChange={setSelected}
        aria-label={`Departures for ${to}`}
      />
      <GroupPass from={from} to={to} departure={dep} requestHref={`${requestHref}?departure=${encodeURIComponent(dep.id)}`} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trip page: one selection shared across the page                      */
/* ------------------------------------------------------------------ */

/** Holds the selected departure for everything below it (picker, pass, fares, sticky bar). */
export function DepartureSelectionProvider({
  departures,
  requestHref,
  children,
}: {
  departures: Departure[];
  /** Request page URL; "?departure=<id>" is appended for the selected date. */
  requestHref: string;
  children: ReactNode;
}) {
  const [selectedId, select] = useState(() => departures.find((d) => d.seatsLeft > 0)?.id ?? departures[0]?.id);
  const selected = departures.find((d) => d.id === selectedId) ?? departures[0];
  const value = useMemo(
    () =>
      selected
        ? { departures, selected, select, requestHref: `${requestHref}?departure=${encodeURIComponent(selected.id)}` }
        : null,
    [departures, selected, requestHref],
  );
  return <DepartureSelectionContext value={value}>{children}</DepartureSelectionContext>;
}

export function SelectedDeparturePicker({ label }: { label: string }) {
  const { departures, selected, select } = useDepartureSelection();
  return <DeparturePicker departures={departures} value={selected.id} onValueChange={select} aria-label={label} />;
}

/** "Peak dates cost more. The same trip is ₹7,799 on Fri 13 Nov and Fri 19 Mar." Only for a peak pick. */
export function PeakNote() {
  const { departures, selected } = useDepartureSelection();
  if (!selected.peak) return null;
  const alt = offPeakAlternatives(departures);
  return (
    <p className="m-0 text-[14px] leading-[1.45] text-muted">
      Peak dates cost more.
      {alt && alt.price < selected.price && (
        <>
          {" "}
          The same trip is {formatINR(alt.price)} on {alt.dates.join(", ").replace(/, ([^,]*)$/, " and $1")}.
        </>
      )}
    </p>
  );
}

export function SelectedGroupPass({ from, to }: { from: string; to: string }) {
  const { selected, requestHref } = useDepartureSelection();
  return <GroupPass from={from} to={to} departure={selected} requestHref={requestHref} changeHref="#departures" />;
}

/** Phone only: the fares for the picked date, under the picker (the group pass is hidden there). */
export function SelectedFares({ className }: { className?: string }) {
  const { selected } = useDepartureSelection();
  return (
    <div className={cn("ticket-surface flex flex-col px-4 pt-4 pb-1", className)} aria-live="polite">
      <div className="flex items-center justify-between gap-2 pb-3">
        <span className="flex flex-col gap-1.5">
          <span className="type-stub text-muted">Fares for</span>
          <span className="whitespace-nowrap font-mono text-[15px] font-semibold leading-[1.2]">
            {selected.start} {startYear(selected)}
          </span>
        </span>
        <span className="flex gap-1.5">
          <SeatBadge left={selected.seatsLeft} />
          {selected.peak && <Badge tone="peak">Peak</Badge>}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t-[1.5px] border-rule py-3">
        <span className="text-[15px] leading-[1.3]">Adult, twin sharing</span>
        <span className="font-mono text-[16px] font-semibold leading-none">{formatINR(selected.price)}</span>
      </div>
    </div>
  );
}

export function SelectedStickyBar() {
  const { selected, requestHref } = useDepartureSelection();
  const left = selected.seatsLeft;
  return (
    <StickyActionBar
      meta={`${selected.start} · ${left <= FEW_SEATS ? `${pad2(left)} LEFT` : `${pad2(left)} OPEN`}`}
      price={formatINR(selected.price)}
      href={requestHref}
    />
  );
}
