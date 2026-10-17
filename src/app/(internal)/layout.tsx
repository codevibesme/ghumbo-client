import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Team-only pages (design system showcase). Available in `next dev` and on
// preview deployments; production builds serve a 404.
const enabled = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  if (!enabled) notFound();
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
