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

- `/indonesia/destinations` — Places we cover (island blurbs). The old `/indonesia/guide/*` pages were retired and redirect here.
- `/indonesia` — hub page, with the Trip Planner (drive + boat math) embedded under the heading (`components/TripPlanner.js`); `/indonesia/planner` redirects here
- `/indonesia/routes` and `/indonesia/routes/[slug]` — route timetables (12Go sailings only, see CLAUDE.md)
- `/indonesia/ports` — All Ports directory
- `/indonesia/split-charter` — Split-charter waitlist
- `/about` — Why IslandBounce / trust & affiliate disclosure (brand-level, not region-specific)

When Philippines or Laos go live, they get their own `/philippines/` and
`/laos/` trees with the same internal structure (a hub page + the same tool
set).

## Project structure

```
app/                  Next.js App Router pages (file-based routing)
app/api/               Server-side route handlers (sea conditions)
components/           Shared UI: Nav, Footer, PortCard
lib/theme.js          Color tokens (keep in sync with tailwind.config.js)
lib/affiliateLinks.js Affiliate link builders (12Go, Klook, Viator, GYG)
data/sailings.js      Every sailing the site shows (12Go only, from data/twelvego.js)
data/ports.js         Ports directory content + geocodable addresses
data/planner.js       Trip Planner route pairs + drive times
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
2. Extend `BOAT_ROUTES` in `data/planner.js` to more of the 53 port pairs the
   12Go data covers (only pairs with 12Go sailings may be added).
3. The Trip Planner uses the browser-side Google Maps key for live driving
   routes. The old server-side Distance Matrix routes (`/api/closest-port`,
   `/api/route-finder`) and their pages were deleted in Oct 2026, so
   `GOOGLE_MAPS_API_KEY` is no longer needed and can be revoked.
4. Add per-page `schema.org` JSON-LD (Trip/FAQPage/BreadcrumbList) and a
   generated `sitemap.xml` before launch.
5. Move `DESTINATIONS`/ports/planner data out of hardcoded JS and into a CMS
   or structured data file once non-technical edits are needed.
