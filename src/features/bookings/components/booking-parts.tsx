import { Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/variants";
import { supportEmail, supportPhone } from "@/config/site";
import { formatShortDate } from "@/features/account/lib";
import { shortName } from "@/features/tours/mappers";
import { firstNames, travellersWord } from "../lib";
import type { UserBooking } from "../types";

/** "Darjeeling · Fri 19 Mar · 3 travellers". */
export function TripLine({ booking: b, className }: { booking: UserBooking; className?: string }) {
  return (
    <span className={className}>
      {shortName(b.tripName)} · {formatShortDate(b.startDate)} · {travellersWord(b.travelerCount)}
    </span>
  );
}

/** The one-row ticket under failure and expiry messages: trip, date, names, code. */
export function BookingStrip({ booking: b, children }: { booking: UserBooking; children?: ReactNode }) {
  return (
    <section
      aria-label="Your booking"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-ticket border-[1.5px] border-line bg-card px-5 py-4"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-[17px] font-bold leading-[1.25]">{b.tripName}</h2>
        <span className="font-mono text-[13px] font-semibold uppercase leading-[1.3] tracking-[0.02em]">
          {formatShortDate(b.startDate)} · {firstNames(b)} · {b.code}
        </span>
      </div>
      {children}
    </section>
  );
}

/** "Money left your account anyway?" — late payments still confirm, or come back. */
export function MoneyLeftNote() {
  return (
    <section aria-labelledby="money-h" className="flex flex-col gap-2 rounded-ticket border-[1.5px] border-dashed border-line px-5 py-4">
      <h2 id="money-h" className="m-0 type-h4">
        Money left your account anyway?
      </h2>
      <p className="m-0 type-small text-muted">
        Banks sometimes take a minute. If it clears before the timer ends, we confirm your seats automatically. If it doesn’t,
        it comes back in 5–7 working days. You’ll never pay twice.
      </p>
    </section>
  );
}

/** Support block: call button (when there's a number), email, and the code to quote. */
export function SupportCard({ code }: { code: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-ticket border-[1.5px] border-line bg-card px-5 py-4">
      <span className="type-stub text-muted">Questions?</span>
      {supportPhone && (
        <a href={supportPhone.href} className={buttonClasses({ variant: "secondary", fullWidth: true, className: "my-1 gap-2.5" })}>
          <Phone size={18} strokeWidth={1.75} aria-hidden /> Call {supportPhone.display}
        </a>
      )}
      <a href={`mailto:${supportEmail}`} className="type-h4 break-all text-link hover:text-red">
        {supportEmail}
      </a>
      <span className="font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
        Quote {code} when you {supportPhone ? "call or write" : "write"}
      </span>
    </div>
  );
}

export function PickAnotherDate({ booking: b }: { booking: UserBooking }) {
  return (
    <Link href={`/trips/${b.tripSlug}#departures`} className="text-link hover:text-red">
      pick another date
    </Link>
  );
}
