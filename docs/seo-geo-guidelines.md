\# SEO + GEO/AEO guidelines

How ghumbo.com gets found in Google/Bing **and** gets cited by AI answer engines
(Google AI Overviews / AI Mode, ChatGPT search, Claude, Perplexity, Copilot).
Researched October 2026. Rules marked **MUST** are review blockers; the rest are defaults.

## What actually moves the needle

There is no separate "AI SEO". Google's own guidance (Search Central, *AI features
and your website*, updated 2025-12-10): to appear in AI Overviews / AI Mode a page
only has to be indexed and eligible for a snippet. No special files, no special schema.
Answer engines retrieve pages, split them into passages, and quote the passages that
answer a sub-question clearly and specifically ("query fan-out").

So, in order of evidence:

1. **The facts are in the server HTML.** None of the major AI crawlers execute
   JavaScript (Vercel/MERJ crawler study, Dec 2024). If it isn't in the HTML response,
   ChatGPT/Claude/Perplexity never see it.
2. **Crawlers are allowed**, robots.txt and CDN/firewall both.
3. **Pages are fact-dense and answer questions directly**: exact prices, dates, seats,
   inclusions, how to reach, best months. Statistics, quotes and cited sources raised
   visibility in generative answers by up to ~40% in the GEO study
   (Aggarwal et al., KDD '24, arXiv 2311.09735). Keyword stuffing did nothing.
4. **Third-party mentions** (Google reviews, Reddit, YouTube, travel blogs) correlate
   with AI visibility far more than backlinks (Ahrefs, 75k brands, Dec 2025;
   correlation, not proof).
5. Classic technical SEO: canonicals, sitemaps with honest `lastmod`, Core Web Vitals.

**Low value / hype:** `llms.txt` (Google: "no AI system currently uses llms.txt";
Ahrefs 2026: 97% of llms.txt files got zero requests), FAQPage markup for rich results
(Google stopped showing FAQ rich results for all sites on 7 May 2026), "GEO score" tools,
rewriting copy into fixed-size "AI chunks".

---

## 1. Rendering (frontend) — MUST

- **Indexable content is server-rendered.** Tour, destination, home, how-it-works and
  FAQ content lives in Server Components and is prerendered: `generateStaticParams` +
  `"use cache"` with `cacheTag`, revalidated on change (see §8). No client-side fetches
  for itinerary, departures, prices, seats, inclusions, FAQs, reviews or JSON-LD.
- **Collapsed content stays in the DOM.** Radix `Accordion`/`Tabs` unmount closed
  panels, so their text is only in the React payload, not the HTML (verified on
  `/design-system`: closed FAQ answers are missing from the markup). On public pages:
  - FAQs and itinerary days: render with `forceMount` and hide closed panels with CSS
    (`data-[state=closed]:hidden`), or use native `<details>/<summary>`.
  - Don't put indexable content behind `Tabs`; use sections with anchor links.
- **Metadata goes in `<head>` for AI crawlers.** Next 16 streams `generateMetadata`
  output into `<body>` for any user agent not in its "HTML-limited bots" list, and
  GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User,
  PerplexityBot and Perplexity-User are not in it. Two rules:
  - `generateMetadata` reads cached data (`"use cache"`) so it is prerendered.
  - Add the AI agents to `htmlLimitedBots` in `next.config.ts`, extending Next's
    default regex (copy it from `next/dist/shared/lib/router/utils/html-bots.js`):
    `…|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|Claude-User|PerplexityBot|Perplexity-User|CCBot|Meta-ExternalAgent`.
- **Real links.** Every crawlable page is reachable through `<Link href>` from
  somewhere. No navigation that only works via `onClick`/`router.push`.
- **Images**: `next/image`, meaningful `alt` (the photo's subject, not "image"),
  explicit `sizes`. The hero image of a tour page gets `priority`.

## 2. URLs and indexing — MUST

- Public URL patterns (decide once, then never change without a 301):
  - `/trips` — all trips
  - `/trips/[tour-slug]` — tour detail (canonical for every departure of that tour)
  - `/destinations/[destination-slug]` — e.g. `/destinations/west-bengal`
  - `/how-it-works`, `/about`, `/contact`, `/terms`, `/privacy`
- Lowercase, hyphenated, no trailing slash, no IDs in public URLs.
- **Canonical** on every indexable page (`alternates.canonical` in metadata),
  absolute, on `https://ghumbo.com`.
- **Filters and sort** (`?month=`, `?price=`, `?sort=`) canonicalise to the unfiltered
  page and are not linked as separate pages. Departure selection (`?departure=`) also
  canonicalises to the tour.
- **noindex**: `/sign-in`, `/verify`, `/my-trips`, `/profile`, request-a-seat and
  "request sent" pages, any preview/draft routes. (`/design-system` already 404s in production.)
- A changed slug must 301 to the new one (backend keeps slug history, §8).
- `<html lang="en-IN">`. No hreflang until translated pages exist (§7).

## 3. robots.txt (`src/app/robots.ts`)

We want to be cited, so **allow** search, answer and user-fetch agents, and training
crawlers too (brand recall in future models outweighs the cost for a new brand).

- Allow all: Googlebot, Bingbot, Applebot, OAI-SearchBot, ChatGPT-User, GPTBot,
  Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot, Perplexity-User,
  Google-Extended, CCBot.
- Disallow for everyone: `/api/`, `/my-trips`, `/profile`, `/sign-in`, `/verify`,
  request-form routes.
- `sitemap: https://ghumbo.com/sitemap.xml`.
- Check the host/CDN bot protection (e.g. Vercel firewall, Cloudflare "block AI bots")
  is **off** for these agents. Blocking there silently overrides robots.txt.
- Don't use `nosnippet` / `max-snippet` / `data-nosnippet` on content we want quoted.
  (Google-Extended does *not* affect AI Overviews/AI Mode; snippet controls do.)

## 4. Metadata per page

| Page | `<title>` | Description |
|---|---|---|
| Home | `Ghumbo · Budget group trips across India` | what, who, how booking works |
| Tour | `{Tour name} · {N}D/{N}N group trip from ₹{min} · Ghumbo` | route, highlights, next date, "no payment online" |
| Destination | `{Destination} group trips · {N} trips from ₹{min} · Ghumbo` | top places + trip count |
| How it works | `How Ghumbo group trips work · Ghumbo` | request → call → deposit |

- Titles ≤ 60 characters where possible, descriptions 140–160, written for people.
- Every indexable page has an Open Graph image. Tours use a generated
  `opengraph-image.tsx` in the Ticket style (name, route, dates, price). Others fall
  back to a brand card.
- `metadataBase: https://ghumbo.com` (already set in `src/app/layout.tsx`).

## 5. Structured data (JSON-LD)

Render as `<script type="application/ld+json">` in the page's Server Component,
escaping `<` as `<` (Next JSON-LD guide). Type it with `schema-dts`. **It must
match the visible page.** Never mark up something the page doesn't show.

| Page | Types |
|---|---|
| Site-wide (root layout) | `TravelAgency` (an `Organization`/`LocalBusiness` subtype): name, url, logo, telephone, email, address/areaServed, `sameAs` (Instagram, YouTube, Google Business Profile). `WebSite`. |
| Tour | `["TouristTrip","Product"]` with `name`, `description`, `image`, `touristType`, `itinerary` (ItemList of places/days), `provider` → the TravelAgency `@id`, and **one `Offer` per open departure**: `price`, `priceCurrency: "INR"`, `availability` (InStock / LimitedAvailability ≤ 6 seats / SoldOut), `validFrom`, `availabilityStarts/Ends` = departure dates, `inventoryLevel` = seats left. `aggregateRating` + `review` only from verified, published traveller reviews shown on the page. `BreadcrumbList`. |
| Destination | `TouristDestination` (name, description, `includesAttraction`) + `ItemList` of its tours + `BreadcrumbList` |
| How it works / FAQ | `FAQPage` is optional (no Google rich result since May 2026; may still help other parsers). Only for Q&As visible on the page. |

Don'ts:
- **No `Event` markup for trips.** Google's Event policy explicitly forbids "Trip
  package" events and it can trigger a manual action.
- **No `aggregateRating` on the Organization/TravelAgency.** Reviews we host about
  ourselves are "self-serving" and ineligible. Ratings belong on the tour (Product).
- No invented `review` content, no ratings with fewer than real reviews behind them.

Validate with Google's Rich Results Test and validator.schema.org before shipping.

## 6. Content rules (tour, destination and guide pages)

These make passages quotable. Most come from Google's helpful-content guidance; the
GEO evidence backs the "specific facts, numbers, sources" part.

- **Answer first.** Each section starts with a 1–2 sentence direct answer, then detail.
  ("Darjeeling: Queen of the Hills is a 4-day, 3-night group trip from New Jalpaiguri
  for up to 18 people, from ₹7,799 per person.")
- **Question-shaped H2s** for what people ask: *When is the best time to go?*,
  *How do I reach the start point?*, *What does it cost in total?*, *Is it okay to come
  solo?*, *What's the cancellation policy?*
- **Fact block near the top** of every tour: duration, start/end point, group size,
  age band, difficulty, best months, next departures with seats left, price per
  person, what's included / not included.
- **Specific numbers beat adjectives**: altitudes, drive times, daily meal budgets,
  "₹600–700 a day for lunch and dinner", seat counts.
- **Visible "Updated {date}"** on tour and destination pages, from the backend's real
  `updated_at`. Never fake freshness.
- **Original data** where we have it: real cost breakdowns, how many travellers went,
  average group age, review quotes with names and dates.
- **Trust (E-E-A-T)**: named trip leaders with short bios, company registration and
  licences, a real phone and address, cancellation and refund policy, photo credits.
- **Destination hubs** (`/destinations/west-bengal`, later Darjeeling, Sundarbans…)
  answer the sub-questions around the trips (best time, how to reach from Kolkata,
  permits, safety, budget) and link to every relevant tour.
- Write in plain English for Indian readers. Prices in ₹ with Indian digit grouping
  (`formatINR`), dates as `Fri 13 Nov 2026`.

## 7. Languages

AI Mode in India answers in Hindi and Bengali (Bengali since Oct 2025). Bengali and
Hindi versions of the West Bengal pages are a low-competition opportunity, but only
when we can maintain them. When we do: `/bn/...`, `/hi/...`, hreflang
`en-IN` / `bn-IN` / `hi-IN` + `x-default`, translated by people, not machine-only.
(The brand stays all-India; this is page content, not branding.)

## 8. Backend responsibilities

The backend currently has the right bones (unique slugs, `status`, `updated_at`), but
nothing public to read from. Needed, in priority order:

1. **Public read API** (no auth, cacheable):
   - `GET /tours`: live tours with next open departure, min price, seats left, cover
     image, `updated_at`
   - `GET /tours/:slug`: everything the page renders (itinerary, inclusions,
     exclusions, assets, open departures with prices, published reviews summary)
   - `GET /destinations`, `GET /destinations/:slug`
   - `GET /tours/:slug/reviews`: published reviews, paginated
   - `GET /seo/sitemap`: `{type, slug, lastmod}` for every live tour and destination
   - Only `status=live` tours/destinations and `open` departures. Send `Cache-Control`
     and `ETag`/`Last-Modified`.
2. **Honest `lastmod`.** A tour's effective `updated_at` must change when its
   departures, prices, seats or reviews change (store `content_updated_at` on the tour
   or compute `GREATEST(...)`). Google only trusts `lastmod` that is consistently
   accurate.
3. **Content fields that don't exist yet:**
   - `tours.faqs` (jsonb `[{question, answer}]`)
   - `tours.seo_title`, `tours.seo_description` (optional overrides),
     the same for destinations
   - Tour facts: `start_point`, `end_point`, `best_months`, `difficulty`,
     `min_age`/`max_age`, `group_size` (capacity exists per departure; a tour-level
     "up to 18" is still useful)
   - Assets: split `alt` from `description` and add `credit` / `license` (seed photos
     are Wikimedia CC BY, which **requires** attribution)
   - Reviews: `status` (pending/published/rejected) + `published_at`. Only published
     reviews are shown or marked up.
4. **Slug history**: a `slug_redirects` table (`old_slug → tour/destination id`); the
   API returns the current slug so the frontend can 301.
5. **Change hooks**: after a write to a tour, destination, departure, price or review:
   - POST to the frontend's revalidation route (shared secret) so it can `revalidateTag`
     the affected tour, destination and listing pages
   - ping **IndexNow** with the changed URLs (Bing, Copilot; Google doesn't use it)
6. **AI crawler logging**: count hits by user agent (GPTBot, OAI-SearchBot,
   ClaudeBot, Claude-SearchBot, PerplexityBot…) per path, at the edge or API. It's the
   only way to see whether answer engines are reading us.

## 9. Performance budgets

Core Web Vitals at p75, mobile, field data: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**.
Our users are mostly on mid-range Android phones on mobile networks.

- Keep client components small: only interactive leaves (picker, forms, menus) are
  `"use client"`.
- Images through `next/image` with real `sizes`; no images over ~200 KB delivered.
- Fonts via `next/font` (already done); no layout shift from late-loading fonts.

## 10. Off-site and accounts (owner: founders)

- Verify **Google Search Console** and **Bing Webmaster Tools**; submit the sitemap
  to both. Bing's *AI Performance* report (preview since Feb 2026) shows Copilot
  citations and is currently the only first-party AI-citation data.
- **Google Business Profile**: category *Tour operator* / *Travel agency*, Kolkata
  service area, real phone and hours. Ask every traveller for a Google review (those
  aren't self-serving and feed local results and AI answers).
- Seed honest third-party presence: Instagram, YouTube trip videos, Reddit answers
  (r/kolkata, r/IndiaTravel), travel blogs and press.
- Google *Things to do* needs bookable inventory through a connectivity partner;
  revisit once online payment exists.

## 11. Measuring

- Search Console: impressions/clicks per page (AI Overview/AI Mode traffic is
  included under "Web", not separable).
- Bing Webmaster Tools AI Performance: citation share by topic.
- Analytics: referrals from `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`,
  `gemini.google.com`, `claude.ai` as their own channel.
- Backend crawler logs (§8.6).
- Monthly manual check: ask ChatGPT, Perplexity, Gemini and Claude "budget group trip
  Darjeeling from Kolkata" (and similar) and note whether and how Ghumbo is cited.

## Checklist for every new public page

- [ ] Content and JSON-LD present in the server HTML (view source, not DevTools)
- [ ] No important content inside closed Radix Accordion/Tabs without `forceMount`
- [ ] Title, description, canonical, OG image set; `noindex` if private
- [ ] JSON-LD matches visible content; passes the Rich Results Test
- [ ] Answer-first sections, question H2s, specific numbers, visible "Updated" date
- [ ] Reachable through a normal link; included in `sitemap.ts`
- [ ] `npm run doctor:push` and `npm run build` pass; Lighthouse mobile ≥ 90 performance
