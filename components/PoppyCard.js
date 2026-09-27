import Link from "next/link";
import { COLORS } from "@/lib/theme";

// Solid teal card with a coral CTA pill — the same two-tone combo already
// used on the Split Charter banner elsewhere on this page, so it's
// consistent with the site's own established pattern rather than a new
// invented color pairing. Genuinely pops against a white page background,
// unlike the original white-on-white version.
export default function PoppyCard({ href, eyebrow, title, blurb, width = 320 }) {
  return (
    <Link
      href={href}
      style={{
        textAlign: "left",
        background: COLORS.sea,
        borderRadius: 14,
        padding: 20,
        textDecoration: "none",
        color: "inherit",
        display: "block",
        width,
        maxWidth: "100%",
        boxShadow: "0 4px 14px rgba(11,79,74,0.22)",
      }}
    >
      {eyebrow && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brass, letterSpacing: 1, marginBottom: 4 }}>
          {eyebrow}
        </div>
      )}
      <div style={{ fontWeight: 800, fontSize: 17, color: "white", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: COLORS.foam, opacity: 0.85, lineHeight: 1.5, marginBottom: 14 }}>{blurb}</div>
      <div
        style={{
          display: "inline-block",
          background: COLORS.coral,
          color: "white",
          fontWeight: 700,
          fontSize: 13,
          padding: "8px 16px",
          borderRadius: 999,
        }}
      >
        Open →
      </div>
    </Link>
  );
}
