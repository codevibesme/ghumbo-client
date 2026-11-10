import type { MetadataRoute } from "next";
import { DISALLOWED_PATHS, SITE_URL } from "@/config/seo";

/*
 * Everyone may crawl the public site, AI search, answer and training crawlers
 * included: we want to be cited (docs/seo-geo-guidelines.md §3). One `*` group
 * covers them all; a named group would replace these disallows for that bot.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
