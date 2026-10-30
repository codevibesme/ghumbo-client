"use client";

import { RefreshCw, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Kicker } from "@/components/ui/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextLink } from "@/components/ui/text-link";
import { buttonClasses } from "@/components/ui/variants";
import { useMyRequests, useSignedInUser } from "@/features/account/hooks";
import { type TripGroups, groupRequests } from "@/features/account/lib";
import { fullName } from "@/features/auth/session";
import { RequestCard } from "@/features/booking-requests/components/request-card";
import type { UserBookingRequest } from "@/features/booking-requests/types";
import { useToday } from "@/lib/use-today";

type Tab = keyof TripGroups;

const TABS: { id: Tab; label: string }[] = [
  { id: "requests", label: "Requests" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

const seeDepartures = (
  <Link href="/trips" className={buttonClasses({ variant: "secondary", size: "m" })}>
    See departures
  </Link>
);

export function MyTripsView() {
  const user = useSignedInUser("/my-trips");
  const today = useToday();
  const { result, retry } = useMyRequests(Boolean(user));
  const [tab, setTab] = useState<Tab>("requests");

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <Kicker>{user ? `Passenger · ${fullName(user)}` : "Passenger"}</Kicker>
          <h1 className="m-0 type-h1">My trips</h1>
        </div>
        <TextLink href="/trips">Browse trips →</TextLink>
      </div>

      {!user || !today || result.status === "loading" ? (
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
          Your requests are safe. This one’s on our side; give it a moment and try again.
        </EmptyState>
      ) : (
        <TripTabs groups={groupRequests(result.data, today)} tab={tab} onTab={setTab} />
      )}
    </>
  );
}

function TripTabs({ groups, tab, onTab }: { groups: TripGroups; tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <Tabs value={tab} onValueChange={(v) => onTab(v as Tab)} className="flex flex-col gap-6">
      <TabsList aria-label="My trips">
        {TABS.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label} ({groups[t.id].length})
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="requests" className="flex flex-col gap-6">
        <p className="m-0 type-body text-muted">No payment now. We call within 24 hours of every request.</p>
        {groups.requests.length ? (
          <CardList list={groups.requests} />
        ) : (
          <EmptyState icon={<Ticket size={22} aria-hidden />} title="No requests yet" action={seeDepartures}>
            Pick a departure and request a seat. We call you within 24 hours, and nothing is paid until you say yes.
          </EmptyState>
        )}
      </TabsContent>

      <TabsContent value="upcoming" className="flex flex-col gap-6">
        <p className="m-0 type-body text-muted">Trips with a booked seat. Your trip pack arrives 7 days before you leave.</p>
        {groups.upcoming.length ? (
          <CardList list={groups.upcoming} />
        ) : (
          <EmptyState icon={<Ticket size={22} aria-hidden />} title="No upcoming trips" action={seeDepartures}>
            Confirmed trips show up here once your seat is booked.
          </EmptyState>
        )}
      </TabsContent>

      <TabsContent value="past" className="flex flex-col gap-6">
        <p className="m-0 type-body text-muted">Trips you’ve travelled, and requests that were withdrawn or closed.</p>
        {groups.past.length ? (
          <CardList list={groups.past} />
        ) : (
          <EmptyState icon={<Ticket size={22} aria-hidden />} title="No past trips yet" action={seeDepartures}>
            Your stamps show up here after your first trip. The hills are waiting.
          </EmptyState>
        )}
      </TabsContent>
    </Tabs>
  );
}

function CardList({ list }: { list: UserBookingRequest[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-6 p-0">
      {list.map((r) => (
        <li key={r.id}>
          <RequestCard request={r} />
        </li>
      ))}
    </ul>
  );
}
