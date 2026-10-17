import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, SeatBadge } from "@/components/ui/badge";
import { Stamp } from "@/components/ui/stamp";
import { TearLine } from "@/components/ui/tear-line";
import type { TourSummary } from "@/features/tours/types";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import { RouteLine } from "./route-line";

/*
 * Tour tickets. The whole card is one link. Stub below a notched tear line holds
 * next date, seats and price. Card rules (from the canvas):
 *  - route: "HUB → END · 4D / 3N" (Sandakphu adds "· trek")
 *  - next departure = first open date, "FRI 13 NOV"
 *  - price = adult twin-sharing price of that date, "From, per person"
 *  - one seats badge, plus PEAK only if that date is peak
 *  - GHUMBO PICK only on Darjeeling: Queen of the Hills
 *  - sold out: greyscale photo + M stamp (the one stamp in its view)
 *  - grids gap 24 so notches never touch
 */

function StubLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("type-stub text-muted", className)}>{children}</span>;
}

/** Grid card: 16:10 photo, body, notched tear, stub. Home, destination and trips grids. */
export function TourCard({ tour, className, ground }: { tour: TourSummary; className?: string; ground?: string }) {
  const soldOut = tour.seatsLeft <= 0;
  return (
    <Link
      href={tour.href}
      className={cn("ticket-surface flex min-w-0 flex-col text-ink no-underline transition-colors hover:bg-sunk", className)}
    >
      <div className="relative aspect-16/10 overflow-hidden rounded-t-[4.5px] border-b-[1.5px] border-line">
        <Image
          src={tour.image.src}
          alt={tour.image.alt}
          fill
          sizes="(min-width: 720px) 384px, 100vw"
          className={cn("object-cover", soldOut && "grayscale")}
        />
        {tour.pick && !soldOut && (
          <span className="absolute top-3 left-3">
            <Badge tone="pick">Ghumbo pick</Badge>
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Stamp size="m">Sold out</Stamp>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
        <StubLabel>{tour.route}</StubLabel>
        <h3 className="m-0 type-h3">{tour.title}</h3>
        {tour.blurb && <p className="m-0 type-small text-muted">{tour.blurb}</p>}
      </div>
      <TearLine ground={ground} />
      <div className="flex items-end justify-between gap-3 px-5 pt-4 pb-[18px]">
        <span className="flex flex-col gap-1.5">
          <StubLabel>Next departure</StubLabel>
          <span className="type-data">{tour.nextDeparture}</span>
          <span className="mt-1 flex gap-1.5">
            <SeatBadge left={tour.seatsLeft} />
            {tour.peak && !soldOut && <Badge tone="peak">Peak</Badge>}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1.5">
          <StubLabel>From, per person</StubLabel>
          <span className={cn("type-price-m", soldOut && "text-muted")}>{formatINR(tour.price)}</span>
        </span>
      </div>
    </Link>
  );
}

/** Desktop compact row: photo | body + route | vertical tear | stub. Needs ≥ 720px. */
export function TourListCard({ tour, className, ground }: { tour: TourSummary; className?: string; ground?: string }) {
  return (
    <Link
      href={tour.href}
      className={cn("ticket-surface flex min-h-[168px] min-w-0 text-ink no-underline transition-colors hover:bg-sunk", className)}
    >
      <span className="relative w-[200px] shrink-0 overflow-hidden rounded-l-[4.5px] border-r-[1.5px] border-line">
        <Image src={tour.image.src} alt={tour.image.alt} fill sizes="200px" className="object-cover" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-[22px] py-[18px]">
        <span className="flex flex-wrap items-center gap-2">
          <StubLabel>{tour.route}</StubLabel>
          {tour.pick && <Badge tone="pick">Ghumbo pick</Badge>}
          {tour.peak && <Badge tone="peak">Peak</Badge>}
        </span>
        <h3 className="m-0 type-h3">{tour.title}</h3>
        {tour.blurb && <p className="m-0 type-small text-muted">{tour.blurb}</p>}
        {tour.stops && <RouteLine stops={tour.stops} className="mt-auto pt-1.5" />}
      </div>
      <TearLine orientation="vertical" ground={ground} />
      <div className="flex w-[200px] shrink-0 flex-col gap-1.5 px-5 py-[18px]">
        <StubLabel>Next departure</StubLabel>
        <span className="type-data">{tour.nextDeparture}</span>
        <StubLabel className="mt-1.5">From, per person</StubLabel>
        <span className="type-price-m">{formatINR(tour.price)}</span>
        <span className="mt-auto flex gap-1.5 pt-2">
          <SeatBadge left={tour.seatsLeft} />
        </span>
      </div>
    </Link>
  );
}

/** Phone list card (358 wide): thumb + title, tear, date/seats + price. */
export function TourCompactCard({ tour, className, ground }: { tour: TourSummary; className?: string; ground?: string }) {
  return (
    <Link
      href={tour.href}
      className={cn("ticket-surface flex flex-col text-ink no-underline transition-colors hover:bg-sunk", className)}
    >
      <div className="flex gap-3.5 p-3">
        <span className="relative size-[88px] shrink-0 overflow-hidden rounded-chip">
          <Image src={tour.image.src} alt={tour.image.alt} fill sizes="88px" className="object-cover" />
        </span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <StubLabel>{tour.route}</StubLabel>
          <span className="text-[17px] font-extrabold leading-[1.2] [font-stretch:110%]">{tour.title}</span>
        </span>
      </div>
      <TearLine ground={ground} />
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="flex flex-col gap-1.5">
          <span className="font-mono text-[14px] font-semibold leading-none">{tour.nextDeparture}</span>
          <span className="flex gap-1.5">
            <SeatBadge left={tour.seatsLeft} />
            {tour.peak && <Badge tone="peak">Peak</Badge>}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1">
          <StubLabel>From</StubLabel>
          <span className="text-[22px] font-extrabold leading-none [font-stretch:115%]">{formatINR(tour.price)}</span>
        </span>
      </div>
    </Link>
  );
}
