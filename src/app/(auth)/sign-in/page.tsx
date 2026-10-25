import type { Metadata } from "next";
import { Suspense } from "react";
import { Kicker } from "@/components/ui/section-header";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { safeNext } from "@/features/auth/lib";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <>
      <header className="flex flex-col gap-3">
        <Kicker>Sign in or sign up</Kicker>
        <h1 className="m-0 type-h1">Your seat, your trips.</h1>
        <p className="m-0 type-body text-muted">Continue with Google, or we&apos;ll email you a 6-digit code. No password needed.</p>
      </header>
      <Suspense fallback={<SignInForm next="/" />}>
        <SignInFormForRequest searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SignInFormForRequest({ searchParams }: Pick<PageProps<"/sign-in">, "searchParams">) {
  const { next, error } = await searchParams;
  return <SignInForm next={safeNext(next)} error={typeof error === "string" ? error : undefined} />;
}
