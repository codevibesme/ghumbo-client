import Link from "next/link";
import type { ReactNode } from "react";
import { SeatBadge } from "@/components/ui/badge";
import type { BoardRow } from "@/features/tours/types";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";

/*
 * Departure board (dark), one per page max. Board ground, flap-yellow mono data,
 * stock trip names, light seat badges unchanged. On phones the DAYS and FROM
 * columns fold under the trip name.
 */

const head = "pb-2.5 text-left align-middle font-mono text-[12px] font-medium leading-none tracking-[0.08em] text-board-label";
const cell = "border-t border-board-rule py-3 align-middle";
const data = "font-mono text-[14px] font-medium leading-[1.2] text-flap md:text-[15px]";
const desktopOnly = "hidden md:table-cell";

export function DepartureBoard({
  title,
  action,
  rows,
  footnote = "PER PERSON, TWIN SHARING · GST INCLUDED",
  className,
}: {
  title: ReactNode;
  /** Usually <TextLink tone="board">All trips →</TextLink> */
  action?: ReactNode;
  rows: BoardRow[];
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("on-board flex flex-col gap-3.5 rounded-ticket bg-board px-4 py-5 md:px-6 md:py-[22px]", className)}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="m-0 text-[22px] font-extrabold leading-none text-on-board [font-stretch:125%] md:text-[26px]">
          {title}
        </h3>
        {action}
      </div>
      <table className="w-full table-fixed border-collapse">
        {typeof title === "string" && <caption className="sr-only">{title}</caption>}
        <colgroup>
          <col className="w-[104px] md:w-[122px]" />
          <col />
          <col className="hidden w-[82px] md:table-column" />
          <col className="hidden w-[102px] md:table-column" />
          <col className="w-[92px] md:w-[90px]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={cn(head, "pr-3")}>DATE</th>
            <th scope="col" className={cn(head, "pr-3")}>TRIP</th>
            <th scope="col" className={cn(head, "pr-3", desktopOnly)}>DAYS</th>
            <th scope="col" className={cn(head, "pr-3", desktopOnly)}>FROM</th>
            <th scope="col" className={head}>SEATS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.href}-${r.date}`}>
              <td className={cn(cell, data, "pr-3")}>{r.date}</td>
              <th scope="row" className={cn(cell, "pr-3 text-left font-normal")}>
                <span className="flex min-w-0 flex-col gap-1">
                  <Link href={r.href} className={cn(data, "text-on-board no-underline hover:text-flap hover:underline")}>
                    {r.trip}
                  </Link>
                  <span className="font-mono text-[12px] leading-none text-flap md:hidden">
                    {r.days} · {formatINR(r.price)}
                  </span>
                </span>
              </th>
              <td className={cn(cell, data, "pr-3", desktopOnly)}>{r.days}</td>
              <td className={cn(cell, data, "pr-3", desktopOnly)}>{formatINR(r.price)}</td>
              <td className={cell}>
                <SeatBadge left={r.seatsLeft} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {footnote && (
        <span className="font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-board-label">{footnote}</span>
      )}
    </section>
  );
}
