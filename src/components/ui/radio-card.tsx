"use client";

import { RadioGroup } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { radioCardClasses } from "./variants";

/* ------------------------------------------------------------------ */
/* Radio cards · selected = 2.5px passport outline                     */
/* ------------------------------------------------------------------ */

export const RadioCardGroup = ({ className, ...props }: ComponentProps<typeof RadioGroup.Root>) => (
  <RadioGroup.Root className={cn("flex flex-col gap-2.5", className)} {...props} />
);

/** The round radio indicator drawn inside cards and departure rows. */
export function RadioDot() {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line">
      <RadioGroup.Indicator className="size-2.5 rounded-full bg-passport" />
    </span>
  );
}

export function RadioCard({
  className,
  children,
  ...props
}: ComponentProps<typeof RadioGroup.Item>) {
  return (
    <RadioGroup.Item
      className={cn(
        radioCardClasses,
        "flex items-start gap-3 px-4 py-3.5 data-[state=checked]:px-[14.5px] data-[state=checked]:py-[12.5px]",
        className,
      )}
      {...props}
    >
      <RadioDot />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</span>
    </RadioGroup.Item>
  );
}
