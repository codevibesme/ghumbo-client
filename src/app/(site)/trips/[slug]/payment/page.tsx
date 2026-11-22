import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "./_components/payment-result";

export const metadata: Metadata = {
  title: "Your payment",
  robots: { index: false, follow: false },
};

// B09 · where Razorpay's callback lands: /trips/<bookingId>/payment?status=success|failed|expired
// (the backend picks the path). The segment is the booking id here, not a trip slug. The booking is
// read from the backend and polled; ?status only decides what to show while we wait.
export default function PaymentPage({ params, searchParams }: PageProps<"/trips/[slug]/payment">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-4 pt-6 pb-16 md:gap-6 md:pt-12 md:pb-24">
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <Result params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Result({ params, searchParams }: PageProps<"/trips/[slug]/payment">) {
  const [{ slug }, { status }] = await Promise.all([params, searchParams]);
  return <PaymentResult bookingId={decodeURIComponent(slug)} returned={status === "success" ? "success" : "failed"} />;
}
