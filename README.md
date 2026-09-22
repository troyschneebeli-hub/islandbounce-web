# IslandBounce — Next.js production build

Real, crawlable Next.js (App Router) port of the `island-bounce-site.jsx` design
reference. This is the site meant to actually deploy, per the project's
"Next real steps" — same design tokens, same data, real routing instead of
in-memory `useState` "pages."

## Getting started

Requires Node.js 18.18+ (Next.js 14 requirement) and network access to install
packages — this project was written without running `npm install`, since the
sandbox it was built in has no internet access. Run these on your own machine:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Route map (matches the locked domain architecture)

Per the project README, this is one brand (`islandbouncetravel.com`) with **regions
as subdirectories**, not new domains. That's now reflected structurally, not
just in the URL:

- **`/` is the brand-level cover page** — light-blue hero with a wave divider
  (`components/WaveDivider.js`), a grid of country branches (Indonesia live
  now; Philippines/Laos shown as "coming soon" from `data/regions.js`), and
  the trust blurb. It has zero region-specific content or tools — no Trip
  Planner CTA, no port links. Its nav (`Nav.js`) is styled light-blue to
  match (`COLORS.skyDeep` background) and only shows Home / Destinations /
  Why IslandBounce.
- **`/indonesia` is the region hub** — everything Indonesia-specific lives
  under here: the tool grid (Trip Planner, Find My Port, All Ports, Compare
  Boats), destination guides, and the split-charter teaser. Its nav swaps
  back to the original deep-teal look (`COLORS.sea`) plus region tools and a
  breadcrumb back to the cover page ("ISLANDBOUNCE / INDONESIA") — the color
  switch itself signals "you've left the brand page and you're inside a
  destination now."

`Nav.js` decides which nav to show by checking the current path against
`data/regions.js` (`isRegionPath`) — so adding Philippines later means
flipping its `status` to `"active"` in `data/regions.js` and building out
`app/philippines/`; the cover page and nav pick it up automatically, no nav
code changes needed.

- `/indonesia/guide/[slug]` — Destination guide (currently `bali-gili-lombok`)
- `/indonesia/find-port` — Find My Closest Port (real Google Maps driving times)
- `/indonesia/planner` — Trip Planner (drive + boat math)
- `/indonesia/compare` — Quick boat comparison tool
- `/indonesia/ports` — All Ports directory
- `/indonesia/split-charter` — Split-charter waitlist
- `/about` — Why IslandBounce / trust & affiliate disclosure (brand-level, not region-specific)

When Philippines or Laos go live, they get their own `/philippines/` and
`/laos/` trees with the same internal structure (a hub page + the same tool
set) — see the preserved (inactive) `vang-vieng` entry in
`data/destinations.js` as the content template.

## Project structure

```
app/                  Next.js App Router pages (file-based routing)
app/api/               Server-side route handlers (Distance Matrix proxy)
components/           Shared UI: Nav, Footer, PortCard
lib/theme.js          Color tokens (keep in sync with tailwind.config.js)
lib/affiliateLinks.js Affiliate link builders (12Go, Klook, Viator, GYG)
data/destinations.js  Destination content + transport/activities per destination
data/ports.js         Ports directory content + geocodable addresses
data/planner.js       Trip Planner route data + calculation logic
data/regions.js       Region registry (drives cover page grid + Nav switching)
```

## What changed from the prototype

- Fake `useState`-based "routing" replaced with real Next.js routes — every
  page now has its own crawlable URL, which was the whole point of moving to
  Next.js (see the prototype's own NOTE block).
- Static pages (Home, Ports, Guide, About) are server components; interactive
  pages (Trip Planner, Compare, Split Charter) are client components (`"use
  client"`) since they use `useState`.
- Destination guide pages use `generateStaticParams` off `ACTIVE_DESTINATIONS`
  so each guide is statically generated at build time.
- Affiliate partner IDs now read from environment variables
  (`.env.example` → copy to `.env.local`) instead of hardcoded placeholders.

## Still open (from the project's "Next real steps")

1. Submit affiliate applications, then fill in real IDs in `.env.local`.
2. Add the full 19-route Bali/Gili/Nusa/Lombok data set to `data/planner.js`
   and `data/destinations.js` (currently only the original Gili Trawangan-era
   subset).
3. ~~Swap the Trip Planner's area-based drive-time estimates for real geocoding/routing~~ —
   done for point-to-point lookups via the new **Find My Closest Port** page
   (`/indonesia/find-port`), which calls Google's Distance Matrix API server-side
   (`app/api/closest-port/route.js`). Requires `GOOGLE_MAPS_API_KEY` in
   `.env.local` with the Distance Matrix API enabled and billing set up in
   Google Cloud Console. The Trip Planner itself still uses the area-based
   `DRIVE_TIMES` table in `data/planner.js` — worth revisiting whether to
   replace that with the same live API now that it's wired in, or keep it
   for speed/cost reasons (Distance Matrix is billed per request).
4. Add per-page `schema.org` JSON-LD (Trip/FAQPage/BreadcrumbList) and a
   generated `sitemap.xml` before launch.
5. Move `DESTINATIONS`/ports/planner data out of hardcoded JS and into a CMS
   or structured data file once non-technical edits are needed.
