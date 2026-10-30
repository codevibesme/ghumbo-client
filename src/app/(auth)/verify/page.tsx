import type { Metadata } from "next";
import { Suspense } from "react";
import { Kicker } from "@/components/ui/section-header";
import { VerifyForm } from "@/features/auth/components/verify-form";

export const metadata: Metadata = {
  title: "Enter your code",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <>
      <header className="flex flex-col gap-2">
        <Kicker className="leading-[1.3]">Step 2 of 2 · Verify your email</Kicker>
        <h1 className="m-0 type-h1">Check your inbox.</h1>
      </header>
      {/* The resend countdown reads the clock, so the form renders per visit, not at build time. */}
      <Suspense fallback={<div className="min-h-[420px]" aria-busy="true" />}>
        <VerifyForm />
      </Suspense>
    </>
  );
}
