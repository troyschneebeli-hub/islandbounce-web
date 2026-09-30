"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { BALI_PORTS } from "@/data/ports";
import { PLANNER_DESTINATIONS } from "@/data/planner";
import { buildTransportLink } from "@/lib/affiliateLinks";
import { TWELVEGO_WHITELABEL_URL } from "@/lib/twelveGoWidget";

// A real, working search using the site's own port data. Deep-links to
// either 12Go directly, or to our own white-label subdomain once it's live
// (TWELVEGO_WHITELABEL_URL set) — same search, better destination once
// booking.islandbouncetravel.com is active.
export default function TwelveGoBookingWidget() {
  const [from, setFrom] = useState(BALI_PORTS[0].name);
  const [to, setTo] = useState(PLANNER_DESTINATIONS[0]);

  const inputStyle = {
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${COLORS.foamLine}`,
    background: "white",
    color: COLORS.ink,
    fontSize: 14,
    width: "100%",
  };

  // Once the white-label domain is live, send people to our own branded
  // subdomain instead of straight to 12Go's site — a real from/to search
  // there isn't available until we confirm 12Go's white-label URL
  // parameters, so this links to the homepage of our own subdomain for now.
  const href = TWELVEGO_WHITELABEL_URL || buildTransportLink(from, to);
  const isOwnDomain = Boolean(TWELVEGO_WHITELABEL_URL);

  return (
    <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: 24 }}>
      <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 14 }}>
        <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          FROM
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full" style={inputStyle}>
            {BALI_PORTS.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          TO
          <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full" style={inputStyle}>
            {PLANNER_DESTINATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        style={{ display: "block", textAlign: "center", background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}
      >
        Search availability →
      </a>
      <p style={{ fontSize: 11, color: COLORS.ink, opacity: 0.55, marginTop: 12, textAlign: "center" }}>
        {isOwnDomain
          ? "Opens our own booking site to complete your booking. IslandBounce may earn a commission at no extra cost to you."
          : "Opens 12Go in a new tab to complete your booking. IslandBounce may earn a commission at no extra cost to you."}
      </p>
    </div>
  );
}
