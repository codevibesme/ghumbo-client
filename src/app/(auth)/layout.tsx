import { SiteHeader } from "@/components/layout/site-header";

// Sign-in and OTP: logo-only header, no footer.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader minimal />
      <main className="page-container flex flex-1 justify-center py-12 md:py-20">
        <div className="flex w-full max-w-[440px] flex-col gap-8">{children}</div>
      </main>
    </>
  );
}
