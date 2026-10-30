"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { Badge, SeatBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioCard, RadioCardGroup } from "@/components/ui/radio-card";
import { Stamp } from "@/components/ui/stamp";
import { Stepper } from "@/components/ui/stepper";
import { TearLine } from "@/components/ui/tear-line";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth/session";
import type { User } from "@/features/auth/types";
import { startYear } from "@/features/tours/mappers";
import type { Departure } from "@/features/tours/types";
import { ApiError } from "@/lib/api";
import { formatINR, pad2 } from "@/lib/format";
import { createBookingRequest } from "../api";
import { adultsLine, roomsSentence, travellersLine } from "../rooms";
import { saveSentRequest } from "../sent";
import type { RequestFormErrors } from "../types";
import { type LockedDetails, MAX_TRAVELERS, validateRequest } from "../validate";

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 px-5 py-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em] text-red">{pad2(n)}</span>
        <h2 className="m-0 text-[18px] font-bold leading-[1.3] [font-stretch:110%]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** "Max 8 per request · 18 seats left on this date" / "Max 4 · 04 seats left on this date". */
function maxNote(max: number, dep: Departure | undefined) {
  if (!dep) return `Max ${max} per request`;
  return dep.seatsLeft <= MAX_TRAVELERS
    ? `Max ${max} · ${pad2(dep.seatsLeft)} seats left on this date`
    : `Max ${MAX_TRAVELERS} per request · ${dep.seatsLeft} seats left on this date`;
}

/** The account's non-empty contact details. The backend rejects a signed-in request whose details differ, so these are locked. */
function lockedDetails(user: User | null): LockedDetails {
  if (!user) return {};
  const locked: LockedDetails = {};
  if (user.firstName.trim()) locked.firstName = user.firstName.trim();
  if (user.lastName.trim()) locked.lastName = user.lastName.trim();
  if (user.email) locked.email = user.email;
  if (user.phone) locked.phone = user.phone;
  return locked;
}

/**
 * B08 form + live summary. Signed-out friendly; when signed in, the account's
 * details are filled in and locked, and the session cookie links the request
 * to the account.
 * Estimate = per-person price × travellers. Mobile is optional here (the
 * backend accepts null) although the canvas marks it required.
 */
export function RequestForm({
  tripSlug,
  tripName,
  route,
  image,
  departures,
  initialDeparture,
}: {
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
  const locked = lockedDetails(user);
  const formId = useId();
  const [e, setErrors] = useState<RequestFormErrors>({});
  const [pending, setPending] = useState(false);

  const firstOpen = departures.find((d) => d.seatsLeft > 0)?.id;
  const [departureId, setDepartureId] = useState(initialDeparture ?? firstOpen ?? "");
  const [travelers, setTravelers] = useState(2);
  const dep = departures.find((d) => d.id === departureId);
  const maxTravelers = Math.max(1, Math.min(MAX_TRAVELERS, dep?.seatsLeft ?? MAX_TRAVELERS));
  const travelerCount = Math.min(travelers, maxTravelers);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateRequest(new FormData(event.currentTarget), departures, locked);
    if ("errors" in result) return setErrors(result.errors);

    setPending(true);
    setErrors({});
    const { body } = result;
    try {
      const created = await createBookingRequest(body);
      // Signed in: the request is on the account, so open it there (T13). Guests can't load it by code.
      if (session.status === "signed-in") {
        router.push(`/my-trips/${encodeURIComponent(created.code)}`);
        return;
      }
      saveSentRequest({
        code: created.code,
        tripSlug,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        travelers: body.travelerCount,
        departureId: body.tripDepartureId,
        sentAt: new Date().toISOString(),
      });
      router.push(`/trips/${tripSlug}/request/sent`);
    } catch (err) {
      setPending(false);
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 409) return setErrors(conflictError(err.message, session.status === "signed-in"));
      setErrors({
        form:
          err.status === 400
            ? err.message
            : "We couldn’t send your request right now. Try again in a minute, or write to support@ghumbo.com.",
      });
    }
  }

  return (
    <div className="grid items-start gap-12 pb-20 md:pb-0 min-[960px]:grid-cols-[minmax(0,1fr)_380px]">
      <form
        id={formId}
        onSubmit={onSubmit}
        noValidate
        aria-label="Request a seat"
        className="ticket-surface flex min-w-0 flex-col"
      >
        {session.status === "signed-out" && (
          <>
            <SignInPrompt tripSlug={tripSlug} />
            <TearLine />
          </>
        )}

        {/* Remounts once the session loads, so a signed-in traveller's details prefill. */}
        <Step key={user?.id ?? "guest"} n={1} title="Your details">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="First name" error={e.firstName}>
              <Input
                name="firstName"
                autoComplete="given-name"
                maxLength={50}
                placeholder="First name"
                defaultValue={locked.firstName}
                disabled={!!locked.firstName}
                required
              />
            </Field>
            <Field label="Last name" error={e.lastName}>
              <Input
                name="lastName"
                autoComplete="family-name"
                maxLength={50}
                placeholder="Last name"
                defaultValue={locked.lastName}
                disabled={!!locked.lastName}
                required
              />
            </Field>
          </div>
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
                defaultValue={locked.email}
                disabled={!!locked.email}
                required
              />
            </Field>
            <Field label="Mobile number" optional={!locked.phone} hint="So we can call you within 24 hours." error={e.phone}>
              <PhoneInput
                name="phone"
                maxLength={10}
                placeholder="98300 12345"
                defaultValue={locked.phone?.replace(/^\+91/, "")}
                disabled={!!locked.phone}
              />
            </Field>
          </div>
          {Object.keys(locked).length > 0 && (
            <p className="m-0 type-small text-muted">Filled in from your account, so they can’t be changed here.</p>
          )}
        </Step>
        <TearLine />

        <Step n={2} title="Who’s coming">
          <input type="hidden" name="travelers" value={travelerCount} />
          <div className="flex flex-wrap items-stretch gap-5">
            <Stepper
              label="Travellers"
              value={travelerCount}
              onValueChange={setTravelers}
              min={1}
              max={maxTravelers}
              hint={maxNote(maxTravelers, dep)}
            />
            <div aria-live="polite" className="flex flex-[1_1_240px] flex-col justify-center gap-2 rounded-ticket bg-sunk px-5 py-4">
              <span className="type-stub text-muted">Live estimate</span>
              <span className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] [font-stretch:115%]">
                {adultsLine(travelerCount)}
                {dep && ` ≈ ${formatINR(dep.price * travelerCount)}`}
              </span>
              <span className="text-[14px] leading-[1.4] text-muted">
                {roomsSentence(travelerCount)} Final amount confirmed on the call.
              </span>
            </div>
          </div>
        </Step>
        <TearLine />

        <DepartureStep departures={departures} value={departureId} onValueChange={setDepartureId} errors={e} />
        <TearLine />

        <Step n={4} title="Anything else?">
          <Field label="Message" optional>
            <Textarea name="message" maxLength={1000} placeholder="Food preferences, a birthday on the trip, a child joining…" />
          </Field>
          <div className="flex flex-col gap-1">
            <Checkbox name="consent" required aria-invalid={e.consent ? true : undefined}>
              Ghumbo can call, SMS or WhatsApp me about this request.
            </Checkbox>
            {e.consent && <span className="type-small text-red">{e.consent}</span>}
          </div>
          {e.form && (
            <p role="alert" className="m-0 type-small text-red">
              {e.form}
            </p>
          )}
        </Step>

        <div className="hidden flex-wrap items-center gap-x-5 gap-y-4 px-5 pb-6 md:flex">
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Request my seat →"}
          </Button>
          <span className="font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
            NO PAYMENT NOW · WE CALL WITHIN 24 HOURS
          </span>
        </div>
      </form>

      <div className="order-first flex w-full max-w-[480px] flex-col gap-4 min-[960px]:sticky min-[960px]:top-6 min-[960px]:order-none min-[960px]:max-w-none">
        <RequestSummary image={image} tripName={tripName} route={route} departure={dep} travelers={travelerCount} />
        <AfterYouSend />
      </div>

      <StickyActionBar
        meta="PER PERSON"
        price={dep ? formatINR(dep.price) : "—"}
        form={formId}
        disabled={pending}
        label={pending ? "Sending…" : "Request my seat →"}
      />
    </div>
  );
}

/** The backend's two 409s: an open request for this date already exists, or the date is full ("Houseful"). */
function conflictError(message: string, signedIn: boolean): RequestFormErrors {
  if (/already exists/i.test(message)) {
    return {
      form: signedIn
        ? "You’ve already requested this date. Find it in My trips."
        : "You’ve already requested this date with this email. We’ll call you within 24 hours.",
    };
  }
  return { departure: "This date just filled up. Pick another." };
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t-[1.5px] border-rule py-3">
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 text-right font-mono text-[14px] font-semibold leading-[1.3]">{value}</dd>
    </div>
  );
}

function SignInPrompt({ tripSlug }: { tripSlug: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-0.5">
      <UserRound size={20} aria-hidden className="hidden shrink-0 text-link md:block" />
      <span className="text-[14px] leading-[1.45] md:text-[15px]">
        Have an account?{" "}
        <Link
          href={`/sign-in?next=${encodeURIComponent(`/trips/${tripSlug}/request`)}`}
          className="inline-block py-3.5 font-semibold text-link underline underline-offset-[3px]"
        >
          Sign in to track this request
        </Link>
      </span>
    </div>
  );
}

function DepartureStep({
  departures,
  value,
  onValueChange,
  errors,
}: {
  departures: Departure[];
  value: string;
  onValueChange: (id: string) => void;
  errors: RequestFormErrors;
}) {
  return (
    <Step n={3} title="Departure">
      <input type="hidden" name="departure" value={value} />
      <RadioCardGroup value={value} onValueChange={onValueChange} aria-label="Departure" className="grid gap-3 md:grid-cols-2">
        {departures.map((d) => (
          <RadioCard
            key={d.id}
            value={d.id}
            disabled={d.seatsLeft <= 0}
            aria-label={`${d.start} to ${d.end}, ${formatINR(d.price)} per person${d.peak ? ", peak" : ""}`}
          >
            <span className="flex min-h-6 items-center justify-between gap-2">
              <span className="font-mono text-[16px] font-semibold leading-none">{d.start}</span>
              {d.peak && <Badge tone="peak">Peak</Badge>}
            </span>
            <span className="font-mono text-[12px] leading-none text-muted">→ {d.end}</span>
            <span className="flex items-center gap-2.5">
              <span className="text-[20px] font-extrabold leading-none [font-stretch:115%]">{formatINR(d.price)}</span>
              <SeatBadge left={d.seatsLeft} />
            </span>
          </RadioCard>
        ))}
      </RadioCardGroup>
      {errors.departure && (
        <p role="alert" className="m-0 type-small text-red">
          {errors.departure}
        </p>
      )}
    </Step>
  );
}

/** The live ticket beside the form. */
function RequestSummary({
  image,
  tripName,
  route,
  departure,
  travelers,
}: {
  image: { src: string; alt: string } | null;
  tripName: string;
  route: string;
  departure: Departure | undefined;
  travelers: number;
}) {
  return (
    <aside aria-label="Your request" className="ticket-surface flex flex-col">
      {image && (
        <span className="relative block aspect-video overflow-hidden rounded-t-[4.5px] border-b-[1.5px] border-line">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 960px) 380px, 480px" className="object-cover" />
          {departure?.peak && <Stamp className="absolute top-4 right-4">Peak dates</Stamp>}
        </span>
      )}
      <div className="flex flex-col gap-2 px-5 pt-4 pb-3">
        <span className="type-stub text-muted">Your request</span>
        <h2 className="m-0 type-h3">{tripName}</h2>
        <span className="type-stub text-muted">{route}</span>
      </div>
      <dl className="m-0 flex flex-col px-5 pb-2">
        <SummaryRow
          label="Dates"
          value={departure ? `${departure.start} → ${departure.end.replace(/ \d{4}$/, "")} ${startYear(departure)}` : "Pick a date"}
        />
        {departure && <SummaryRow label="Per person" value={formatINR(departure.price)} />}
        {departure && <SummaryRow label="Seats" value={<SeatBadge left={departure.seatsLeft} />} />}
        <SummaryRow label="Travellers" value={travellersLine(travelers)} />
        <SummaryRow label="Estimate" value={departure ? `≈ ${formatINR(departure.price * travelers)}` : "—"} />
      </dl>
      <p className="m-0 px-5 pb-4 font-mono text-[12px] font-medium leading-[1.4] tracking-[0.04em] text-muted">
        PER PERSON, TWIN SHARING · GST INCLUDED · FINAL AMOUNT CONFIRMED ON THE CALL
      </p>
    </aside>
  );
}

const NEXT_STEPS = [
  "We call you within 24 hours.",
  "A deposit, by secure link, confirms your seat.",
  "Your trip pack lands 7 days before you leave.",
];

/** Desktop only, under the summary. The canvas's [Support phone] / [Deposit amount] are left out until site config exists. */
function AfterYouSend() {
  return (
    <div className="hidden flex-col gap-3 rounded-ticket border-2 border-dashed border-tear px-5 py-4 md:flex">
      <span className="type-stub text-muted">After you send it</span>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {NEXT_STEPS.map((step, i) => (
          <li key={step} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 text-[14px] leading-[1.45]">
            <span className="font-mono font-semibold text-red">{pad2(i + 1)}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
