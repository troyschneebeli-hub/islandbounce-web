"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { isRegionPath, activeRegionFromPath } from "@/data/regions";

const COVER_ITEMS = [
  ["/", "Home"],
  ["/#regions", "Destinations"],
  ["/about", "Why IslandBounce"],
];

const regionItems = (slug) => [
  [`/${slug}/planner`, "Trip Planner"],
  [`/${slug}/split-charter`, "Split Charters"],
  [`/${slug}/ports`, "All Ports"],
  [`/${slug}/compare`, "Compare boats"],
];

export default function Nav() {
  const pathname = usePathname();
  const inRegion = isRegionPath(pathname);
  const region = activeRegionFromPath(pathname);

  // Cover-level pages (/, /about) get the light-blue wave treatment; region
  // pages keep the existing deep-teal "in a destination" look.
  const bg = inRegion ? COLORS.sea : COLORS.skyDeep;
  const brandColor = inRegion ? COLORS.sand : "white";
  const mutedColor = inRegion ? COLORS.foam : "#EAF7FC";

  return (
    <header style={{ background: bg, padding: "14px 24px" }} className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" stroke={brandColor} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M5 14l1.5-7.5L15 8l-2 6" stroke={COLORS.coral} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 20, color: brandColor, letterSpacing: 1 }}>
            ISLANDBOUNCE
          </span>
        </Link>
        {inRegion && region && (
          <>
            <span style={{ color: COLORS.foamLine, opacity: 0.5, fontSize: 16 }}>/</span>
            <Link
              href={`/${region.slug}`}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.brass, letterSpacing: 1, textDecoration: "none" }}
            >
              {region.name.toUpperCase()}
            </Link>
          </>
        )}
      </div>

      <nav className="flex items-center gap-1 flex-wrap justify-end">
        {!inRegion &&
          COVER_ITEMS.map(([href, label]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} style={navLinkStyle(active, mutedColor)}>
                {label}
              </Link>
            );
          })}

        {inRegion && region && (
          <>
            {regionItems(region.slug).map(([href, label]) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={navLinkStyle(active, mutedColor)}>
                  {label}
                </Link>
              );
            })}
            <span style={{ width: 1, height: 18, background: COLORS.foamLine, opacity: 0.3, margin: "0 4px" }} />
            <Link href="/" style={navLinkStyle(false, mutedColor)}>
              All destinations
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function navLinkStyle(active, mutedColor) {
  return {
    fontSize: 13,
    fontWeight: 600,
    padding: "7px 12px",
    borderRadius: 6,
    textDecoration: "none",
    background: active ? COLORS.coral : "transparent",
    color: active ? "white" : mutedColor,
  };
}
