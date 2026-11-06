import type { Metadata } from "next";
import { Suspense } from "react";
import { authPhoto } from "@/features/auth/auth-photo";
import { AuthPhotoStrip } from "@/features/auth/components/auth-art";
import { Kicker } from "@/components/ui/section-header";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { safeNext } from "@/features/auth/lib";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const photo = await authPhoto();
  return (
    <>
      <AuthPhotoStrip photo={photo} />
      <header className="flex flex-col gap-2">
        <Kicker className="leading-[1.3]">Step 1 of 2 · Sign in or sign up</Kicker>
        <h1 className="m-0 type-h1">Your trips, one&nbsp;ticket.</h1>
      </header>
      <p className="m-0 mt-2 max-w-[52ch] type-body-l">
        Sign in to track your seat requests and see when we&rsquo;ve called. No passwords: we send you a one-time
        code. New here? Verifying your email creates your account.
      </p>
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
