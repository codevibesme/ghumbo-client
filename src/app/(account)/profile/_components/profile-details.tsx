"use client";

import Image from "next/image";
import { Logo } from "@/components/layout/logo";
import { Kicker } from "@/components/ui/section-header";
import { TearLine } from "@/components/ui/tear-line";
import { useSignedInUser } from "@/features/account/hooks";
import { formatMonthYear, formatPhone, machineLines } from "@/features/account/lib";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { fullName, initials, photoUrl } from "@/features/auth/session";
import type { User } from "@/features/auth/types";

const SECTIONS = [
  { id: "details", label: "Details" },
  { id: "sign-out", label: "Sign out" },
];

/** T14. Signed-in only: sends signed-out visitors to /sign-in and back. */
export function ProfileDetails() {
  const user = useSignedInUser("/profile");

  return (
    <>
      <div className="flex flex-col gap-2">
        <Kicker>{user ? `Account · ${fullName(user)}` : "Account"}</Kicker>
        <h1 className="m-0 type-h1">Profile &amp; settings</h1>
      </div>

      {!user ? (
        <div className="h-80 animate-pulse rounded-ticket border-[1.5px] border-rule bg-card" aria-busy="true" />
      ) : (
        <div className="grid items-start gap-12 min-[60rem]:grid-cols-[240px_minmax(0,1fr)]">
          <nav
            aria-label="Account sections"
            className="sticky top-6 hidden flex-col border-l-[1.5px] border-line min-[60rem]:flex"
          >
            {SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={i === 0 ? "true" : undefined}
                className="flex min-h-11 items-center px-4 font-mono text-[13px] font-semibold uppercase leading-none tracking-[0.06em] text-muted no-underline hover:text-ink aria-[current]:bg-card aria-[current]:text-ink aria-[current]:shadow-[inset_3px_0_0_var(--g-passport)]"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="flex min-w-0 flex-col gap-6">
            <TravellerCard user={user} />
            <section
              id="sign-out"
              aria-labelledby="sign-out-h"
              className="flex scroll-mt-6 flex-wrap items-center justify-between gap-4 rounded-ticket border-[1.5px] border-line bg-card px-5 py-5 md:px-6"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <h2 id="sign-out-h" className="m-0 type-h4">
                  Sign out
                </h2>
                <p className="m-0 break-words type-small text-muted">
                  Signed in on this device as {user.email || (user.phone ? formatPhone(user.phone) : fullName(user))}
                </p>
              </div>
              <SignOutButton className="h-11 border-line px-[18px] text-[15px] text-ink" />
            </section>
          </div>
        </div>
      )}
    </>
  );
}

/** Read-only for now: editing a profile is turned off. */
function TravellerCard({ user }: { user: User }) {
  const photo = photoUrl(user);
  const letters = initials(user);
  const [line1, line2] = machineLines(user, letters);

  return (
    <section
      id="details"
      aria-labelledby="details-h"
      className="flex scroll-mt-6 flex-col rounded-ticket border-[1.5px] border-line bg-card"
    >
      <div className="flex items-center justify-between gap-3 rounded-t-[4.5px] bg-passport px-5 py-3.5 text-on-passport md:px-6">
        <h2 id="details-h" className="m-0 type-label font-semibold">
          Traveller card
        </h2>
        <Logo tone="stock" ground="var(--g-passport)" className="w-[104px]" />
      </div>

      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-start md:gap-8 md:p-6">
        <span
          aria-hidden
          className="relative inline-flex h-36 w-30 shrink-0 items-center justify-center overflow-hidden rounded-ticket border-[1.5px] border-line bg-stock font-sans text-[44px] font-extrabold leading-none text-link [font-stretch:125%]"
        >
          {photo ? <Image src={photo} alt="" fill sizes="120px" className="object-cover" /> : letters}
        </span>

        <dl className="m-0 grid min-w-0 flex-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <CardFact label="First name">{user.firstName}</CardFact>
          <CardFact label="Last name">{user.lastName || <span className="font-normal text-muted">Not added</span>}</CardFact>
          <CardFact label="Email">{user.email ?? <span className="font-normal text-muted">Not added</span>}</CardFact>
          <CardFact label="Mobile">
            {user.phone ? (
              <span className="font-mono text-[15px] font-medium">{formatPhone(user.phone)}</span>
            ) : (
              <span className="font-normal text-muted">Not added</span>
            )}
          </CardFact>
          <CardFact label="Member since">{formatMonthYear(user.createdAt)}</CardFact>
        </dl>
      </div>

      <TearLine />
      <div
        aria-hidden
        className="overflow-hidden rounded-b-[4.5px] bg-stock px-5 pt-3 pb-3.5 font-mono text-[13px] font-medium leading-[1.6] tracking-[0.12em] whitespace-nowrap text-muted md:px-6"
      >
        {line1}
        <br />
        {line2}
      </div>
    </section>
  );
}

function CardFact({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "flex min-w-0 flex-col gap-1.5 md:col-span-2" : "flex min-w-0 flex-col gap-1.5"}>
      <dt className="type-stub text-muted">{label}</dt>
      <dd className="m-0 break-words text-[16px] font-semibold leading-[1.35]">{children}</dd>
    </div>
  );
}
