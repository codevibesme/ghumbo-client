import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { STATUS, dateRange, formatMoney, formatStamp, statusLine, travellers } from "@/features/account/lib";
import type { UserBookingRequest } from "../types";

/*
 * T12 request ticket: reference, trip, dates, facts and one line on the left;
 * a torn-off status stub on the right (below on phones). No photo: the
 * request carries no trip asset.
 */
export function RequestCard({ request: r }: { request: UserBookingRequest }) {
  const meta = STATUS[r.status];
  const estimate = Number(r.estimate);
  const open = r.status !== "closed" && r.status !== "withdrawn" && r.status !== "converted";

  return (
    <article className="flex flex-col rounded-ticket border-[1.5px] border-line bg-card md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-5 py-5 md:px-6">
        <span className="type-stub text-muted">
          {r.code} · {r.destinationName}
        </span>
        <h3 className="m-0 type-h3">
          <Link href={`/my-trips/${encodeURIComponent(r.code)}`} className="text-ink no-underline hover:text-red">
            {r.tripName}
          </Link>
        </h3>
        <span className="type-data">{dateRange(r)}</span>
        <dl className="m-0 mt-2 flex flex-wrap gap-x-8 gap-y-3">
          <div className="flex flex-col gap-1.5">
            <dt className="type-stub text-muted">Travellers</dt>
            <dd className="m-0 text-[15px] font-semibold leading-[1.3]">{travellers(r.travelerCount)}</dd>
          </div>
          {Number.isFinite(estimate) && estimate > 0 && (
            <div className="flex flex-col gap-1.5">
              <dt className="type-stub text-muted">Estimate</dt>
              <dd className="m-0 font-mono text-[16px] font-semibold leading-[1.2] tracking-[0.02em]">
                {open ? "≈ " : ""}
                {formatMoney(estimate, r.currency)}
              </dd>
            </div>
          )}
        </dl>
        <p className="m-0 mt-1 max-w-[64ch] type-small text-muted">{r.statusNotes || statusLine(r)}</p>
      </div>

      <TearLine orientation="vertical" className="hidden md:block" />
      <TearLine className="md:hidden" />

      <div className="flex shrink-0 flex-col items-start gap-2.5 p-5 md:w-60">
        <span className="type-stub text-muted">Status</span>
        <span className="py-1">
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </span>
        <span className="font-mono text-[12px] font-medium leading-[1.3] tracking-[0.04em] text-muted">
          SINCE {formatStamp(r.updatedAt)}
        </span>
        <Link
          href={`/my-trips/${encodeURIComponent(r.code)}`}
          className={buttonClasses({ variant: "secondary", size: "m", className: "mt-auto" })}
          aria-label={`View request ${r.code}`}
        >
          View request
        </Link>
      </div>
    </article>
  );
}
