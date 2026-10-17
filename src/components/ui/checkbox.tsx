import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Checkbox · native, passport accent, 44px row                        */
/* ------------------------------------------------------------------ */

export function Checkbox({
  children,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { children: ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-[1.45] text-ink", className)}>
      <input type="checkbox" className="mt-px size-5 shrink-0 accent-passport" {...props} />
      <span className="[&_a]:text-link [&_a]:underline [&_a:hover]:text-red">{children}</span>
    </label>
  );
}
