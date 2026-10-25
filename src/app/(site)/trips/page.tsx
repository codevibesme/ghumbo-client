import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { TourCard } from "@/features/tours/components/tour-cards";
import { getAllTrips } from "@/features/tours/api";
import { isListable, monthLabel, toTourSummary } from "@/features/tours/mappers";
import type { TripListItem } from "@/features/tours/types";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "All group trips",
  description: "Every Ghumbo group trip on fixed dates: groups of up to 18, prices per person, twin sharing, GST included.",
  alternates: { canonical: "/trips" },
};

/*
 * B02 All trips. Filters are plain links that set query params, so the page
 * works without JS and filtered URLs canonicalise to /trips. Month matches a
 * trip's next departure only (the list endpoint returns just that one).
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

type Filters = { destination?: string; month?: string; budget?: string; duration?: string; sort?: string };

export default function TripsPage({ searchParams }: PageProps<"/trips">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-8 pt-8 pb-16">
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Trips" }]} />
        <h1 className="m-0 type-h1">All trips</h1>
        <p className="m-0 max-w-[60ch] type-body text-muted">
          Showing every live destination. Fixed dates, groups of up to 18; prices are per person, twin sharing, GST included.
        </p>
      </div>
      <Suspense fallback={<TripsBoard trips={null} filters={{}} />}>
        <FilteredTrips searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function FilteredTrips({ searchParams }: Pick<PageProps<"/trips">, "searchParams">) {
  const raw = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
  const filters: Filters = {
    destination: one(raw.destination),
    month: one(raw.month),
    budget: one(raw.budget),
    duration: one(raw.duration),
    sort: one(raw.sort),
  };
  return <TripsBoard trips={await getAllTrips()} filters={filters} />;
}

function hrefWith(filters: Filters, key: keyof Filters, value: string | undefined) {
  const next = { ...filters, [key]: filters[key] === value ? undefined : value };
  const qs = new URLSearchParams(Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])));
  const s = qs.toString();
  return s ? `/trips?${s}` : "/trips";
}

function FilterGroup({
  title,
  name,
  options,
  filters,
}: {
  title: string;
  name: keyof Filters;
  options: { value: string; label: string }[];
  filters: Filters;
}) {
  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="m-0 type-label text-ink">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = filters[name] === o.value;
          return (
            <Link
              key={o.value}
              href={hrefWith(filters, name, o.value)}
              aria-current={active ? "true" : undefined}
              rel="nofollow"
              scroll={false}
              className={cn(
                "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-chip border-[1.5px] px-3.5 no-underline md:h-10",
                "font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.06em]",
                active ? "border-passport bg-passport text-on-passport" : "border-line bg-card text-ink hover:bg-stock",
              )}
            >
              {active && "✓ "}
              {o.label}
            </Link>
          );
        })}
      </div>
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

function TripsBoard({ trips, filters }: { trips: TripListItem[] | null; filters: Filters }) {
  const all = trips ?? [];
  const destinations = [...new Map(all.flatMap((t) => (t.destination ? [[t.destination.slug, t.destination.name]] : []))).entries()].map(
    ([value, label]) => ({ value, label }),
  );
  const months = [...new Set(all.filter(isListable).map((t) => t.nextDeparture.startDate.slice(0, 7)))]
    .sort()
    .map((m) => ({ value: m, label: monthLabel(m) }));
  const shown = applyFilters(all, filters);
  const anyFilter = Boolean(filters.destination || filters.month || filters.budget || filters.duration);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside aria-label="Filters" className="flex flex-col gap-6 lg:sticky lg:top-6">
        <div className="flex items-center justify-between">
          <h2 className="m-0 type-h4">Filters</h2>
          {anyFilter && (
            <Link href="/trips" className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-link underline underline-offset-4">
              Clear all
            </Link>
          )}
        </div>
        <FilterGroup title="Destination" name="destination" options={destinations} filters={filters} />
        <FilterGroup title="Month" name="month" options={months} filters={filters} />
        <FilterGroup title="Budget, per person" name="budget" options={BUDGETS} filters={filters} />
        <FilterGroup title="Duration" name="duration" options={DURATIONS} filters={filters} />
      </aside>

      <section aria-label="Trips" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 type-label text-muted" aria-live="polite">
            {trips ? `${shown.length} ${shown.length === 1 ? "trip" : "trips"}` : "Loading trips…"}
          </p>
          <FilterGroup title="Sort" name="sort" options={SORTS} filters={filters} />
        </div>
        {trips && shown.length === 0 ? (
          <EmptyState
            icon={<SearchX size={24} aria-hidden />}
            title="No trips match all of that"
            action={
              <Link href="/trips" className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-link underline underline-offset-4">
                Clear filters
              </Link>
            }
          >
            Drop a filter or two and the board fills up again.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
            {shown.map((t) => {
              const tour = toTourSummary(t);
              return tour && <TourCard key={t.id} tour={tour} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
