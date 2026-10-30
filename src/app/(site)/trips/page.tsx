import { ListFilter, SearchX, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Stamp } from "@/components/ui/stamp";
import { TearLine } from "@/components/ui/tear-line";
import { TextLink } from "@/components/ui/text-link";
import { buttonClasses, textLinkClasses } from "@/components/ui/variants";
import { getAllTrips, searchTrips } from "@/features/tours/api";
import { TourCard } from "@/features/tours/components/tour-cards";
import { isListable, monthLabel, toTourSummaries, vibeOptions } from "@/features/tours/mappers";
import type { TripListItem } from "@/features/tours/types";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "All group trips",
  description: "Every Ghumbo group trip on fixed dates: groups of up to 18, prices per person, twin sharing, GST included.",
  alternates: { canonical: "/trips" },
};

/*
 * T02 All trips (+ T15 no results). Free text (?q=) and the vibe (?vibe=, a
 * trip tag label) go to the backend; destination, month, budget, duration and
 * sort then narrow that result here. Filters are plain links that set query
 * params, so the page works without JS and filtered URLs canonicalise to
 * /trips. Month matches a trip's next departure only (the list endpoint
 * returns just that one). No Popular sort: there's nothing to rank by.
 */

const BUDGETS = [
  { value: "under-6000", label: "Under ₹6,000", test: (p: number) => p < 6000 },
  { value: "6000-10000", label: "₹6,000–10,000", test: (p: number) => p >= 6000 && p <= 10000 },
  { value: "over-10000", label: "Over ₹10,000", test: (p: number) => p > 10000 },
];

const DURATIONS = [
  { value: "short", label: "Up to 3 days", test: (d: number) => d <= 3 },
  { value: "medium", label: "4–5 days", test: (d: number) => d >= 4 && d <= 5 },
  { value: "long", label: "6+ days", test: (d: number) => d >= 6 },
];

const SORTS = [
  { value: "soonest", label: "Soonest" },
  { value: "price", label: "Price low to high" },
];

type Filters = { q?: string; vibe?: string; destination?: string; month?: string; budget?: string; duration?: string; sort?: string };
type Option = { value: string; label: string };

const plural = (n: number) => `${n} ${n === 1 ? "trip" : "trips"}`;

export default function TripsPage({ searchParams }: PageProps<"/trips">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-6 pt-8 pb-16 md:gap-8">
      <Suspense fallback={<TripsBoard trips={null} catalog={[]} filters={{}} />}>
        <FilteredTrips searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function FilteredTrips({ searchParams }: Pick<PageProps<"/trips">, "searchParams">) {
  const raw = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const filters: Filters = {
    q: one(raw.q)?.slice(0, 80),
    vibe: one(raw.vibe)?.slice(0, 50),
    destination: one(raw.destination),
    month: one(raw.month),
    budget: one(raw.budget),
    duration: one(raw.duration),
    sort: one(raw.sort),
  };
  const [catalog, trips] = await Promise.all([
    getAllTrips(),
    filters.q || filters.vibe ? searchTrips(filters.q, filters.vibe) : null,
  ]);
  return <TripsBoard trips={trips ?? catalog} catalog={catalog} filters={filters} />;
}

function hrefFor(filters: Filters) {
  const qs = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => Boolean(e[1])));
  const s = qs.toString();
  return s ? `/trips?${s}` : "/trips";
}

/** Toggle one filter; sort's default ("soonest") is never written to the URL. */
function hrefWith(filters: Filters, key: keyof Filters, value: string | undefined) {
  const next = key === "sort" ? (value === "soonest" ? undefined : value) : filters[key] === value ? undefined : value;
  return hrefFor({ ...filters, [key]: next });
}

const chipClasses = (active: boolean) =>
  cn(
    "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-chip border-[1.5px] px-3.5 no-underline md:h-10",
    "font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.06em]",
    active ? "border-passport bg-passport text-on-passport" : "border-line bg-card text-ink hover:bg-stock",
  );

function ChipLinks({ name, options, filters, label }: { name: keyof Filters; options: Option[]; filters: Filters; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = name === "sort" ? (filters.sort ?? "soonest") === o.value : filters[name] === o.value;
        return (
          <Link
            key={o.value}
            href={hrefWith(filters, name, o.value)}
            aria-current={active ? "true" : undefined}
            rel="nofollow"
            scroll={false}
            className={chipClasses(active)}
          >
            {active && "✓ "}
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

function FilterGroup({ title, name, options, filters }: { title: string; name: keyof Filters; options: Option[]; filters: Filters }) {
  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="m-0 type-label text-ink">{title}</h3>
      <ChipLinks name={name} options={options} filters={filters} label={title} />
    </div>
  );
}

function applyFilters(trips: TripListItem[], f: Filters) {
  const shown = trips.filter(isListable).filter((t) => {
    if (f.destination && t.destination?.slug !== f.destination) return false;
    if (f.month && !t.nextDeparture.startDate.startsWith(f.month)) return false;
    const budget = BUDGETS.find((b) => b.value === f.budget);
    if (budget && !budget.test(t.startingPrice.amount)) return false;
    const dur = DURATIONS.find((d) => d.value === f.duration);
    if (dur && !dur.test(t.durationDays)) return false;
    return true;
  });
  if (f.sort === "price") shown.sort((a, b) => a.startingPrice.amount - b.startingPrice.amount);
  return shown;
}

function TripsBoard({ trips, catalog, filters }: { trips: TripListItem[] | null; catalog: TripListItem[]; filters: Filters }) {
  // Facets come from the whole catalog so they don't vanish while a search is on.
  const destinations: Option[] = [
    ...new Map(catalog.flatMap((t) => (t.destination ? [[t.destination.slug, t.destination.name] as const] : []))).entries(),
  ].map(([value, label]) => ({ value, label }));
  const months: Option[] = [...new Set(catalog.filter(isListable).map((t) => t.nextDeparture.startDate.slice(0, 7)))]
    .sort()
    .map((m) => ({ value: m, label: monthLabel(m) }));
  const vibes = vibeOptions(catalog);
  const shown = applyFilters(trips ?? [], filters);

  const labelOf: Record<Exclude<keyof Filters, "sort">, (v: string) => string> = {
    q: (v) => `Search: ${v}`,
    vibe: (v) => `Vibe: ${v}`,
    destination: (v) => destinations.find((o) => o.value === v)?.label ?? v,
    month: (v) => (/^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? monthLabel(v) : v),
    budget: (v) => BUDGETS.find((o) => o.value === v)?.label ?? v,
    duration: (v) => DURATIONS.find((o) => o.value === v)?.label ?? v,
  };
  const applied = (Object.keys(labelOf) as (keyof typeof labelOf)[]).flatMap((key) => {
    const v = filters[key];
    return v ? [{ key, label: labelOf[key](v) }] : [];
  });
  const filterCount = applied.filter((a) => a.key !== "q").length;
  const clearAllHref = hrefFor({ sort: filters.sort });

  const searchMissed = Boolean(trips && filters.q && !trips.some(isListable));
  const countLine = !trips
    ? "Loading trips…"
    : filters.q
      ? `${plural(shown.length)} ${shown.length === 1 ? "matches" : "match"} “${filters.q}”.`
      : filterCount
        ? `${plural(shown.length)} ${shown.length === 1 ? "matches" : "match"} these filters.`
        : `${plural(shown.length)} on the board.`;

  const panel = (
    <>
      <FilterGroup title="Destination" name="destination" options={destinations} filters={filters} />
      <FilterGroup title="Vibe" name="vibe" options={vibes} filters={filters} />
      <FilterGroup title="Month" name="month" options={months} filters={filters} />
      <FilterGroup title="Budget, per person" name="budget" options={BUDGETS} filters={filters} />
      <FilterGroup title="Duration" name="duration" options={DURATIONS} filters={filters} />
    </>
  );

  return (
    <>
      <div className="flex flex-col">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Trips" }]} />
        <h1 className="m-0 mt-4 type-h1">All trips</h1>
        <p className="m-0 mt-4 max-w-[52ch] type-body-l font-semibold" aria-live="polite">
          {countLine}
        </p>
        <p className="m-0 mt-2 max-w-[68ch] type-small text-muted">
          Showing every live destination. Fixed dates, groups of up to 18; prices are per person, twin sharing, GST included.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="Filters" className="ticket-surface hidden flex-col lg:sticky lg:top-6 lg:flex">
          <div className="flex min-h-[60px] items-center justify-between px-5 py-2">
            <h2 className="m-0 type-label text-ink">Filters</h2>
            {filterCount > 0 && (
              <Link href={clearAllHref} rel="nofollow" className={textLinkClasses()}>
                Clear all
              </Link>
            )}
          </div>
          <TearLine />
          <div className="flex flex-col gap-6 px-5 pt-4 pb-6">{panel}</div>
        </aside>

        <section aria-label="Trips" className="flex min-w-0 flex-col gap-5">
          {/* Phone: filters fold into a disclosure so the results stay near the top. */}
          <details className="group lg:hidden">
            <summary className={buttonClasses({ variant: "secondary", fullWidth: true, className: "list-none [&::-webkit-details-marker]:hidden" })}>
              <ListFilter size={20} aria-hidden />
              Filters{filterCount > 0 && ` (${filterCount})`}
            </summary>
            <div className="mt-3 flex flex-col gap-6 rounded-ticket border-[1.5px] border-line bg-card p-5">{panel}</div>
          </details>

          <div className="flex flex-wrap items-center gap-3">
            <span className="type-label text-ink">Sort</span>
            <ChipLinks name="sort" options={SORTS} filters={filters} label="Sort" />
          </div>

          {applied.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {applied.map((a) => (
                <Link
                  key={a.key}
                  href={hrefFor({ ...filters, [a.key]: undefined })}
                  aria-label={`Remove ${a.key === "q" ? "search" : "filter"}: ${a.label}`}
                  rel="nofollow"
                  scroll={false}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-chip border-[1.5px] border-passport bg-passport-tint pr-2.5 pl-3.5 no-underline md:h-10",
                    "font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-link",
                  )}
                >
                  {a.label}
                  <X size={16} aria-hidden />
                </Link>
              ))}
              <Link href={filters.sort ? `/trips?sort=${filters.sort}` : "/trips"} rel="nofollow" className={cn(textLinkClasses(), "ml-2")}>
                Clear all
              </Link>
            </div>
          )}

          <hr className="m-0 border-0 border-t-2 border-dashed border-tear" />

          {searchMissed ? (
            <NoResults q={filters.q ?? ""} filters={filters} catalog={catalog} />
          ) : trips && shown.length === 0 ? (
            <EmptyState
              icon={<SearchX size={24} aria-hidden />}
              title="No trips match all of that"
              action={
                <Link href={hrefFor({ q: filters.q, sort: filters.sort })} rel="nofollow" className={buttonClasses({ variant: "secondary", size: "m" })}>
                  Clear filters
                </Link>
              }
            >
              Drop a filter or two and the board fills up again.
            </EmptyState>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
              {toTourSummaries(shown).map((t) => (
                <TourCard key={t.href} tour={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* T15 No results · the search text matched nothing                    */
/* ------------------------------------------------------------------ */

function NoResults({ q, filters, catalog }: { q: string; filters: Filters; catalog: TripListItem[] }) {
  const live = catalog.filter(isListable);
  // Suggestions: Ghumbo picks first, then the soonest departures (catalog order).
  const suggestions = toTourSummaries(live.toSorted((a, b) => Number(Boolean(b.isRecommended)) - Number(Boolean(a.isRecommended)))).slice(0, 3);
  const places = [...new Set(live.flatMap((t) => (t.destination ? [t.destination.name] : [])))].slice(0, 2);

  return (
    <div className="flex flex-col gap-12">
      <section aria-label="No trips found" className="ticket-surface flex flex-col gap-4 p-6 md:p-8">
        <span className="self-start px-1 pt-1 pb-2">
          <Stamp>0 trips · {q.length > 24 ? `${q.slice(0, 24)}…` : q}</Stamp>
        </span>
        <h2 className="m-0 type-h2">Nothing on the board for “{q}”.</h2>
        <p className="m-0 max-w-[60ch] type-body">
          We looked through trip names, destinations and descriptions.
          {places.length > 0 && ` Try a place, like ${places.join(" or ")}, or clear the search to see every trip.`}
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href={hrefFor({ ...filters, q: undefined })} rel="nofollow" className={buttonClasses({ size: "m" })}>
            Clear search
          </Link>
          {places[0] && (
            <Link href={hrefFor({ q: places[0] })} rel="nofollow" className={buttonClasses({ variant: "secondary", size: "m" })}>
              Search {places[0]}
            </Link>
          )}
        </div>
      </section>

      {suggestions.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeader kicker="Leaving soon" title="Try these instead" action={<TextLink href="/trips">All trips →</TextLink>} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(256px,100%),1fr))] gap-6">
            {suggestions.map((t) => (
              <TourCard key={t.href} tour={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
