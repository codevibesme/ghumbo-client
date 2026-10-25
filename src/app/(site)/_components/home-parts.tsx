import { ChevronDown, ClipboardCheck, CalendarCheck, UserRoundCheck, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";

/* ------------------------------------------------------------------ */
/* Hero search · Where / When joined into one bar, GET → /trips         */
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
      className={`flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 ${last ? "" : "border-b-[1.5px] border-rule md:border-r-[1.5px] md:border-b-0"}`}
    >
      <span className="type-label text-ink">{label}</span>
      <span className="relative block">
        <select
          name={name}
          className="w-full cursor-pointer appearance-none border-0 bg-transparent pr-7 font-sans text-[16px] leading-[1.2] text-ink outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} aria-hidden className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2" />
      </span>
    </label>
  );
}

export function HeroSearch({
  destinations,
  months,
}: {
  destinations: { value: string; label: string }[];
  months: { value: string; label: string }[];
}) {
  return (
    <form
      action="/trips"
      aria-label="Find a trip"
      className="flex flex-col gap-1 rounded-ticket border-[1.5px] border-line bg-card p-1 md:flex-row md:items-center"
    >
      <SearchSelect label="Where" name="destination" options={[{ value: "", label: "Anywhere" }, ...destinations]} />
      <SearchSelect label="When" name="month" options={[{ value: "", label: "Any month" }, ...months]} last />
      <button type="submit" className={buttonClasses({ className: "md:flex-none" })}>
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
    icon: <CalendarCheck size={24} aria-hidden />,
    title: "Fixed dates",
    body: "Every trip leaves on a set day. Pick one, grab a seat, done. No group chat needed.",
  },
  {
    icon: <UsersRound size={24} aria-hidden />,
    title: "Groups of up to 18",
    body: "Big enough to make friends, small enough to fit in one Tempo Traveller.",
  },
  {
    icon: <ClipboardCheck size={24} aria-hidden />,
    title: "Stays, transfers and permits sorted",
    body: "Homestays, jeeps, ferries and the paperwork. You just show up at the hub.",
  },
  {
    icon: <UserRoundCheck size={24} aria-hidden />,
    title: "A coordinator on every trip",
    body: "Someone who knows the 4 am alarm, the good momo shop and the way back.",
  },
];

export function WhyGhumbo() {
  return (
    <section className="page-container flex flex-col gap-6 py-10">
      <SectionHeader kicker="Why Ghumbo" title="The boring bits, handled" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {WHY.map((w) => (
          <div key={w.title} className="flex flex-col gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-full border-[1.5px] border-line bg-card text-link">
              {w.icon}
            </span>
            <h3 className="m-0 type-h4">{w.title}</h3>
            <p className="m-0 type-body text-muted">{w.body}</p>
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
    body: "After the call, a deposit by secure link confirms your seat. Trip pack a week before; meet the group at the hub.",
  },
];

export function BookingSteps() {
  return (
    <section className="page-container flex flex-col gap-6 py-10">
      <SectionHeader kicker="How it works" title="Book in three steps" action={<TextLink href="/how-it-works">How it works →</TextLink>} />
      <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="ticket-surface flex flex-col">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4">
              <span className="font-mono text-[28px] font-semibold leading-none text-red">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="m-0 type-h3">{s.title}</h3>
            </div>
            <TearLine />
            <p className="m-0 px-5 pt-4 pb-5 type-body text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
