<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project structure

```
src/
  app/                    routes only; colocate private bits in _components/
    (site)/               public pages: header + footer layout (home, trips, destinations…)
    (internal)/           team-only pages; 404 in production (dev + Vercel preview only)
    layout.tsx            root: fonts, theme script, providers
  components/
    ui/                   design-system primitives, one component per file; shared class builders in variants.ts
    layout/               site chrome: header, footer, logo, sticky action bar
    providers.tsx
  features/<domain>/      tours, destinations, theme… each owns components/, types.ts and (later) api.ts
  config/site.ts          nav and footer links
  lib/                    framework-agnostic helpers (cn, format)
docs/                     guidelines (SEO/GEO)
```

- Planned route groups: `(auth)` for sign-in/OTP (logo-only header, no footer) and `(account)` for signed-in pages (noindex).
- Backend calls go in `features/<domain>/api.ts` with `import "server-only"`; types the UI renders live in `features/<domain>/types.ts`.
- Component files export only components (React Doctor `only-export-components`); constants, hooks and class builders go in `.ts` modules.

## SEO and AI-search (GEO/AEO)

Public pages must follow `docs/seo-geo-guidelines.md`. The rules most often broken:

- Indexable content and JSON-LD are server-rendered and prerendered; AI crawlers don't run JavaScript.
- Radix `Accordion`/`Tabs` unmount closed panels: use `forceMount` or `<details>` for FAQs and itineraries.
- No `Event` schema for trips; no ratings on the Organization schema.
- Run the "Checklist for every new public page" at the end of that doc.
