import { ChevronDown } from "lucide-react";
import { Accordion as RadixAccordion } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Accordion · dashed tear between items, one open at a time            */
/* ------------------------------------------------------------------ */

export function Accordion({
  className,
  ...props
}: Omit<ComponentProps<typeof RadixAccordion.Root>, "type" | "collapsible">) {
  return (
    <RadixAccordion.Root
      type="single"
      collapsible
      className={cn("border-b-2 border-dashed border-tear", className)}
      {...(props as Omit<RadixAccordion.AccordionSingleProps, "type">)}
    />
  );
}

export function AccordionItem({
  question,
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof RadixAccordion.Item>, "children"> & { question: ReactNode; children: ReactNode }) {
  return (
    <RadixAccordion.Item className={cn("border-t-2 border-dashed border-tear", className)} {...props}>
      <RadixAccordion.Header asChild>
        <h3>
          <RadixAccordion.Trigger className="group flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left type-h4 text-ink">
            {question}
            <ChevronDown
              size={20}
              aria-hidden
              className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
            />
          </RadixAccordion.Trigger>
        </h3>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="max-w-[68ch] pb-5 type-body text-ink">{children}</RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}
