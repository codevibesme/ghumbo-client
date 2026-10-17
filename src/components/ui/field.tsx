"use client";

import { TriangleAlert } from "lucide-react";
import { useId, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldContext } from "./field-context";

/*
 * Label above: Plex Mono 500 12px caps, 0.08em, ink. Field: 52px, 1.5px ink,
 * 6px radius, white, Archivo 16. Error swaps the border to 2px stamp red, the
 * label turns red and a message with an alert icon sits below; the control
 * gets aria-invalid + aria-describedby automatically.
 */

type FieldProps = {
  label: ReactNode;
  /** Adds a muted "· optional" after the label. */
  optional?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({ label, optional, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const invalid = Boolean(error);
  const ctx = useMemo(() => ({ id, describedBy, invalid }), [id, describedBy, invalid]);

  return (
    <FieldContext.Provider value={ctx}>
      <div className={cn("flex flex-col gap-2", className)}>
        <label htmlFor={id} className={cn("type-label", error ? "text-red" : "text-ink")}>
          {label}
          {optional && <span className="text-muted"> · optional</span>}
        </label>
        {children}
        {error && (
          <span id={errorId} className="flex items-center gap-1.5 text-[14px] font-medium leading-[1.4] text-red">
            <TriangleAlert size={16} aria-hidden className="shrink-0" />
            {error}
          </span>
        )}
        {hint && (
          <span id={hintId} className="text-[14px] leading-[1.4] text-muted">
            {hint}
          </span>
        )}
      </div>
    </FieldContext.Provider>
  );
}
