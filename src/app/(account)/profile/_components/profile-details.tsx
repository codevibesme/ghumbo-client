"use client";

import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { useSession } from "@/features/auth/session";

/** Signed-in only: sends signed-out visitors to /sign-in and back. */
export function ProfileDetails() {
  const { status, user } = useSession();

  if (status === "signed-out") redirect("/sign-in?next=/profile");
  if (!user) return <div className="min-h-24" aria-busy="true" />;

  return (
    <>
      <dl className="m-0 flex flex-col gap-3">
        {[
          ["Name", user.name],
          ["Email", user.email],
          ["Mobile", user.phone],
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <dt className="type-stub text-muted">{label}</dt>
              <dd className="m-0 text-[15px] leading-[1.35]">{value}</dd>
            </div>
          ))}
      </dl>
      <SignOutButton className="self-start" />
    </>
  );
}
