import Link from "next/link";
import { buttonClasses } from "@/components/ui/variants";
import { cn } from "@/lib/cn";

/**
 * Mobile sticky action bar on tour + request pages: 80px, card ground, 1.5px
 * ink top rule, meta + price on the left, full-width primary L on the right.
 */
export function StickyActionBar({
  meta,
  price,
  href,
  label = "Request my seat →",
  className,
}: {
  /** "SAT 26 DEC · 04 LEFT" */
  meta: string;
  /** "₹9,499" */
  price: string;
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex h-20 items-center gap-3 border-t-[1.5px] border-line bg-card px-4 py-3 md:hidden",
        className,
      )}
    >
      <span className="flex shrink-0 flex-col gap-1">
        <span className="font-mono text-[11px] font-medium leading-none tracking-[0.08em] text-muted">{meta}</span>
        <span className="text-[22px] font-extrabold leading-none [font-stretch:115%]">{price}</span>
      </span>
      <Link href={href} className={buttonClasses({ className: "flex-1 px-3" })}>
        {label}
      </Link>
    </div>
  );
}
