"use client";

import { Menu, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { type NavKey, mainNav } from "@/config/site";
import { fullName, initials, photoUrl, useSession } from "@/features/auth/session";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

/*
 * Identical on every screen. Desktop 80px, logo 160, nav mono 13; current item
 * gets a 2px stamp-red underline + aria-current. Below 720px: 64px, logo 128,
 * 44px menu button. The dashed rule spans the 1200 container, not the viewport.
 * Auth screens (sign in / OTP) use `minimal`: logo only, no nav.
 */

type HeaderUser = { name: string; initials?: string; photo?: string | null };

type SiteHeaderProps = {
  /** Highlighted nav item; derived from the URL when omitted. */
  current?: NavKey;
  /** Signed-in traveller; shows "My trips" + avatar (photo, else initials) instead of Sign in.
   *  Read from the session when omitted; pass it to force a state (design system). */
  user?: HeaderUser;
  minimal?: boolean;
};

function navKeyFor(pathname: string): NavKey | undefined {
  if (pathname.startsWith("/my-trips")) return "my-trips";
  return mainNav.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.key;
}

const navLink =
  "py-4 font-mono text-[13px] font-medium uppercase leading-none tracking-[0.06em] text-ink no-underline hover:text-red";
const currentLink = "shadow-[inset_0_-2px_0_var(--g-red)]";

/*
 * usePathname() is request data on dynamic routes ([slug] app shells), so it
 * lives behind its own Suspense: the shell gets the header without the
 * active-nav underline and it fills in once the URL is known.
 */
export function SiteHeader(props: SiteHeaderProps) {
  if (props.current || props.minimal) return <HeaderBar {...props} />;
  return (
    <Suspense fallback={<HeaderBar {...props} />}>
      <HeaderForPath {...props} />
    </Suspense>
  );
}

function HeaderForPath(props: SiteHeaderProps) {
  const pathname = usePathname();
  return <HeaderBar {...props} current={navKeyFor(pathname)} />;
}

function HeaderBar({ current, user: userOverride, minimal }: SiteHeaderProps) {
  const session = useSession();
  const user =
    userOverride ??
    (session.user
      ? { name: fullName(session.user), initials: initials(session.user), photo: photoUrl(session.user) }
      : undefined);

  return (
    <header className="page-container">
      <div className="flex h-16 items-center gap-2 border-b-2 border-dashed border-tear md:h-20 md:gap-10">
        <Link href="/" aria-label="Ghumbo home" className="mr-auto inline-flex shrink-0 md:mr-0">
          <Logo className="w-32 md:w-40" />
        </Link>

        {!minimal && (
          <>
            <nav aria-label="Main" className="hidden gap-7 md:flex">
              {mainNav.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={current === item.key ? "page" : undefined}
                  className={cn(navLink, current === item.key && currentLink)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-5 md:ml-auto md:flex">
              {user ? (
                <>
                  <Link
                    href="/my-trips"
                    aria-current={current === "my-trips" ? "page" : undefined}
                    className={cn(navLink, current === "my-trips" && currentLink)}
                  >
                    My trips
                  </Link>
                  <Avatar user={user} />
                </>
              ) : (
                <Button asChild variant="secondary" size="m">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              )}
            </div>

            {user && (
              <span className="md:hidden">
                <Avatar user={user} />
              </span>
            )}
            <MobileMenu current={current} user={user} />
          </>
        )}
      </div>
    </header>
  );
}

function Avatar({ user }: { user: HeaderUser }) {
  return (
    <Link
      href="/profile"
      aria-label={`Account: ${user.name}`}
      className="relative inline-flex size-11 items-center justify-center overflow-hidden rounded-full bg-passport font-mono text-[14px] font-semibold leading-none tracking-[0.04em] text-on-passport no-underline"
    >
      {user.photo ? (
        <Image src={user.photo} alt="" fill sizes="44px" className="object-cover" />
      ) : (
        user.initials || <UserRound size={20} aria-hidden />
      )}
    </Link>
  );
}

const iconButton =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-ticket border-[1.5px] border-line bg-card text-ink";

/*
 * Not drawn on the canvas yet: a full-screen sheet built from the same parts
 * (header row, h4 links on tear lines, primary/secondary buttons).
 */
function MobileMenu({ current, user }: Pick<SiteHeaderProps, "current" | "user">) {
  const [open, setOpen] = useState(false);
  const links = user ? [...mainNav, { key: "my-trips" as const, label: "My trips", href: "/my-trips" }] : mainNav;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={cn(iconButton, "md:hidden")} aria-label="Open menu">
        <Menu size={20} aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-stock text-ink md:hidden"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-dashed border-tear px-4">
            <Link href="/" aria-label="Ghumbo home" className="mr-auto inline-flex" onClick={() => setOpen(false)}>
              <Logo className="w-32" />
            </Link>
            <Dialog.Close className={iconButton} aria-label="Close menu">
              <X size={20} aria-hidden />
            </Dialog.Close>
          </div>
          <nav aria-label="Main" className="flex flex-col px-4 pt-2">
            {links.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={current === item.key ? "page" : undefined}
                className={cn(
                  "flex min-h-16 items-center border-b-2 border-dashed border-tear type-h3 text-ink no-underline",
                  current === item.key && "text-red",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-4 px-4 pt-8 pb-6">
            {!user && (
              <Button asChild variant="secondary" fullWidth>
                <Link href="/sign-in" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
            <ThemeToggle className="self-start" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
