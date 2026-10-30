import { X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { AuthArt, AuthPhotoStrip, type AuthPhoto } from "@/features/auth/components/auth-art";
import { searchTrips } from "@/features/tours/api";

/*
 * Sign-in and OTP: a split screen. Left, the form column with only the logo
 * above it; right (960px and up), a photo ticket on a navy panel. Phones get a
 * 64px bar with a close button and a short photo strip instead. No footer.
 */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const sandakphu = await sandakphuTrip();
  const photo: AuthPhoto | null = sandakphu?.asset?.url
    ? { src: sandakphu.asset.url, alt: sandakphu.asset.label || "Kanchenjunga from Sandakphu on the Singalila Ridge" }
    : null;

  return (
    <div className="grid flex-1 min-[960px]:grid-cols-2">
      <div className="flex flex-col px-4 md:px-6">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
          <header className="-mx-4 flex h-16 items-center gap-2 border-b-2 border-dashed border-tear px-4 md:mx-0 md:h-20 md:border-0 md:px-0">
            <Link href="/" aria-label="Ghumbo home" className="mr-auto inline-flex min-h-11 items-center">
              <Logo className="w-32 md:w-40" />
            </Link>
            <Link
              href="/"
              aria-label="Close"
              className="inline-flex size-11 items-center justify-center rounded-ticket border-[1.5px] border-line bg-card text-ink md:hidden"
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
            </Link>
          </header>
          <main className="flex flex-col pb-10 pt-6 md:my-auto md:pb-16 md:pt-12">
            <AuthPhotoStrip photo={photo} />
            {children}
          </main>
        </div>
      </div>
      <AuthArt photo={photo} place="Sandakphu · Singalila Ridge" region={sandakphu?.destination?.name ?? "West Bengal"} />
    </div>
  );
}

/** The panel's photo: the seeded Sandakphu trek's cover. The panel still renders if the catalog is down. */
async function sandakphuTrip() {
  try {
    const trips = await searchTrips("sandakphu");
    return trips[0] ?? null;
  } catch {
    return null;
  }
}
