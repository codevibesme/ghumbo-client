"use client";

import { Minus, Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Stepper · 52px, − / value / +                                       */
/* ------------------------------------------------------------------ */

type StepperProps = {
  label: ReactNode;
  hint?: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** Used in the button labels: "Add a traveller" / "Remove a traveller". */
  unit?: string;
  className?: string;
};

export function Stepper({
  label,
  hint,
  value: controlled,
  defaultValue = 1,
  onValueChange,
  min = 1,
  max = 99,
  unit = "traveller",
  className,
}: StepperProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const set = (v: number) => {
    const next = Math.min(max, Math.max(min, v));
    if (controlled === undefined) setInner(next);
    onValueChange?.(next);
  };
  const btn =
    "inline-flex w-[52px] items-center justify-center text-ink disabled:cursor-not-allowed disabled:text-tear focus-visible:-outline-offset-4";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={`${id}-label`} className="type-label text-ink">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="inline-flex h-[52px] self-start overflow-hidden rounded-ticket border-[1.5px] border-line bg-card"
      >
        <button type="button" aria-label={`Remove a ${unit}`} disabled={value <= min} onClick={() => set(value - 1)} className={btn}>
          <Minus size={20} aria-hidden />
        </button>
        <output
          aria-live="polite"
          className="flex w-14 items-center justify-center border-x-[1.5px] border-rule font-mono text-[20px] font-semibold leading-none"
        >
          {value}
        </output>
        <button type="button" aria-label={`Add a ${unit}`} disabled={value >= max} onClick={() => set(value + 1)} className={btn}>
          <Plus size={20} aria-hidden />
        </button>
      </div>
      {hint && (
        <span id={`${id}-hint`} className="text-[14px] leading-[1.4] text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}
