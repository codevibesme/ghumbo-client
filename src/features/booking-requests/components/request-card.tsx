import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { STATUS, dateRange, formatMoney, formatStamp, statusLine, travellers } from "@/features/account/lib";
import type { UserBookingRequest } from "../types";

/*
 * T12 request ticket: the trip's photo (200px column on desktop, 16:9 on top
 * on phones), then reference, trip, dates, facts and one line; a torn-off
 * status stub on the right (below on phones).
 */
export function RequestCard({ request: r }: { request: UserBookingRequest }) {
  const meta = STATUS[r.status];
  const estimate = Number(r.estimate);
  const open = r.status !== "closed" && r.status !== "withdrawn" && r.status !== "converted";
  const photo = r.tripAsset?.type === "image" ? r.tripAsset : null;

  return (
    <article className="flex flex-col rounded-ticket border-[1.5px] border-line bg-card md:flex-row">
      {photo && (
        <span className="relative block aspect-video shrink-0 overflow-hidden rounded-t-[4.5px] border-b-[1.5px] border-line md:aspect-auto md:w-[200px] md:rounded-l-[4.5px] md:rounded-tr-none md:border-r-[1.5px] md:border-b-0">
          <Image
            src={photo.url}
            alt={photo.label ?? r.tripName}
            fill
            sizes="(min-width: 720px) 200px, 100vw"
            className="object-cover"
          />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 md:px-6 md:py-5">
        <span className="type-stub text-muted">
          {r.code} · SENT {formatStamp(r.createdAt)}
        </span>
        <h3 className="m-0 type-h3">
          <Link href={`/my-trips/${encodeURIComponent(r.code)}`} className="text-ink no-underline hover:text-red">
            {r.tripName}
          </Link>
        </h3>
        <span className="flex flex-wrap items-center gap-2">
          <span className="type-data">{dateRange(r)}</span>
          {r.isPeak && <Badge tone="peak">Peak</Badge>}
        </span>
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

      {/* Phone: status and time on the left, the button on the right. Desktop: a 240px stub. */}
      <div className="flex shrink-0 items-center justify-between gap-3 p-4 md:w-60 md:flex-col md:items-start md:justify-start md:gap-2.5 md:p-5">
        <span className="flex min-w-0 flex-col items-start gap-2 md:gap-2.5">
          <span className="hidden type-stub text-muted md:block">Status</span>
          <span className="md:py-1">
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </span>
          <span className="font-mono text-[12px] font-medium leading-[1.3] tracking-[0.04em] text-muted">
            SINCE {formatStamp(r.updatedAt)}
          </span>
        </span>
        <Link
          href={`/my-trips/${encodeURIComponent(r.code)}`}
          className={buttonClasses({ variant: "secondary", size: "m", className: "shrink-0 md:mt-auto" })}
          aria-label={`View request ${r.code}`}
        >
          View request
        </Link>
      </div>
    </article>
  );
}
