import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Stamp-red mono eyebrow above headings: "LEAVING SOON". */
export function Kicker({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("type-label text-red", className)} {...props} />;
}

/** Kicker + h2 + optional tertiary link aligned to the baseline. */
export function SectionHeader({
  kicker,
  title,
  action,
  as: Heading = "h2",
  className,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex flex-col gap-2">
        {kicker && <Kicker>{kicker}</Kicker>}
        <Heading className="m-0 type-h2 text-ink">{title}</Heading>
      </div>
      {action}
    </div>
  );
}
