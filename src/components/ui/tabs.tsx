import { Tabs as RadixTabs } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Tabs · 48px, 3px passport underline on the active tab               */
/* ------------------------------------------------------------------ */

export const Tabs = RadixTabs.Root;
export const TabsContent = RadixTabs.Content;

export function TabsList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn("flex gap-7 overflow-x-auto border-b-[1.5px] border-line", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "h-12 shrink-0 cursor-pointer px-0.5 font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em] text-muted",
        "hover:text-ink data-[state=active]:text-ink data-[state=active]:shadow-[inset_0_-3px_0_var(--g-passport)]",
        "focus-visible:-outline-offset-3",
        className,
      )}
      {...props}
    />
  );
}
