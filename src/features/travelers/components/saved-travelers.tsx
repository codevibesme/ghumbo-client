"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/features/auth/types";
import { ApiError } from "@/lib/api";
import { useToday } from "@/lib/use-today";
import { deleteTraveler } from "../api";
import { useMyTravelers } from "../hooks";
import { isAccountHolder, travelerMeta, travelerName } from "../lib";
import type { Traveler } from "../types";
import { TravelerForm } from "./traveler-form";

const initialsOf = (t: Traveler) => ((t.firstName.trim()[0] ?? "") + (t.lastName.trim()[0] ?? "")).toUpperCase();

/** T14 · Saved travellers: the people ticked at checkout. Add or remove; editing isn't in the backend yet. */
export function SavedTravelers({ user }: { user: User }) {
  const today = useToday();
  const { result, retry, add, remove } = useMyTravelers(user);
  const [adding, setAdding] = useState(false);

  return (
    <section
      id="travellers"
      aria-labelledby="travellers-h"
      className="flex scroll-mt-6 flex-col gap-4 rounded-ticket border-[1.5px] border-line bg-card p-4 md:px-6 md:py-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="travellers-h" className="m-0 type-h4">
            Saved travellers
          </h2>
          <p className="m-0 type-small text-muted">
            Your usual crew. Tick them at checkout and skip the typing. Names must match their ID.
          </p>
        </div>
        {!adding && result.status === "ready" && (
          <Button size="m" variant="secondary" onClick={() => setAdding(true)}>
            <Plus size={18} aria-hidden /> Add traveller
          </Button>
        )}
      </div>

      {result.status === "loading" || !today ? (
        <div className="h-[68px] animate-pulse rounded-ticket bg-sunk" aria-busy="true" />
      ) : result.status === "error" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="type-small text-muted">We couldn’t load your travellers.</span>
          <Button size="m" variant="secondary" onClick={retry}>
            <RefreshCw size={16} aria-hidden /> Try again
          </Button>
        </div>
      ) : (
        <>
          {result.data.length > 0 ? (
            <ul className="m-0 flex list-none flex-col p-0">
              {result.data.map((t) => (
                <TravelerRow key={t.id} traveler={t} you={isAccountHolder(t, user)} onRemoved={() => remove(t.id)} />
              ))}
            </ul>
          ) : (
            !adding && <p className="m-0 type-small">No one saved yet. Add yourself first; it makes checkout a single tap.</p>
          )}
          {adding && (
            <TravelerForm
              today={today}
              submitLabel="Save traveller"
              onCancel={() => setAdding(false)}
              onSaved={(t) => {
                add(t);
                setAdding(false);
              }}
            />
          )}
        </>
      )}
    </section>
  );
}

function TravelerRow({ traveler: t, you, onRemoved }: { traveler: Traveler; you: boolean; onRemoved: () => void }) {
  const [step, setStep] = useState<"idle" | "confirm" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setStep("pending");
    setError(null);
    try {
      await deleteTraveler(t.id);
      onRemoved();
    } catch (err) {
      setStep("confirm");
      setError(
        err instanceof ApiError && err.status === 409
          ? "They’re on a booking, so they can’t be removed yet."
          : "We couldn’t remove them just now. Try again.",
      );
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 border-t-[1.5px] border-rule py-3 first:border-t-0">
      <span
        aria-hidden
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line bg-stock font-sans text-[15px] font-extrabold text-link"
      >
        {initialsOf(t)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2 text-[16px] font-semibold">
          {travelerName(t)}
          {you && <Badge tone="tint">You</Badge>}
        </span>
        <span className="font-mono text-[11px] font-medium tracking-[0.04em] text-muted">{travelerMeta(t)}</span>
      </span>
      {step === "idle" ? (
        <Button size="m" variant="secondary" onClick={() => setStep("confirm")}>
          Remove
        </Button>
      ) : (
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[14px]">Remove {t.firstName}?</span>
          <Button size="m" variant="danger" disabled={step === "pending"} onClick={confirm}>
            {step === "pending" ? "Removing…" : "Remove"}
          </Button>
          <Button size="m" variant="secondary" disabled={step === "pending"} onClick={() => (setStep("idle"), setError(null))}>
            Keep
          </Button>
        </span>
      )}
      {error && (
        <span role="alert" className="basis-full text-[14px] font-medium text-red">
          {error}
        </span>
      )}
    </li>
  );
}
