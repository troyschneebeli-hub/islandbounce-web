"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { isRegionPath, activeRegionFromPath } from "@/data/regions";

const COVER_ITEMS = [
  ["/", "Home"],
  ["/about", "Why IslandBounce"],
];

const regionItems = (slug) => [
  [`/${slug}/book`, "Book"],
  [`/${slug}/split-charter`, "Split Charters"],
  [`/${slug}/ports`, "All Ports"],
];

export default function Nav() {
  const pathname = usePathname();
  const inRegion = isRegionPath(pathname);
  const region = activeRegionFromPath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cover-level pages (/, /about) get the light-blue wave treatment; region
  // pages keep the existing deep-teal "in a destination" look.
  const bg = inRegion ? COLORS.sea : COLORS.skyDeep;
  const brandColor = inRegion ? COLORS.sand : "white";
  const mutedColor = inRegion ? COLORS.foam : "#EAF7FC";
  const items = inRegion && region ? regionItems(region.slug) : COVER_ITEMS;

  return (
    <header style={{ background: bg, position: "relative" }}>
      <div className="flex items-center justify-between" style={{ padding: "14px 24px" }}>
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="IslandBounce home" className="flex items-center" style={{ textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
            {/* Light-coloured version of the logo: the standard one has a dark green wordmark
                that would disappear against this dark header. Trimmed of empty margins so it
                stays readable at header size. unoptimized: it's a small static PNG, no need
                for Next to resize it. */}
            <Image
              src="/images/logo-light.png"
              alt="IslandBounce"
              width={1010}
              height={148}
              priority
              unoptimized
              className="h-[28px] sm:h-[34px] w-auto"
            />
          </Link>
          {inRegion && region && (
            <>
              <span style={{ color: COLORS.foamLine, opacity: 0.5, fontSize: 16 }}>/</span>
              <Link
                href={`/${region.slug}`}
                onClick={() => setMenuOpen(false)}
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.brass, letterSpacing: 1, textDecoration: "none" }}
              >
                {region.name.toUpperCase()}
              </Link>
            </>
          )}
        </div>

        {/* Desktop nav — hidden below the md breakpoint */}
        <nav className="hidden md:flex items-center gap-1 flex-wrap justify-end">
          {items.map(([href, label]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} style={navLinkStyle(active, mutedColor)}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Hamburger button — only shown below the md breakpoint */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden"
          style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 6L18 18M6 18L18 6" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 7H20" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
                <path d="M4 12H20" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17H20" stroke={brandColor} strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu — stacked links, only rendered when open, only on small screens */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col" style={{ padding: "4px 16px 16px", gap: 4 }}>
          {items.map(([href, label]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ ...navLinkStyle(active, mutedColor), textAlign: "left", padding: "12px 14px", fontSize: 15 }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
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
