import { Badge } from "@/components/ui/badge";
import { TearLine } from "@/components/ui/tear-line";
import type { Activity } from "@/features/tours/types";
import { cn } from "@/lib/cn";

/*
 * Times in Plex Mono 24h. Only optional paid extras get ADD-ON; meals you buy
 * yourself get PAY DIRECT. Included items carry no tag.
 */

export function ItineraryDay({
  day,
  title,
  date,
  activities,
  meals,
  stay,
  ground,
  className,
}: {
  /** "Day 02" */
  day: string;
  title: string;
  /** "SUN 27 DEC" */
  date?: string;
  activities: Activity[];
  meals?: string;
  stay?: string;
  ground?: string;
  className?: string;
}) {
  return (
    <article className={cn("ticket-surface", className)}>
      <header className="flex items-start justify-between gap-4 px-5 pt-[18px] pb-3.5">
        <span className="flex flex-col gap-2">
          <span className="type-label text-red">{day}</span>
          <h3 className="m-0 type-h3">{title}</h3>
        </span>
        {date && <span className="whitespace-nowrap pt-0.5 font-mono text-[14px] font-semibold leading-none">{date}</span>}
      </header>
      <ol className="m-0 list-none px-5 py-0">
        {activities.map((a) => (
          <li
            key={`${a.time}-${a.title}`}
            className="grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-t-[1.5px] border-rule py-3.5 md:grid-cols-[64px_minmax(0,1fr)_auto] md:gap-4"
          >
            <span className="font-mono text-[14px] font-semibold leading-[1.4]">{a.time}</span>
            <span className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold leading-[1.35]">{a.title}</span>
              {a.note && <span className="type-small text-muted">{a.note}</span>}
            </span>
            {(a.addOn || a.payDirect) && (
              <span className="col-start-2 md:col-start-auto md:justify-self-end">
                {a.addOn && <Badge tone="tint">Add-on{a.addOn === true ? "" : ` · ${a.addOn}`}</Badge>}
                {a.payDirect && <Badge tone="dashed">Pay direct{a.payDirect === true ? "" : ` · ${a.payDirect}`}</Badge>}
              </span>
            )}
          </li>
        ))}
      </ol>
      {(meals || stay) && (
        <>
          <TearLine ground={ground} />
          <div className="grid grid-cols-[1fr_2fr] gap-4 px-5 py-4">
            {meals && (
              <span className="flex flex-col gap-1.5">
                <span className="type-stub text-muted">Meals</span>
                <span className="text-[15px] leading-[1.4]">{meals}</span>
              </span>
            )}
            {stay && (
              <span className="flex flex-col gap-1.5">
                <span className="type-stub text-muted">Stay</span>
                <span className="text-[15px] leading-[1.4]">{stay}</span>
              </span>
            )}
          </div>
        </>
      )}
    </article>
  );
}

/** Explains the two activity tags above the day cards; shows only the tags this itinerary uses. */
export function TagLegend({ addOn, payDirect, className }: { addOn?: boolean; payDirect?: boolean; className?: string }) {
  if (!addOn && !payDirect) return null;
  const item = "inline-flex items-center gap-2 text-[14px] leading-[1.45] text-muted";
  return (
    <ul className={cn("m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-2 p-0", className)}>
      {addOn && (
        <li className={item}>
          <Badge tone="tint">Add-on</Badge> Optional, we can arrange it
        </li>
      )}
      {payDirect && (
        <li className={item}>
          <Badge tone="dashed">Pay direct</Badge> Paid at the venue
        </li>
      )}
    </ul>
  );
}
