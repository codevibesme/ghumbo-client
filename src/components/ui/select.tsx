"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field-context";
import { controlClasses } from "./variants";

/**
 * Native <select> on purpose: the OS picker is the best option list on phones.
 * Styled to match the 52px field, with a chevron.
 */
export function Select({ id, className, children, ...props }: ComponentProps<"select">) {
  const control = useFieldControl(id);
  return (
    <span className="relative block">
      <select {...control} className={cn(controlClasses, "appearance-none pr-11", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        size={20}
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
      />
    </span>
  );
}
