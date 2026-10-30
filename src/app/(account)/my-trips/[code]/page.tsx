import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestDetail } from "./_components/request-detail";

export const metadata: Metadata = {
  title: "Your request",
  robots: { index: false, follow: false },
};

// T13 Request detail. Owner only; the request loads in the browser.
export default function RequestPage({ params }: PageProps<"/my-trips/[code]">) {
  return (
    <main className="page-container flex flex-1 flex-col gap-6 pt-6 pb-16 md:pt-8 md:pb-24">
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <RequestContent params={params} />
      </Suspense>
    </main>
  );
}

async function RequestContent({ params }: Pick<PageProps<"/my-trips/[code]">, "params">) {
  const { code } = await params;
  return <RequestDetail code={decodeURIComponent(code)} />;
}
