import { Check, X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Filter chips · 4px radius (never pills), 44px mobile / 40px desktop  */
/* ------------------------------------------------------------------ */

const chipBase = cn(
  "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-chip border-[1.5px] px-3.5 md:h-10",
  "font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.06em]",
);

type ChipProps = Omit<ComponentProps<"button">, "type"> & { active?: boolean };

/** Toggle filter. Active = passport fill with a check. */
export function Chip({ active = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        chipBase,
        active ? "border-passport bg-passport text-on-passport" : "border-line bg-card text-ink hover:bg-stock",
        className,
      )}
      {...props}
    >
      {active && <Check size={16} aria-hidden />}
      {children}
    </button>
  );
}

/** Applied filter with a remove ×. `label` is used for the accessible name. */
export function RemovableChip({
  label,
  className,
  ...props
}: Omit<ComponentProps<"button">, "type" | "children"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={`Remove filter: ${label}`}
      className={cn(chipBase, "border-passport bg-passport-tint pr-2.5 text-link", className)}
      {...props}
    >
      {label}
      <X size={16} aria-hidden />
    </button>
  );
}
