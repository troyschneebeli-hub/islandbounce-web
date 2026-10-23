"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { PLANNER_DESTINATIONS } from "@/data/planner";
import { bookingLink } from "@/lib/bookingLink";
import { TWELVEGO_WHITELABEL_URL } from "@/lib/twelveGoWidget";

// A real, working search using the site's own port data, in both directions
// (Bali -> islands and back, and island to island). Deep-links to our own
// white-label booking site (or 12Go directly if that's switched off) with the
// route, dates and travellers filled in.
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const BALI = BALI_PORTS.map((p) => p.name);
const ISLANDS = ISLAND_PORTS.map((p) => p.name);
// Boats don't run between two Bali ports, so a Bali start only offers the islands.
const destinationsFor = (from) => (BALI.includes(from) ? ISLANDS : [...BALI, ...ISLANDS.filter((p) => p !== from)]);

/** @param {{ initialTo?: string }} [props] */
export default function TwelveGoBookingWidget({ initialTo } = {}) {
  const [from, setFrom] = useState(BALI[0]);
  const [to, setTo] = useState(PLANNER_DESTINATIONS.includes(initialTo) ? initialTo : PLANNER_DESTINATIONS[0]);
  const [date, setDate] = useState("");
  const [returnTrip, setReturnTrip] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [travellers, setTravellers] = useState(1);

  const options = destinationsFor(from);
  const pickFrom = (next) => {
    setFrom(next);
    if (!destinationsFor(next).includes(to)) setTo(destinationsFor(next)[0]);
  };
  const swap = () => {
    setFrom(to);
    setTo(destinationsFor(to).includes(from) ? from : destinationsFor(to)[0]);
  };

  const inputStyle = {
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${COLORS.foamLine}`,
    background: "white",
    color: COLORS.ink,
    fontSize: 14,
    width: "100%",
  };
  const labelStyle = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 };

  const href = bookingLink(from, to, date, returnTrip && date ? returnDate : undefined, travellers);
  const isOwnDomain = Boolean(TWELVEGO_WHITELABEL_URL);

  return (
    <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: 24 }}>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3" style={{ marginBottom: 14 }}>
        <label className="flex-1" style={labelStyle}>
          FROM
          <select value={from} onChange={(e) => pickFrom(e.target.value)} className="mt-1 w-full" style={inputStyle}>
            <optgroup label="Bali">
              {BALI.map((p) => <option key={p}>{p}</option>)}
            </optgroup>
            <optgroup label="Islands and Lombok">
              {ISLANDS.map((p) => <option key={p}>{p}</option>)}
            </optgroup>
          </select>
        </label>
        <button
          type="button"
          onClick={swap}
          aria-label="Swap from and to"
          title="Swap from and to"
          style={{ alignSelf: "center", border: `1px solid ${COLORS.foamLine}`, background: COLORS.foam, color: COLORS.sea, borderRadius: 999, width: 36, height: 36, fontSize: 16, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
        >
          ⇄
        </button>
        <label className="flex-1" style={labelStyle}>
          TO
          <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full" style={inputStyle}>
            {options.some((p) => BALI.includes(p)) && (
              <optgroup label="Bali">
                {options.filter((p) => BALI.includes(p)).map((p) => <option key={p}>{p}</option>)}
              </optgroup>
            )}
            <optgroup label="Islands and Lombok">
              {options.filter((p) => ISLANDS.includes(p)).map((p) => <option key={p}>{p}</option>)}
            </optgroup>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Trip type" style={{ marginBottom: 12 }}>
        {[["One way", false], ["Return", true]].map(([label, value]) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={returnTrip === value}
            onClick={() => setReturnTrip(value)}
            style={{
              border: `1px solid ${returnTrip === value ? COLORS.sea : COLORS.foamLine}`,
              background: returnTrip === value ? COLORS.sea : "white",
              color: returnTrip === value ? "white" : COLORS.sea,
              borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ marginBottom: 14 }}>
        <label style={labelStyle}>
          {returnTrip ? "DEPART" : "DATE (OPTIONAL)"}
          <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full" style={inputStyle} />
        </label>
        {returnTrip && (
          <label style={labelStyle}>
            RETURN
            <input
              type="date"
              value={returnDate}
              min={date || todayISO()}
              disabled={!date}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-1 w-full"
              style={{ ...inputStyle, opacity: date ? 1 : 0.5 }}
            />
          </label>
        )}
        <label style={labelStyle}>
          TRAVELLERS
          <select value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="mt-1 w-full" style={inputStyle}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n === 1 ? "1 traveller" : `${n} travellers`}</option>
            ))}
          </select>
        </label>
      </div>
      {returnTrip && !date && (
        <p style={{ fontSize: 12, color: COLORS.ink, opacity: 0.65, marginTop: -6, marginBottom: 12 }}>Pick your departure date first, then the return.</p>
      )}

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
          ? "We're a comparison site, not the operator. This opens our booking site (run with our partner 12Go) to complete your booking."
          : "We're a comparison site, not the operator. This opens 12Go in a new tab to complete your booking."}
      </p>
    </div>
  );
}
