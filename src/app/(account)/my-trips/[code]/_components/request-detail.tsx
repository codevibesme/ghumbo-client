"use client";

import { RefreshCw, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Kicker } from "@/components/ui/section-header";
import { Stamp } from "@/components/ui/stamp";
import { TearLine } from "@/components/ui/tear-line";
import { buttonClasses } from "@/components/ui/variants";
import { useMyRequest, useSignedInUser } from "@/features/account/hooks";
import {
  STATUS,
  canWithdraw,
  dateRange,
  daysNights,
  formatMoney,
  formatPhone,
  formatShortDate,
  formatStamp,
  travellers,
} from "@/features/account/lib";
import { withdrawRequest } from "@/features/booking-requests/api";
import { StatusTimeline } from "@/features/booking-requests/components/status-timeline";
import type { UserBookingRequest } from "@/features/booking-requests/types";
import { ApiError } from "@/lib/api";
import { formatTicketDate } from "@/lib/format";

export function RequestDetail({ code }: { code: string }) {
  const user = useSignedInUser(`/my-trips/${encodeURIComponent(code)}`);
  const { result, retry, set } = useMyRequest(code, Boolean(user));

  const crumbs = <Breadcrumb items={[{ label: "My trips", href: "/my-trips" }, { label: code }]} />;

  if (!user || result.status === "loading") {
    return (
      <>
        {crumbs}
        <div className="flex min-h-[60vh] flex-col gap-6" aria-busy="true">
          <span className="sr-only">Loading your request…</span>
          <div className="h-24 w-2/3 animate-pulse rounded-ticket bg-rule" />
          <div className="h-72 animate-pulse rounded-ticket border-[1.5px] border-rule bg-card" />
        </div>
      </>
    );
  }

  if (result.status === "error") {
    return (
      <>
        {crumbs}
        {result.notFound ? (
          <EmptyState
            icon={<SearchX size={22} aria-hidden />}
            title="We can’t find that request"
            action={
              <Link href="/my-trips" className={buttonClasses({ variant: "secondary", size: "m" })}>
                Back to my trips
              </Link>
            }
          >
            {code} isn’t one of your requests. Check the reference, or find it under My trips.
          </EmptyState>
        ) : (
          <EmptyState
            icon={<RefreshCw size={22} aria-hidden />}
            title="We couldn’t load this request"
            action={
              <button type="button" onClick={retry} className={buttonClasses({ variant: "secondary", size: "m" })}>
                Try again
              </button>
            }
          >
            Your request is safe. This one’s on our side; give it a moment and try again.
          </EmptyState>
        )}
      </>
    );
  }

  return <RequestTicket request={result.data} onChange={set}>{crumbs}</RequestTicket>;
}

function RequestTicket({
  request: r,
  onChange,
  children,
}: {
  request: UserBookingRequest;
  onChange: (r: UserBookingRequest) => void;
  children: React.ReactNode;
}) {
  const meta = STATUS[r.status];
  const length = daysNights(r);
  const estimate = Number(r.estimate);
  const perPerson = r.travelerCount > 0 ? estimate / r.travelerCount : estimate;
  const open = canWithdraw(r.status);

  return (
    <>
      {children}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-col gap-2">
          <Kicker>
            Seat request · {r.destinationName} ·{" "}
            <span className="whitespace-nowrap">updated {formatStamp(r.updatedAt)}</span>
          </Kicker>
          <h1 className="m-0 type-h1">{r.tripName}</h1>
          <span className="mt-2 font-mono text-[15px] font-medium leading-[1.4] tracking-[0.02em]">
            {dateRange(r)}
            {length && ` · ${length}`}
          </span>
        </div>
        <div className="shrink-0 px-4 py-2">
          {meta.stamp ? (
            <Stamp tone={meta.stamp}>{meta.label}</Stamp>
          ) : (
            <Badge tone={meta.tone}>{meta.label}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 min-[60rem]:grid-cols-[minmax(0,1fr)_360px] min-[60rem]:gap-x-8">
        <div className="flex min-w-0 flex-col gap-6">
          <StatusTimeline request={r} />

          <section aria-labelledby="req-h" className="flex flex-col rounded-ticket border-[1.5px] border-line bg-card">
            <div className="flex flex-col gap-5 px-5 py-6 md:px-6">
              <h2 id="req-h" className="m-0 type-h3">
                Your request
              </h2>
              <dl className="m-0 grid gap-x-6 gap-y-5 md:grid-cols-2">
                <Fact label="Travellers">{travellers(r.travelerCount)}</Fact>
                <Fact label="Departure">
                  {formatShortDate(r.startDate, { year: true })}
                  <span className="block font-normal">Back {formatShortDate(r.endDate)}</span>
                </Fact>
                {Number.isFinite(estimate) && estimate > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <dt className="type-stub text-muted">Estimate</dt>
                    <dd className="m-0 flex flex-col gap-1.5">
                      <span className="type-price-l">
                        {open ? "≈ " : ""}
                        {formatMoney(estimate, r.currency)}
                      </span>
                      <span className="max-w-[36ch] text-[13px] leading-[1.45] text-muted">
                        {travellers(r.travelerCount)} × {formatMoney(perPerson, r.currency)}.
                        {open && " Final amount confirmed on the call."}
                      </span>
                    </dd>
                  </div>
                )}
                <Fact label="Contact">
                  <span className="flex flex-col font-normal">
                    <span>{[r.firstName, r.lastName].filter(Boolean).join(" ")}</span>
                    <span className="break-all">{r.email}</span>
                    {r.phone && <span className="font-mono text-[15px]">{formatPhone(r.phone)}</span>}
                  </span>
                </Fact>
              </dl>
            </div>
            {r.statusNotes && (
              <>
                <TearLine />
                <div className="flex flex-col gap-2 px-5 py-5 md:px-6">
                  <span className="type-stub text-muted">A note from us</span>
                  <p className="m-0 border-l-[3px] border-passport pl-3 type-body">{r.statusNotes}</p>
                </div>
              </>
            )}
          </section>

          <WithdrawActions request={r} onChange={onChange} />
        </div>

        <aside className="flex flex-col gap-6 min-[60rem]:sticky min-[60rem]:top-6 min-[60rem]:self-start">
          <div className="flex flex-col rounded-ticket border-[1.5px] border-line bg-card">
            <div className="flex flex-col gap-1 px-5 py-4">
              <span className="type-stub text-muted">Your departure</span>
              <span className="type-h4">{r.tripName}</span>
              <span className="type-small text-muted">{r.destinationName}</span>
            </div>
            <TearLine />
            <dl className="m-0 grid grid-cols-3 gap-3 px-5 py-4">
              <StubFact label="Depart">{formatTicketDate(r.startDate)}</StubFact>
              <StubFact label="Return">{formatTicketDate(r.endDate)}</StubFact>
              {length !== null && <StubFact label="Length">{length}</StubFact>}
            </dl>
          </div>
          <div className="flex flex-col gap-2 rounded-ticket border-[1.5px] border-line bg-card px-5 py-4">
            <span className="type-stub text-muted">Questions?</span>
            <a href="mailto:support@ghumbo.com" className="type-h4 text-link hover:text-red">
              support@ghumbo.com
            </a>
            <span className="font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
              Quote {r.code} when you write
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 text-[16px] font-semibold leading-[1.35]">{children}</dd>
    </div>
  );
}

function StubFact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 font-mono text-[14px] font-semibold leading-[1.2] tracking-[0.02em] whitespace-nowrap">
        {children}
      </dd>
    </div>
  );
}

function WithdrawActions({
  request: r,
  onChange,
}: {
  request: UserBookingRequest;
  onChange: (r: UserBookingRequest) => void;
}) {
  const [step, setStep] = useState<"idle" | "confirm" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  // The confirm panel replaces the button in place, so focus moves to its heading when it opens.
  const heading = useRef<HTMLHeadingElement>(null);
  const open = step !== "idle";
  useEffect(() => {
    if (open) heading.current?.focus();
  }, [open]);

  if (r.status === "withdrawn" || r.status === "closed") {
    return (
      <div className="flex flex-col items-start gap-2">
        <Badge tone="muted">{STATUS[r.status].label}</Badge>
        <p className="m-0 type-small text-ink">
          {r.status === "withdrawn" ? "Request withdrawn. " : "This request is closed. "}
          Changed your mind?{" "}
          <Link href="/trips" className="text-link hover:text-red">
            Find the trip and request a seat again
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!canWithdraw(r.status)) return null;

  async function confirm() {
    setStep("pending");
    setError(null);
    try {
      await withdrawRequest(r.code);
      onChange({ ...r, status: "withdrawn", updatedAt: new Date().toISOString() });
    } catch (err) {
      setStep("confirm");
      setError(
        err instanceof ApiError && err.status === 401
          ? "Your session has ended. Sign in again to withdraw."
          : "We couldn’t withdraw it just now. Try again in a moment.",
      );
    }
  }

  if (step === "idle") {
    return (
      <div className="flex flex-col items-start gap-2">
        <Button variant="destructive" size="m" onClick={() => setStep("confirm")}>
          Withdraw request
        </Button>
        <p className="m-0 type-small text-muted">
          Withdrawing frees your seats for someone else. Nothing has been paid, so nothing is charged.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="withdraw-h"
      aria-describedby="withdraw-d"
      className="flex flex-col gap-3 rounded-ticket border-[1.5px] border-red bg-card px-5 py-5"
    >
      <h2 id="withdraw-h" ref={heading} tabIndex={-1} className="m-0 type-h4 outline-none">
        Withdraw request {r.code}?
      </h2>
      <p id="withdraw-d" className="m-0 type-small">
        Your {r.travelerCount === 1 ? "seat goes" : `${r.travelerCount} seats go`} back on sale and we stop calling
        about this trip.
      </p>
      {error && (
        <p role="alert" className="m-0 text-[14px] font-medium text-red">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3 pt-1">
        <Button variant="danger" size="m" disabled={step === "pending"} onClick={confirm}>
          {step === "pending" ? "Withdrawing…" : "Withdraw request"}
        </Button>
        <Button variant="secondary" size="m" disabled={step === "pending"} onClick={() => setStep("idle")}>
          Keep my request
        </Button>
      </div>
    </section>
  );
}
