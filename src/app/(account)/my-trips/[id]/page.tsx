import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingDetail } from "./_components/booking-detail";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

// T13 Booking detail (paid, payment pending, or expired). Owner only; the booking loads in the browser.
// Razorpay's Cancel button lands here too.
export default function BookingPage({ params }: PageProps<"/my-trips/[id]">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-4 pt-6 pb-10 md:gap-6 md:pt-8 md:pb-24">
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <BookingContent params={params} />
      </Suspense>
    </main>
  );
}

async function BookingContent({ params }: Pick<PageProps<"/my-trips/[id]">, "params">) {
  const { id } = await params;
  return <BookingDetail id={decodeURIComponent(id)} />;
}
