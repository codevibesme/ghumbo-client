"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Kicker } from "@/components/ui/section-header";
import { buttonClasses, textLinkClasses } from "@/components/ui/variants";
import { supportEmail } from "@/config/site";

// Runtime error on a public page (usually the backend being unreachable).
// The (site) layout still renders around it, so the header and footer stay.
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex flex-1 flex-col gap-6 py-12 md:py-16">
      <title>Something went wrong · Ghumbo</title>
      <meta name="robots" content="noindex" />
      <Kicker>Delayed · error</Kicker>
      <h1 className="m-0 type-h1">This page didn’t load.</h1>
      <p className="m-0 max-w-[52ch] type-body-l">
        Something on our side failed while loading it. Try again in a moment. If it keeps happening, write to{" "}
        <a href={`mailto:${supportEmail}`} className={textLinkClasses()}>
          {supportEmail}
        </a>
        .
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => retry()} className={buttonClasses()}>
          <RotateCcw size={20} aria-hidden />
          Try again
        </button>
        <Link href="/trips" className={textLinkClasses()}>
          See all trips
        </Link>
      </div>
      {error.digest && <p className="m-0 type-stub text-muted">Reference {error.digest}</p>}
    </main>
  );
}
