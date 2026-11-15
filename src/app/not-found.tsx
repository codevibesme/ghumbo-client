import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NotFoundView } from "./_components/not-found-view";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// T16 404 for unmatched URLs. No layout wraps it, so it brings its own chrome.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundView />
      <SiteFooter />
    </>
  );
}
