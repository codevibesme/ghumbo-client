import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { getCountries, getDestinations } from "@/features/destinations/api";
import { countryHref, countrySlug } from "@/features/destinations/lib";
import { PlaceCards } from "./_components/place-cards";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Where Ghumbo runs fixed-date group trips, and where we open next.",
  alternates: { canonical: "/destinations" },
};

// Every live country with its destinations. One country today, so this reads like B03 without the board.
export default async function DestinationsPage() {
  "use cache";
  cacheLife("minutes");
  const countries = (await getCountries()).filter((c) => c.status === "live");
  const sections = await Promise.all(
    countries.map(async (c) => ({
      country: c,
      live: await getDestinations(countrySlug(c)),
      soon: await getDestinations(countrySlug(c), "coming_soon"),
    })),
  );

  return (
    <main className="page-container flex flex-1 flex-col gap-10 pt-8 pb-16">
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Destinations" }]} />
        <h1 className="m-0 type-h1">Destinations</h1>
        <p className="m-0 max-w-[60ch] type-body-l text-muted">
          We open one destination at a time, and only when the stays, drivers and coordinators are ready.
        </p>
      </div>
      {sections.map(({ country, live, soon }) => (
        <section key={country.id} className="flex flex-col gap-6">
          <SectionHeader title={country.name} action={<TextLink href={countryHref(country)}>About {country.name} →</TextLink>} />
          <PlaceCards live={live} soon={soon} />
        </section>
      ))}
    </main>
  );
}
