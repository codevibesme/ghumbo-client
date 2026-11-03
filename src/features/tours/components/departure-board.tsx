import Link from "next/link";
import type { ReactNode } from "react";
import { SeatBadge } from "@/components/ui/badge";
import type { BoardRow } from "@/features/tours/types";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";

/*
 * Departure board (dark), one per page max. Board ground, flap-yellow mono data,
 * stock trip names, light seat badges unchanged. Desktop is a five-column
 * table; phones get the design's stacked rows instead: the trip name, then
 * date, price and seats on one line (no DAYS).
 */

const head = "pb-2.5 text-left align-middle font-mono text-[12px] font-medium leading-none tracking-[0.08em] text-board-label";
const cell = "border-t border-board-rule py-3 align-middle";
const data = "font-mono text-[14px] font-medium leading-[1.2] text-flap md:text-[15px]";

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
        <h2 className="m-0 text-[22px] font-extrabold leading-none text-on-board [font-stretch:125%] md:text-[26px]">
          {title}
        </h2>
        {action}
      </div>
      <table className="hidden w-full table-fixed border-collapse md:table">
        {typeof title === "string" && <caption className="sr-only">{title}</caption>}
        <colgroup>
          <col className="w-[122px]" />
          <col />
          <col className="w-[82px]" />
          <col className="w-[102px]" />
          <col className="w-[90px]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={cn(head, "pr-3")}>DATE</th>
            <th scope="col" className={cn(head, "pr-3")}>TRIP</th>
            <th scope="col" className={cn(head, "pr-3")}>DAYS</th>
            <th scope="col" className={cn(head, "pr-3")}>FROM</th>
            <th scope="col" className={head}>SEATS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.href}-${r.date}`}>
              <td className={cn(cell, data, "pr-3")}>{r.date}</td>
              <th scope="row" className={cn(cell, "pr-3 text-left font-normal")}>
                <TripLink row={r} />
              </th>
              <td className={cn(cell, data, "pr-3")}>{r.days}</td>
              <td className={cn(cell, data, "pr-3")}>{formatINR(r.price)}</td>
              <td className={cell}>
                <SeatBadge left={r.seatsLeft} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="m-0 flex list-none flex-col p-0 md:hidden">
        {rows.map((r) => (
          <li key={`${r.href}-${r.date}`} className="flex flex-col gap-2 border-t border-board-rule py-3">
            <TripLink row={r} />
            <span className="flex items-center gap-3">
              <span className={data}>{r.date}</span>
              <span className={data}>{formatINR(r.price)}</span>
              <span className="ml-auto">
                <SeatBadge left={r.seatsLeft} />
              </span>
            </span>
          </li>
        ))}
      </ul>
      {footnote && (
        <span className="font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-board-label">{footnote}</span>
      )}
    </section>
  );
}

function TripLink({ row }: { row: BoardRow }) {
  return (
    <Link href={row.href} className={cn(data, "text-on-board no-underline hover:text-flap hover:underline")}>
      {row.trip}
    </Link>
  );
}
