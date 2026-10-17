import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Breadcrumb                                                          */
/* ------------------------------------------------------------------ */

export function Breadcrumb({
  items,
  className,
}: {
  /** Last item is the current page (no href). */
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-2.5 type-label", className)}>
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <span aria-hidden className="text-muted">
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="text-link underline-offset-[3px] hover:text-red hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
