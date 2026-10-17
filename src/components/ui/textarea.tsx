"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field-context";
import { controlClasses } from "./variants";

export function Textarea({ id, className, rows = 4, ...props }: ComponentProps<"textarea">) {
  const control = useFieldControl(id);
  return (
    <textarea
      {...control}
      rows={rows}
      className={cn(controlClasses, "h-auto min-h-32 resize-y px-4 py-3.5 leading-[1.5]", className)}
      {...props}
    />
  );
}
