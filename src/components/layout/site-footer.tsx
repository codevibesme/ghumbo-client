import Link from "next/link";
import { footerColumns, footerCompactLinks, footerTagline } from "@/config/site";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { Logo } from "./logo";

/*
 * Board footer (#141A24): stock text, flap-yellow column heads, logo with coral
 * pin. Every page except sign-in / OTP. Below 720px it collapses to the compact
 * two-column footer from the canvas. Terms / Privacy are not linked: those
 * pages are not planned. The theme switch is ours (dark mode), not the canvas's.
 */

const footLink = "text-[15px] leading-[1.2] text-on-board no-underline hover:text-flap";

export function SiteFooter() {
  return (
    <footer className="on-board bg-board text-on-board">
      {/* Desktop */}
      <div className="page-container hidden pt-14 pb-8 md:block">
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Ghumbo home" className="inline-flex min-h-11 items-center self-start">
              <Logo tone="stock" className="w-[140px]" />
            </Link>
            <p className="m-0 max-w-[32ch] text-[15px] leading-normal">
              {footerTagline.split(/(?<=\.) /).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="m-0 mb-3 font-mono text-[12px] font-semibold uppercase leading-none tracking-[0.08em] text-flap">
                {col.title}
              </h2>
              <div className="flex flex-col">
                {col.links.map((l) => (
                  <Link key={l.label} href={l.href} className={`inline-block py-2 ${footLink}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
        </div>
        <FooterBase />
      </div>

      {/* Mobile compact */}
      <div className="flex flex-col gap-4 px-4 pt-8 pb-6 md:hidden">
        <Link href="/" aria-label="Ghumbo home" className="inline-flex min-h-11 items-center self-start">
          <Logo tone="stock" className="w-[120px]" />
        </Link>
        <p className="m-0 text-[14px] leading-normal">{footerTagline}</p>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-4">
          {footerCompactLinks.map((l) => (
            <Link key={l.label} href={l.href} className={`flex min-h-11 items-center ${footLink}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <FooterBase />
      </div>
    </footer>
  );
}

function FooterBase() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-board-dash pt-4 font-mono text-[12px] font-medium leading-none tracking-[0.08em] text-board-label md:mt-10 md:pt-5">
      <span>© 2026 GHUMBO</span>
      <ThemeToggle tone="board" className="hidden md:inline-flex" />
    </div>
  );
}
