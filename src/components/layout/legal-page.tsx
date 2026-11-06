import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Kicker } from "@/components/ui/section-header";
import { LEGAL_UPDATED, business, legalLinks } from "@/config/legal";
import { supportEmail, supportPhone } from "@/config/site";
import { pad2 } from "@/lib/format";

export type LegalSection = { id: string; title: string; body: ReactNode };

/*
 * Terms, privacy and cancellation: header, then numbered sections with a
 * sticky "On this page" list on wide screens. Server-rendered and indexable.
 * Section bodies are plain JSX (p, ul, table); the prose styles live here.
 */
const prose = [
  "flex max-w-[70ch] flex-col gap-3 type-body",
  "[&_p]:m-0 [&_ul]:m-0 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5 [&_li]:pl-1",
  "[&_a]:text-link [&_a]:underline [&_a]:underline-offset-[3px] [&_a:hover]:text-red [&_strong]:font-semibold",
].join(" ");

/**
 * The Grievance Officer block every legal page ends with. Consumer Protection
 * (E-Commerce) Rules 2020: name, designation and contact on the site; acknowledge
 * within 48 hours, resolve within one month. DPDP Act 2023: the same contact for
 * privacy requests, answered within 30 days.
 */
export function GrievanceContact() {
  return (
    <>
      <p>
        Our Grievance Officer is <strong>{business.founder}</strong>, Founder, {business.name}. Reach them at:
      </p>
      <ul>
        <li>
          Email: <a href={`mailto:${supportEmail}`}>{supportEmail}</a> (write “Grievance” in the subject)
        </li>
        {supportPhone && (
          <li>
            Phone: <a href={supportPhone.href} className="whitespace-nowrap">{supportPhone.display}</a>
          </li>
        )}
        <li>Post: {business.address}</li>
      </ul>
      <p>
        We acknowledge every complaint within 48 hours and resolve it within 30 days. Quote your request or booking
        reference (it starts with GH-) if you have one.
      </p>
    </>
  );
}

export function LegalPage({
  kicker,
  title,
  lede,
  sections,
  current,
}: {
  kicker: string;
  title: string;
  lede: ReactNode;
  sections: LegalSection[];
  /** This page, left out of "Also read". */
  current: keyof typeof legalLinks;
}) {
  const others = Object.entries(legalLinks).filter(([key]) => key !== current);
  return (
    <main className="page-container flex flex-1 flex-col gap-8 pt-6 pb-16 md:gap-10 md:pt-12 md:pb-24">
      <header className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
        <div className="flex flex-col gap-2">
          <Kicker>{kicker}</Kicker>
          <h1 className="m-0 type-h1">{title}</h1>
        </div>
        <p className="m-0 max-w-[60ch] type-body-l">{lede}</p>
        <span className="font-mono text-[12px] font-medium leading-none tracking-[0.08em] text-muted">
          UPDATED <time dateTime={LEGAL_UPDATED.iso}>{LEGAL_UPDATED.label.toUpperCase()}</time>
        </span>
      </header>

      <div className="grid items-start gap-8 min-[960px]:grid-cols-[260px_minmax(0,1fr)] min-[960px]:gap-12">
        <nav
          aria-label="On this page"
          className="hidden flex-col gap-1 rounded-ticket border-[1.5px] border-line bg-card px-5 py-4 min-[960px]:sticky min-[960px]:top-6 min-[960px]:flex"
        >
          <span className="pb-2 type-stub text-muted">On this page</span>
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="grid min-h-9 grid-cols-[28px_minmax(0,1fr)] items-baseline py-1 text-[14px] leading-[1.35] text-ink no-underline hover:text-red"
            >
              <span className="font-mono text-[12px] font-semibold text-red">{pad2(i + 1)}</span>
              {s.title}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="flex scroll-mt-24 flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] font-semibold leading-none tracking-[0.08em] text-red">{pad2(i + 1)}</span>
                <h2 id={`${s.id}-h`} className="m-0 type-h3">
                  {s.title}
                </h2>
              </div>
              <div className={prose}>{s.body}</div>
            </section>
          ))}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t-2 border-dashed border-tear pt-5">
            <span className="type-stub text-muted">Also read</span>
            {others.map(([key, l]) => (
              <Link key={key} href={l.href} className="inline-flex min-h-11 items-center text-[15px] font-semibold text-link underline underline-offset-[3px] hover:text-red">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
