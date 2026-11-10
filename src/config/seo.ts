import { business } from "@/config/legal";
import { supportEmail, supportPhone } from "@/config/site";

/*
 * Site-wide SEO facts (docs/seo-geo-guidelines.md). Every absolute URL, the
 * organisation's JSON-LD @id and the robots rules read from here.
 */

export const SITE_URL = "https://ghumbo.com";

/** `@id` of the TravelAgency node; trip and destination JSON-LD point to it. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const abs = (path: string) => `${SITE_URL}${path}`;

/** Logo for search engines (Google wants a raster image, at least 112 px). */
const LOGO_URL = "https://cdn.ghumbo.com/email/ghumbo-logo-ink-email.png";

/**
 * Public profiles that are ours. Add YouTube and the Google Business Profile
 * as they go live; they help engines tie mentions back to Ghumbo.
 */
const SAME_AS = ["https://www.instagram.com/ghumbo.trips/", "https://www.facebook.com/ghumbo.trips"];

/** Private or form routes: not crawled by anyone (§2, §3). */
export const DISALLOWED_PATHS = [
  "/api/",
  "/auth/",
  "/sign-in",
  "/verify",
  "/my-trips",
  "/profile",
  "/trips/*/request",
];

/** TravelAgency + WebSite, rendered once in the root layout (§5). No ratings here. */
export function siteLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": ORG_ID,
        name: "Ghumbo",
        ...(business.name !== "Ghumbo" && { legalName: business.name }),
        url: SITE_URL,
        logo: LOGO_URL,
        image: LOGO_URL,
        description:
          "Fixed-departure budget group trips across India for 20–35 year-olds. Request a seat, take our call, pay through a secure link.",
        email: supportEmail,
        ...(supportPhone && { telephone: supportPhone.e164 }),
        address: { "@type": "PostalAddress", streetAddress: business.address, addressCountry: "IN" },
        areaServed: { "@type": "Country", name: "India" },
        currenciesAccepted: "INR",
        ...(SAME_AS.length > 0 && { sameAs: SAME_AS }),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "Ghumbo",
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}
