import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/section-header";

// Placeholder until the B01 Home screen is built from the canvas.
export default function Home() {
  return (
    <main className="page-container flex flex-1 flex-col justify-center gap-6 py-16 md:py-24">
        <Kicker>First stop: West Bengal</Kicker>
        <h1 className="m-0 max-w-[14ch] type-display">One ticket. A group of up to 18.</h1>
        <p className="m-0 max-w-[48ch] type-body-l text-muted">
          Budget, fixed-departure group trips across India. Pick a date, request a seat, and we call you within 24 hours.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/trips">Find trips →</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/how-it-works">How it works</Link>
          </Button>
        </div>
    </main>
  );
}
