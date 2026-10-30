import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Badge, SeatBadge } from "@/components/ui/badge";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import type { Departure } from "@/features/tours/types";
import { cn } from "@/lib/cn";
import { startYear } from "@/features/tours/mappers";
import { formatINR } from "@/lib/format";

/**
 * Group pass: the price panel beside the picker. Navy header with the logo,
 * FROM / TO / DEPART / RETURN, notched tear, fares, badges, one primary CTA.
 */
export function GroupPass({
  from,
  to,
  departure,
  requestHref,
  changeHref,
  ground,
  className,
}: {
  from: string;
  to: string;
  departure: Departure;
  requestHref: string;
  /** "Change date" link target (the departure chooser), when the pass sits away from it. */
  changeHref?: string;
  /** Surface behind the pass (fills the notches). */
  ground?: string;
  className?: string;
}) {
  const field = "flex min-w-0 flex-col gap-1.5";
  const sub = "font-mono text-[12px] leading-none text-muted uppercase";
  return (
    <aside aria-label="Group pass" className={cn("ticket-surface flex flex-col", className)}>
      <div className="flex items-center justify-between rounded-t-[4.5px] bg-passport px-5 py-3.5 text-on-passport">
        <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em]">GROUP PASS</span>
        <Logo tone="stock" ground="var(--g-passport)" className="w-[104px]" />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 px-5 pt-[18px] pb-3.5">
        <div className={field}>
          <span className="type-stub text-muted">From</span>
          <span
            className={cn(
              "font-extrabold uppercase leading-[1.05] [font-stretch:120%]",
              from.length > 10 ? "text-[17px]" : "text-[22px]",
            )}
          >
            {from}
          </span>
        </div>
        <div className={field}>
          <span className="type-stub text-muted">To</span>
          <span className={cn("font-extrabold uppercase leading-[1.05]", to.length > 12 ? "text-[17px]" : "text-[20px]")}>
            {to}
          </span>
        </div>
        <div className={field}>
          <span className="type-stub text-muted">Depart</span>
          <span className="whitespace-nowrap font-mono text-[14px] font-semibold leading-[1.2]">
            {departure.start} {startYear(departure)}
          </span>
          {departure.departTime && <span className={sub}>Pickup {departure.departTime}</span>}
        </div>
        <div className={field}>
          <span className="type-stub text-muted">Return</span>
          <span className="whitespace-nowrap font-mono text-[14px] font-semibold leading-[1.2]">{departure.end}</span>
          {departure.returnTime && <span className={sub}>Drop {departure.returnTime}</span>}
        </div>
      </div>
      {changeHref && (
        <div className="px-5 pb-2">
          <a
            href={changeHref}
            className="inline-flex min-h-11 items-center font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em] text-link underline decoration-[1.5px] underline-offset-4"
          >
            Change date
          </a>
        </div>
      )}
      <TearLine ground={ground} />
      <div className="flex flex-col gap-2.5 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] leading-[1.3]">Adult, twin sharing</span>
          <span className="font-mono text-[16px] font-semibold leading-none">{formatINR(departure.price)}</span>
        </div>
        <div className="flex gap-1.5 pt-1">
          <SeatBadge left={departure.seatsLeft} />
          {departure.peak && <Badge tone="peak">Peak</Badge>}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-5 pb-5">
        <Link href={requestHref} className={buttonClasses({ fullWidth: true })}>
          Request my seat →
        </Link>
        <span className="text-center font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
          NO PAYMENT NOW · WE CALL WITHIN 24 HOURS
        </span>
      </div>
    </aside>
  );
}
