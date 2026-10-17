"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { useFieldControl } from "./field-context";
import { controlClasses } from "./variants";

export function Input({ id, className, ...props }: ComponentProps<"input">) {
  const control = useFieldControl(id);
  return <input {...control} className={cn(controlClasses, className)} {...props} />;
}
