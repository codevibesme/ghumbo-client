import type { Metadata } from "next";
import { Kicker } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { ActionsSections } from "./_components/sections/actions";
import { ContentSections } from "./_components/sections/content";
import { FormsSections } from "./_components/sections/forms";
import { FoundationsSections } from "./_components/sections/foundations";
import { NavigationSections } from "./_components/sections/navigation";
import { TicketsSections } from "./_components/sections/tickets";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const nav = [
  ["foundations", "Foundations"],
  ["chrome", "Chrome"],
  ["actions", "Buttons"],
  ["forms", "Forms"],
  ["navigation", "Navigation"],
  ["status", "Status"],
  ["tickets", "Tickets"],
  ["decide", "Decide"],
  ["content", "Content"],
  ["surfaces", "Surfaces"],
];


export default function DesignSystemPage() {
  return (
    <main className="page-container flex flex-col gap-14 pt-6 pb-20 md:gap-20 md:pt-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Kicker>Direction B · Ticket &amp; passport</Kicker>
            <h1 className="m-0 type-h1">Design system</h1>
            <p className="m-0 max-w-[60ch] type-body-l text-muted">
              Tokens and components in code, mirroring the Ghumbo · Ticket canvas. Switch the theme to check the dark set.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-5">
          {nav.map(([id, label]) => (
            <TextLink key={id} href={`#${id}`}>
              {label}
            </TextLink>
          ))}
        </nav>
      </div>

      <FoundationsSections />
      <ActionsSections />
      <FormsSections />
      <NavigationSections />
      <TicketsSections />
      <ContentSections />
    </main>
  );
}
