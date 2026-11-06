import { Calendar, ChevronDown, Ticket, User, Users } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";

/* ------------------------------------------------------------------ */
/* Hero search · Where / When / Vibe joined into one bar, GET → /trips  */
/* ------------------------------------------------------------------ */

function SearchSelect({
  label,
  name,
  options,
  last,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  last?: boolean;
}) {
  return (
    <label
      className={`flex min-w-0 flex-col justify-center gap-1.5 border-b-[1.5px] border-rule px-3 py-2 md:min-h-14 md:flex-1 md:border-b-0 md:px-4 md:py-0 ${last ? "" : "md:border-r-[1.5px]"}`}
    >
      <span className="type-label text-ink">{label}</span>
      <span className="relative block">
        <select
          name={name}
          className="w-full cursor-pointer appearance-none border-0 bg-transparent pr-7 font-sans text-[16px] font-semibold leading-[1.2] text-ink outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={20} strokeWidth={1.75} aria-hidden className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2" />
      </span>
    </label>
  );
}

export function HeroSearch({
  destinations,
  months,
  vibes,
}: {
  destinations: { value: string; label: string }[];
  months: { value: string; label: string }[];
  /** Trip tag labels; the field is left out until trips have tags. */
  vibes: { value: string; label: string }[];
}) {
  return (
    <form
      action="/trips"
      aria-label="Find a trip"
      className="flex flex-col gap-1 rounded-ticket border-[1.5px] border-line bg-card p-1 md:flex-row md:items-center"
    >
      <SearchSelect label="Where" name="destination" options={[{ value: "", label: "Anywhere" }, ...destinations]} />
      <SearchSelect label="When" name="month" options={[{ value: "", label: "Any month" }, ...months]} last={!vibes.length} />
      {vibes.length > 0 && <SearchSelect label="Vibe" name="vibe" options={[{ value: "", label: "Any vibe" }, ...vibes]} last />}
      <button type="submit" className={buttonClasses({ className: "w-full md:w-auto md:flex-none" })}>
        Find trips →
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Why Ghumbo                                                          */
/* ------------------------------------------------------------------ */

const WHY: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <Calendar size={24} strokeWidth={1.75} aria-hidden />,
    title: "Fixed dates",
    body: "Every trip leaves on a set day. Pick one, grab a seat, done. No group chat needed.",
  },
  {
    icon: <Users size={24} strokeWidth={1.75} aria-hidden />,
    title: "Groups of up to 18",
    body: "Big enough to make friends, small enough to fit in one Tempo Traveller.",
  },
  {
    icon: <Ticket size={24} strokeWidth={1.75} aria-hidden />,
    title: "Stays, transfers and permits sorted",
    body: "Homestays, jeeps, ferries and the paperwork. You just show up at the hub.",
  },
  {
    icon: <User size={24} strokeWidth={1.75} aria-hidden />,
    title: "A coordinator on every trip",
    body: "Someone who knows the 4 am alarm, the good momo shop and the way back.",
  },
];

export function WhyGhumbo() {
  return (
    <section className="page-container flex flex-col gap-6 py-7 md:py-10">
      <SectionHeader kicker="Why Ghumbo" title="The boring bits, handled" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-6 min-[62.5625rem]:grid-cols-4">
        {WHY.map((w) => (
          <div key={w.title} className="ticket-surface flex flex-col gap-2.5 p-5">
            <span className="flex text-link">{w.icon}</span>
            <h3 className="m-0 text-[18px] font-bold leading-[1.3] [font-stretch:110%]">{w.title}</h3>
            <p className="m-0 type-small text-muted">{w.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Book in three steps                                                 */
/* ------------------------------------------------------------------ */

const STEPS = [
  { title: "Pick a date", body: "Choose a trip and a fixed departure. Seats left are live on the board." },
  { title: "Request a seat", body: "Tell us who is coming. No payment now. We call within 24 hours." },
  {
    title: "Confirm and go",
    body: "After the call, pay in full by secure link and your seat is confirmed. Trip pack a week before; meet the group at the hub.",
  },
];

export function BookingSteps() {
  return (
    <section className="page-container flex flex-col gap-6 pt-7 pb-7 md:pt-10 md:pb-24">
      <SectionHeader kicker="How it works" title="Book in three steps" action={<TextLink href="/how-it-works">How it works →</TextLink>} />
      <ol className="m-0 grid list-none gap-4 p-0 md:gap-6 min-[62.5625rem]:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="ticket-surface flex flex-col">
            <div className="flex items-center gap-4 p-5">
              <span className="font-sans text-[36px] font-extrabold leading-none tracking-[-0.02em] text-red [font-stretch:115%]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="m-0 text-[18px] font-bold leading-[1.3] [font-stretch:110%]">{s.title}</h3>
            </div>
            <TearLine />
            <p className="m-0 px-5 pt-4 pb-5 type-body text-ink">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
