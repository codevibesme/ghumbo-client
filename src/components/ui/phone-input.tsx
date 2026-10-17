"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field-context";

/** Indian mobile number with a fixed +91 prefix cell. */
export function PhoneInput({ id, className, ...props }: Omit<ComponentProps<"input">, "type">) {
  const control = useFieldControl(id);
  return (
    <span
      className={cn(
        "flex h-[52px] overflow-hidden rounded-ticket border-[1.5px] border-line bg-card",
        "has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-(--g-focus)",
        "has-aria-invalid:border-2 has-aria-invalid:border-red",
        className,
      )}
    >
      <span className="flex items-center border-r-[1.5px] border-rule bg-sunk px-3.5 font-mono text-[16px] font-semibold leading-none text-ink">
        +91
      </span>
      <input
        {...control}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        className="min-w-0 flex-1 border-0 bg-transparent px-4 font-sans text-[16px] leading-[1.2] text-ink outline-none placeholder:text-placeholder"
        {...props}
      />
    </span>
  );
}
