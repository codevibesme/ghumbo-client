"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/layout/logo";
import { buttonClasses, textLinkClasses } from "@/components/ui/variants";

// Runtime error outside the public site (sign-in, account pages). Public pages
// use (site)/error.tsx, which keeps the site header and footer.
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container flex flex-1 flex-col items-start gap-6 py-12">
      <title>Something went wrong · Ghumbo</title>
      <meta name="robots" content="noindex" />
      <Link href="/" aria-label="Ghumbo home">
        <Logo />
      </Link>
      <h1 className="m-0 type-h1">Something went wrong.</h1>
      <p className="m-0 max-w-[52ch] type-body-l">Try again in a moment. Your session and any request you sent are safe.</p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => retry()} className={buttonClasses()}>
          Try again
        </button>
        <Link href="/" className={textLinkClasses()}>
          Go to the home page
        </Link>
      </div>
      {error.digest && <p className="m-0 type-stub text-muted">Reference {error.digest}</p>}
    </main>
  );
}
