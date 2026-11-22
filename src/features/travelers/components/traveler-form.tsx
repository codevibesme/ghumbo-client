"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { supportEmail } from "@/config/site";
import { ApiError } from "@/lib/api";
import { createTraveler } from "../api";
import { validateTraveler } from "../lib";
import type { Traveler, TravelerFormErrors } from "../types";

/**
 * New traveller: name as on their ID, date of birth, gender. Saved to the
 * account, so it shows up at every checkout after this one.
 * A group, not a <form>: it sits inside the checkout form.
 */
export function TravelerForm({
  today,
  onSaved,
  onCancel,
  submitLabel = "Save & add",
}: {
  today: string;
  onSaved: (t: Traveler) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [e, setErrors] = useState<TravelerFormErrors>({});
  const [pending, setPending] = useState(false);

  async function save() {
    if (!root.current || pending) return;
    const data = new FormData();
    for (const el of root.current.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name], select[name]")) {
      data.set(el.name, el.value);
    }
    const result = validateTraveler(data, today);
    if ("errors" in result) return setErrors(result.errors);
    setPending(true);
    setErrors({});
    try {
      onSaved(await createTraveler(result.body));
    } catch (err) {
      setPending(false);
      setErrors({
        form:
          err instanceof ApiError && err.status === 400
            ? err.message
            : `We couldn’t save them just now. Try again, or write to ${supportEmail}.`,
      });
    }
  }

  // Enter saves this traveller instead of submitting the checkout around it.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && (event.target as HTMLElement).tagName === "INPUT") {
      event.preventDefault();
      save();
    }
  }

  return (
    <div
      ref={root}
      role="group"
      aria-labelledby="new-traveller-h"
      onKeyDown={onKeyDown}
      className="flex flex-col gap-4 rounded-ticket border-[1.5px] border-passport bg-sunk p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span id="new-traveller-h" className="text-[18px] font-extrabold leading-[1.2] [font-stretch:110%]">
          New traveller
        </span>
        <span className="font-mono text-[12px] font-medium leading-[1.3] tracking-[0.04em] text-muted">
          Saved to your profile for next time
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Field label="First name" error={e.firstName}>
          <Input name="firstName" autoComplete="off" maxLength={50} placeholder="First name" />
        </Field>
        <Field label="Last name" error={e.lastName}>
          <Input name="lastName" autoComplete="off" maxLength={50} placeholder="Last name" />
        </Field>
        <Field label="Date of birth" error={e.dateOfBirth}>
          <Input name="dateOfBirth" type="date" max={today} />
        </Field>
        <Field label="Gender" error={e.gender}>
          <Select name="gender" defaultValue="">
            <option value="" disabled>
              Choose
            </option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Select>
        </Field>
      </div>
      <p className="m-0 text-[13px] leading-[1.45] text-muted">
        As on their Aadhaar, passport or college ID. We use gender only to pair room-mates.
      </p>
      {e.form && (
        <p role="alert" className="m-0 type-small text-red">
          {e.form}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button size="m" disabled={pending} onClick={save}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button size="m" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
