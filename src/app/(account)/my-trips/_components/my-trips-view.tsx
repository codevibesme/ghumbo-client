"use client";

import { RefreshCw, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Kicker } from "@/components/ui/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonClasses } from "@/components/ui/variants";
import { useSignedInUser } from "@/features/account/hooks";
import { fullName } from "@/features/auth/session";
import { BookingCard, CancelledRow, MissedRow, PendingCard } from "@/features/bookings/components/booking-card";
import { useMyBookings, useNow } from "@/features/bookings/hooks";
import { type BookingGroups, groupBookings } from "@/features/bookings/lib";
import { useToday } from "@/lib/use-today";

type Tab = "upcoming" | "past";

const findTrip = (
  <Link href="/trips" className={buttonClasses({ variant: "secondary", size: "m" })}>
    Find a trip
  </Link>
);

// T12 / T12b My trips: unpaid bookings (with their hold timer) on top, then upcoming trips, holds that ran out, and cancellations.
export function MyTripsView() {
  const user = useSignedInUser("/my-trips");
  const today = useToday();
  const now = useNow();
  const { result, retry } = useMyBookings(Boolean(user));
  const [tab, setTab] = useState<Tab>("upcoming");

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-end md:gap-4">
        <div className="flex flex-col gap-2">
          <Kicker>{user ? `Passenger · ${fullName(user)}` : "Passenger"}</Kicker>
          <h1 className="m-0 type-h1">My trips</h1>
        </div>
        <Link href="/trips" className="py-3.5 text-[15px] font-semibold leading-none text-link">
          Find another trip →
        </Link>
      </div>

      {!user || !today || now === null || result.status === "loading" ? (
        <div className="flex min-h-80 flex-col gap-6" aria-busy="true">
          <span className="sr-only">Loading your trips…</span>
          <div className="h-12 border-b-[1.5px] border-line" />
          {[0, 1].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-ticket border-[1.5px] border-rule bg-card" />
          ))}
        </div>
      ) : result.status === "error" ? (
        <EmptyState
          icon={<RefreshCw size={22} aria-hidden />}
          title="We couldn’t load your trips"
          action={
            <button type="button" onClick={retry} className={buttonClasses({ variant: "secondary", size: "m" })}>
              Try again
            </button>
          }
        >
          Your bookings are safe. This one’s on our side; give it a moment and try again.
        </EmptyState>
      ) : (
        <TripTabs groups={groupBookings(result.data, today, now)} today={today} tab={tab} onTab={setTab} onChange={retry} />
      )}
    </>
  );
}

function TripTabs({
  groups,
  today,
  tab,
  onTab,
  onChange,
}: {
  groups: BookingGroups;
  today: string;
  tab: Tab;
  onTab: (t: Tab) => void;
  onChange: () => void;
}) {
  const upcomingCount = groups.pending.length + groups.upcoming.length;
  return (
    <Tabs value={tab} onValueChange={(v) => onTab(v as Tab)} className="flex flex-col gap-6">
      <TabsList aria-label="My trips">
        <TabsTrigger value="upcoming">Upcoming{upcomingCount ? ` · ${upcomingCount}` : ""}</TabsTrigger>
        <TabsTrigger value="past">Past{groups.past.length ? ` · ${groups.past.length}` : ""}</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="flex flex-col gap-6">
        {groups.pending.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-4 p-0" aria-label="Waiting for payment">
            {groups.pending.map((b) => (
              <li key={b.id}>
                <PendingCard booking={b} onGone={onChange} />
              </li>
            ))}
          </ul>
        )}

        {groups.upcoming.length ? (
          <ul className="m-0 flex list-none flex-col gap-6 p-0">
            {groups.upcoming.map((b) => (
              <li key={b.id}>
                <BookingCard booking={b} today={today} />
              </li>
            ))}
          </ul>
        ) : (
          groups.pending.length === 0 && (
            <EmptyState icon={<Ticket size={22} aria-hidden />} title="No trips booked yet" action={findTrip}>
              Pick a trip, pay for your seat, and it shows up here with everything you need. Then just show up.
            </EmptyState>
          )
        )}

        {groups.missed.length > 0 && (
          <section aria-labelledby="missed-h" className="flex flex-col gap-3">
            <h2 id="missed-h" className="m-0 type-stub text-muted">
              Didn’t go through
            </h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {groups.missed.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <MissedRow booking={b} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {groups.cancelled.length > 0 && (
          <section aria-labelledby="cancelled-h" className="flex flex-col gap-3">
            <h2 id="cancelled-h" className="m-0 type-stub text-muted">
              Recently cancelled
            </h2>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {groups.cancelled.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <CancelledRow booking={b} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </TabsContent>

      <TabsContent value="past" className="flex flex-col gap-6">
        {groups.past.length ? (
          <ul className="m-0 flex list-none flex-col gap-6 p-0">
            {groups.past.map((b) => (
              <li key={b.id}>
                <BookingCard booking={b} today={today} past />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Ticket size={22} aria-hidden />} title="No past trips yet" action={findTrip}>
            Your stamps show up here after your first trip. The hills are waiting.
          </EmptyState>
        )}
      </TabsContent>
    </Tabs>
  );
}
