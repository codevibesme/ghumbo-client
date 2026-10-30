import type { Metadata } from "next";
import { MyTripsView } from "./_components/my-trips-view";

export const metadata: Metadata = {
  title: "My trips",
  robots: { index: false, follow: false },
};

// T12 / T12b My trips. Signed-in only; the requests load in the browser.
export default function MyTripsPage() {
  return (
    <main className="page-container flex flex-1 flex-col gap-6 pt-10 pb-16 md:pt-12 md:pb-24">
      <MyTripsView />
    </main>
  );
}
