"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Badge, SeatBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioCard, RadioCardGroup } from "@/components/ui/radio-card";
import { Stepper } from "@/components/ui/stepper";
import { TearLine } from "@/components/ui/tear-line";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session";
import type { Departure } from "@/features/tours/types";
import { ApiError } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { createBookingRequest } from "../api";
import { saveSentRequest } from "../sent";
import type { RequestFormErrors } from "../types";
import { FLEXIBLE, MAX_TRAVELERS, validateRequest } from "../validate";

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[20px] font-semibold leading-none text-red">{String(n).padStart(2, "0")}</span>
        <h2 className="m-0 type-h3">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function travellersLine(n: number) {
  return `${n} ${n === 1 ? "adult" : "adults"}`;
}

/**
 * B08 form + live summary. Signed-out friendly; when signed in, details are
 * prefilled and the session cookie links the request to the account.
 * Estimate = adult price × travellers.
 */
export function RequestForm({
  tripId,
  tripSlug,
  tripName,
  route,
  image,
  departures,
  initialDeparture,
}: {
  tripId: string;
  tripSlug: string;
  tripName: string;
  /** "NJP / Bagdogra · 4D / 3N" */
  route: string;
  image: { src: string; alt: string } | null;
  departures: Departure[];
  initialDeparture?: string;
}) {
  const router = useRouter();
  const session = useSession();
  const user = session.user;
  const [e, setErrors] = useState<RequestFormErrors>({});
  const [pending, setPending] = useState(false);

  const firstOpen = departures.find((d) => d.seatsLeft > 0)?.id;
  const [departureId, setDepartureId] = useState(initialDeparture ?? firstOpen ?? FLEXIBLE);
  const [travelers, setTravelers] = useState(2);
  const dep = departures.find((d) => d.id === departureId);
  const maxTravelers = Math.min(MAX_TRAVELERS, dep?.seatsLeft ?? MAX_TRAVELERS);
  const estimate = dep ? dep.price * Math.min(travelers, maxTravelers) : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateRequest(new FormData(event.currentTarget), tripId, departures);
    if ("errors" in result) return setErrors(result.errors);

    setPending(true);
    setErrors({});
    const { body } = result;
    try {
      const created = await createBookingRequest(body);
      saveSentRequest({
        code: created.code,
        tripSlug,
        name: body.name,
        email: body.email,
        phone: body.phone,
        travelers: body.travelerCount,
        departureId: body.tripDepartureId,
        travelDate: body.travelDate,
        sentAt: new Date().toISOString(),
      });
      router.push(`/trips/${tripSlug}/request/sent`);
    } catch (err) {
      setPending(false);
      if (!(err instanceof ApiError)) throw err;
      setErrors({
        form:
          err.status === 400
            ? err.message
            : "We couldn’t send your request right now. Try again in a minute, or write to support@ghumbo.com.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex flex-col gap-10">
        {session.status === "signed-out" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-ticket border-[1.5px] border-dashed border-tear px-4 py-3">
            <span className="type-small text-muted">Have an account?</span>
            <Link
              href={`/sign-in?next=${encodeURIComponent(`/trips/${tripSlug}/request`)}`}
              className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-link underline underline-offset-4"
            >
              Sign in to track this request
            </Link>
          </div>
        )}

        {/* Remounts once the session loads, so a signed-in traveller's details prefill. */}
        <Step key={user?.id ?? "guest"} n={1} title="Your details">
          <Field label="Full name" error={e.name}>
            <Input name="name" autoComplete="name" maxLength={100} placeholder="Your full name" defaultValue={user?.name} required />
          </Field>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Email" hint="We send your reference here." error={e.email}>
              <Input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com"
                defaultValue={user?.email ?? undefined}
                required
              />
            </Field>
            <Field label="Mobile number" optional hint="So we can call you within 24 hours." error={e.phone}>
              <PhoneInput name="phone" maxLength={10} placeholder="98300 12345" defaultValue={user?.phone?.replace(/^\+91/, "")} />
            </Field>
          </div>
        </Step>

        <Step n={2} title="Who’s coming">
          <input type="hidden" name="travelers" value={Math.min(travelers, maxTravelers)} />
          <Stepper
            label="Travellers"
            value={Math.min(travelers, maxTravelers)}
            onValueChange={setTravelers}
            min={1}
            max={maxTravelers}
            hint={`Up to ${maxTravelers} per request.`}
          />
          {dep?.childPrice !== undefined && (
            <p className="m-0 type-small text-muted">
              Bringing a child aged 5–11? Add them in the message. Child price on this date: {formatINR(dep.childPrice)}.
            </p>
          )}
        </Step>

        <Step n={3} title="Departure">
          <input type="hidden" name="departure" value={departureId} />
          <RadioCardGroup value={departureId} onValueChange={setDepartureId} aria-label="Departure">
            {departures.map((d) => (
              <RadioCard key={d.id} value={d.id} disabled={d.seatsLeft <= 0}>
                <span className="flex flex-wrap items-center justify-between gap-3">
                  <span className="flex flex-col gap-1.5">
                    <span className="font-mono text-[16px] font-semibold leading-none">{d.start}</span>
                    <span className="font-mono text-[12px] leading-none text-muted">→ {d.end}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <SeatBadge left={d.seatsLeft} />
                    {d.peak && <Badge tone="peak">Peak</Badge>}
                    <span className="text-[20px] font-extrabold leading-none [font-stretch:115%]">{formatINR(d.price)}</span>
                  </span>
                </span>
              </RadioCard>
            ))}
            <RadioCard value={FLEXIBLE}>
              <span className="font-mono text-[14px] font-semibold uppercase leading-none tracking-[0.04em]">I’m flexible</span>
              <span className="type-small text-muted">Tell us a preferred date and we’ll match you to the closest departure.</span>
            </RadioCard>
          </RadioCardGroup>
          {e.departure && (
            <p role="alert" className="m-0 type-small text-red">
              {e.departure}
            </p>
          )}
          {departureId === FLEXIBLE && (
            <Field label="Preferred travel date" hint="We suggest the closest departure on the call." error={e.travelDate}>
              <Input name="travelDate" type="date" min={new Date().toISOString().slice(0, 10)} />
            </Field>
          )}
        </Step>

        <Step n={4} title="Anything else?">
          <Field label="Message" optional>
            <Textarea name="message" maxLength={1000} placeholder="Room sharing, food preferences, a child joining…" />
          </Field>
          <div className="flex flex-col gap-1">
            <Checkbox name="consent" required aria-invalid={e.consent ? true : undefined}>
              Ghumbo can call, SMS or WhatsApp me about this request. I have read the <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy policy</Link>.
            </Checkbox>
            {e.consent && <span className="type-small text-red">{e.consent}</span>}
          </div>
        </Step>

        {e.form && (
          <p role="alert" className="m-0 type-small text-red">
            {e.form}
          </p>
        )}
        <div className="flex flex-col gap-2.5">
          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Sending…" : "Request my seat →"}
          </Button>
          <span className="text-center font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
            NO PAYMENT NOW · WE CALL WITHIN 24 HOURS
          </span>
        </div>
      </div>

      <aside aria-label="Your request" className="ticket-surface flex flex-col lg:sticky lg:top-6">
        {image && (
          <span className="relative block h-[180px] overflow-hidden rounded-t-[4.5px]">
            <Image src={image.src} alt={image.alt} fill sizes="400px" className="object-cover" />
          </span>
        )}
        <div className="flex flex-col gap-1.5 px-5 pt-4 pb-4">
          <span className="type-stub text-muted">Your request</span>
          <h2 className="m-0 type-h3">{tripName}</h2>
          <span className="type-stub text-muted">{route}</span>
        </div>
        <TearLine />
        <dl className="m-0 flex flex-col gap-2.5 px-5 py-4">
          <SummaryRow label="Dates" value={dep ? `${dep.start} → ${dep.end}` : "Flexible"} />
          {dep && <SummaryRow label="Per person" value={formatINR(dep.price)} />}
          {dep && <SummaryRow label="Seats" value={<SeatBadge left={dep.seatsLeft} />} />}
          <SummaryRow label="Travellers" value={travellersLine(Math.min(travelers, maxTravelers))} />
          <SummaryRow label="Estimate" value={estimate !== null ? `≈ ${formatINR(estimate)}` : "On the call"} strong />
        </dl>
        <p className="m-0 border-t-[1.5px] border-rule px-5 py-3 font-mono text-[11px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
          PER PERSON, TWIN SHARING · GST INCLUDED · FINAL AMOUNT CONFIRMED ON THE CALL
        </p>
      </aside>
    </form>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[15px] leading-[1.3] text-muted">{label}</dt>
      <dd className={strong ? "m-0 text-[20px] font-extrabold leading-none [font-stretch:115%]" : "m-0 font-mono text-[14px] font-semibold"}>{value}</dd>
    </div>
  );
}
