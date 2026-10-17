import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { textLinkClasses } from "./variants";

/** Tertiary action: mono 13 caps, underlined, 44px hit area. "All trips →". */
type TextLinkProps = ComponentProps<typeof Link> & { tone?: "default" | "board" };

export function TextLink({ tone, className, ...props }: TextLinkProps) {
  return <Link className={cn(textLinkClasses({ tone }), className)} {...props} />;
}
