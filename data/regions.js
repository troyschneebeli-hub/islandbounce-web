// Region registry. This is what the cover page (`/`) reads to render its
// "Where we operate" grid, and what tells Nav.js whether it's inside a
// region (show region tools) or on the brand-level cover (show brand nav).
//
// Adding a new region later = add an entry here with status "active" and
// build out its /app/<slug>/ tree — the cover page picks it up automatically.

export const REGIONS = [
  {
    slug: "indonesia",
    name: "Indonesia",
    tagline: "Bali, the Gili Islands, Nusa Penida & Lombok",
    status: "active",
    flag: "🇮🇩",
    // Drop a real, licensed photo at this path (public/images/regions/) and
    // it'll be used automatically — until then the card falls back to the
    // Indonesian flag (drawn as real SVG in components/Flags.js). See
    // public/images/regions/README.md for photo sourcing.
    photo: "/images/regions/indonesia.jpg",
  },
  {
    slug: "philippines",
    name: "Philippines",
    tagline: "Coming soon",
    status: "coming-soon",
    flag: "🇵🇭",
    photo: "/images/regions/philippines.jpg",
  },
  {
    slug: "laos",
    name: "Laos",
    tagline: "Coming soon",
    status: "coming-soon",
    flag: "🇱🇦",
    photo: "/images/regions/laos.jpg",
  },
];

export function isRegionPath(pathname) {
  return REGIONS.some((r) => pathname === `/${r.slug}` || pathname.startsWith(`/${r.slug}/`));
}

export function activeRegionFromPath(pathname) {
  return REGIONS.find((r) => pathname === `/${r.slug}` || pathname.startsWith(`/${r.slug}/`));
}
