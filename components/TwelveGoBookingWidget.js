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
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TwelveGoBookingWidget() {
  const [from, setFrom] = useState(BALI_PORTS[0].name);
  const [to, setTo] = useState(PLANNER_DESTINATIONS[0]);
  const [date, setDate] = useState("");

  const inputStyle = {
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${COLORS.foamLine}`,
    background: "white",
    color: COLORS.ink,
    fontSize: 14,
    width: "100%",
  };

  // Once the white-label domain is live (TWELVEGO_WHITELABEL_URL set),
  // build the SAME route+date link but pointed at our own subdomain
  // instead of 12go.asia — the actual search selections now carry through
  // either way, not just when using the plain 12Go link. Whether the
  // white-label domain honors this exact URL shape is unverified (see the
  // comment on buildTransportLink) — needs a real test once the
  // certificate issue is resolved.
  const href = TWELVEGO_WHITELABEL_URL
    ? buildTransportLink(from, to, date || undefined, TWELVEGO_WHITELABEL_URL)
    : buildTransportLink(from, to, date || undefined);
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
        <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          DATE (OPTIONAL)
          <input
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full"
            style={inputStyle}
          />
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
          ? "We're a comparison site, not the operator — this opens our own booking site to complete your booking. IslandBounce may earn a commission at no extra cost to you."
          : "We're a comparison site, not the operator — this opens 12Go in a new tab to complete your booking. IslandBounce may earn a commission at no extra cost to you."}
      </p>
    </div>
  );
}
