"use client";

import { Switch as RadixSwitch } from "radix-ui";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Switch · 48×28, passport when on                                    */
/* ------------------------------------------------------------------ */

export function Switch({ className, ...props }: ComponentProps<typeof RadixSwitch.Root>) {
  return (
    <RadixSwitch.Root
      className={cn(
        "relative h-7 w-12 shrink-0 cursor-pointer rounded-full border-[1.5px] border-line bg-card transition-colors",
        "data-[state=checked]:border-passport data-[state=checked]:bg-passport",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "absolute left-[3px] top-[3px] block size-[19px] rounded-full bg-knob-off transition-transform",
          "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-white",
        )}
      />
    </RadixSwitch.Root>
  );
}

/** Settings row: title + optional description on the left, switch on the right. */
export function SwitchRow({
  title,
  description,
  className,
  ...props
}: ComponentProps<typeof RadixSwitch.Root> & { title: ReactNode; description?: ReactNode }) {
  const id = useId();
  return (
    <div className={cn("flex min-h-14 items-center justify-between gap-4", className)}>
      <span className="flex flex-col gap-0.5">
        <span id={`${id}-t`} className="text-[16px] font-semibold leading-[1.3]">
          {title}
        </span>
        {description && (
          <span id={`${id}-d`} className="text-[14px] leading-[1.4] text-muted">
            {description}
          </span>
        )}
      </span>
      <Switch aria-labelledby={`${id}-t`} aria-describedby={description ? `${id}-d` : undefined} {...props} />
    </div>
  );
}
