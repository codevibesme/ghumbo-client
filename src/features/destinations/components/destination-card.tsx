import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { TearLine } from "@/components/ui/tear-line";
import { cn } from "@/lib/cn";

/** Live destination: photo, "LIVE · 9 TRIPS", name, line, CTA. Whole card links. */
export function DestinationCard({
  href,
  name,
  blurb,
  tripCount,
  image,
  className,
}: {
  href: string;
  name: string;
  blurb: string;
  tripCount: number;
  image: { src: string; alt: string };
  className?: string;
}) {
  return (
    <Link href={href} className={cn("ticket-surface flex flex-col text-ink no-underline hover:bg-sunk", className)}>
      <span className="relative aspect-video overflow-hidden rounded-t-[4.5px] border-b-[1.5px] border-line">
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 720px) 384px, 100vw" className="object-cover" />
      </span>
      <span className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
        <Badge tone="open">
          Live · {tripCount} {tripCount === 1 ? "trip" : "trips"}
        </Badge>
        <h3 className="m-0 type-h3">{name}</h3>
        <p className="m-0 type-small text-muted">{blurb}</p>
        <span className="mt-auto pt-2 font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em] text-link underline underline-offset-4">
          See {name} trips →
        </span>
      </span>
    </Link>
  );
}

/**
 * Destination ticket (Home "Where we go", country page): photo, notched tear,
 * LIVE badge, name, blurb, fact strip, "from" price and a text CTA. The whole
 * card links. Coming-soon places use <ComingSoonCard> instead.
 */
export function DestinationTicket({
  href,
  name,
  blurb,
  badge,
  image,
  facts,
  priceLabel,
  price,
  cta,
  className,
}: {
  href: string;
  name: string;
  blurb: string;
  /** "Live · 9 trips" */
  badge: string;
  image: { src: string; alt: string } | null;
  facts: { label: string; value: string; wide?: boolean }[];
  /** "9 trips · from, per person" */
  priceLabel: string;
  price: string;
  cta: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("ticket-surface flex min-w-0 flex-col text-ink no-underline hover:bg-sunk", className)}>
      <span className="relative h-[220px] overflow-hidden rounded-t-[4.5px]">
        {image ? (
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 720px) 384px, 100vw" className="object-cover" />
        ) : (
          <MountainsDrawing />
        )}
      </span>
      <TearLine />
      <span className="flex flex-1 flex-col gap-3 px-6 pt-5 pb-6">
        <Badge tone="open">{badge}</Badge>
        <h3 className="m-0 text-[28px] font-extrabold leading-[1.05] tracking-[-0.02em] [font-stretch:125%]">{name}</h3>
        <p className="m-0 type-body text-muted">{blurb}</p>
        {facts.length > 0 && (
          <span className="grid grid-cols-2 gap-4 border-y-[1.5px] border-rule py-3">
            {facts.map((f) => (
              <span key={f.label} className={cn("flex min-w-0 flex-col gap-1.5", f.wide && "col-span-full")}>
                <span className="type-stub text-muted">{f.label}</span>
                <span className="font-mono text-[16px] font-semibold uppercase leading-[1.2] tracking-[0.02em]">{f.value}</span>
              </span>
            ))}
          </span>
        )}
        <span className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <span className="flex flex-col gap-1.5">
            <span className="type-stub text-muted">{priceLabel}</span>
            <span className="type-price-m">{price}</span>
          </span>
          <span className="inline-flex min-h-11 items-center font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em] text-link underline decoration-[1.5px] underline-offset-4">
            {cta}
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * Coming-soon destination. Never a photo: ink line drawing on stock, flat
 * OPENING badge and a "Notify me" action (pass a Button as `action`).
 */
export function ComingSoonCard({
  name,
  blurb,
  opening,
  illustration = <MountainsDrawing />,
  action,
  className,
}: {
  name: string;
  blurb: string;
  /** "Opening 2027" */
  opening: string;
  illustration?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ticket-surface flex flex-col text-ink", className)}>
      <div className="aspect-video overflow-hidden rounded-t-[4.5px] border-b-[1.5px] border-line">{illustration}</div>
      <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
        <Badge tone="outline">{opening}</Badge>
        <h3 className="m-0 type-h3">{name}</h3>
        <p className="m-0 type-small text-muted">{blurb}</p>
        {action && <div className="mt-auto pt-2">{action}</div>}
      </div>
    </div>
  );
}

/** Default coming-soon drawing (Sikkim on the canvas): ridge, sun, tear, route. */
export function MountainsDrawing() {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden className="block size-full">
      <rect width="320" height="180" fill="var(--g-stock)" />
      <circle cx="250" cy="48" r="16" fill="none" stroke="var(--g-red)" strokeWidth="2" />
      <path
        d="M0 150 L70 70 L110 110 L160 40 L230 130 L270 95 L320 140"
        fill="none"
        stroke="var(--g-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M140 68 L160 40 L178 64" fill="none" stroke="var(--g-ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 162 H320" stroke="var(--g-tear)" strokeWidth="2" strokeDasharray="6 6" />
      <path
        d="M40 162 C80 150 100 172 150 158 S240 150 300 164"
        fill="none"
        stroke="var(--g-link)"
        strokeWidth="2"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
    </svg>
  );
}
