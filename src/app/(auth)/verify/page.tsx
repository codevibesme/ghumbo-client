import type { Metadata } from "next";
import { Kicker } from "@/components/ui/section-header";
import { VerifyForm } from "@/features/auth/components/verify-form";

export const metadata: Metadata = {
  title: "Enter your code",
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <>
      <header className="flex flex-col gap-3">
        <Kicker>Check your email</Kicker>
        <h1 className="m-0 type-h1">Enter your code.</h1>
      </header>
      <VerifyForm />
    </>
  );
}
