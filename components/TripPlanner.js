"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { PLANNER_DESTINATIONS } from "@/data/planner";
import { START_POINTS } from "@/lib/startPoints";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import FindPortMap from "@/components/FindPortMap";

// The Trip Planner, moved from its own page onto the Indonesia hub, directly
// under the main heading. Reads an optional ?to=<destination> from the URL so
// route pages can link here with the destination pre-selected.
//
// useSearchParams() needs a Suspense boundary in the App Router (or the
// production build fails). The fallback reserves roughly the card's height so
// the page doesn't jump when the planner appears.
export default function TripPlanner() {
  return (
    <Suspense fallback={<PlannerShell><div style={{ minHeight: 520, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.sea, opacity: 0.6, fontSize: 13 }}>Loading planner…</div></PlannerShell>}>
      <PlannerContent />
    </Suspense>
  );
}

function PlannerShell({ children }) {
  return (
    <div
      id="trip-planner"
      style={{
        background: "white",
        borderRadius: 18,
        boxShadow: "0 14px 44px rgba(6, 47, 44, 0.14)",
        padding: "24px 22px 20px",
        textAlign: "left",
      }}
    >
      {children}
    </div>
  );
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const prefillDestination = searchParams.get("to");
  const [address, setAddress] = useState("");
  const [destination, setDestination] = useState(
    PLANNER_DESTINATIONS.includes(prefillDestination) ? prefillDestination : PLANNER_DESTINATIONS[0]
  );
  const [origin, setOrigin] = useState(null); // { lat, lng, label } — only set once a real place is picked
  const [activeDestination, setActiveDestination] = useState(null); // destination actually being searched, vs the dropdown's current value
  const [date, setDate] = useState(""); // optional, "YYYY-MM-DD"
  const [leaveAt, setLeaveAt] = useState(""); // optional, "HH:MM": when they set off
  const [error, setError] = useState("");

  function handleFind() {
    if (!origin) {
      setError("Pick your address from the suggestions list — typing alone isn't enough, the map needs real coordinates.");
      return;
    }
    setError("");
    setActiveDestination(destination);
  }

  // One tap on a popular starting point fills the address and runs the search.
  function pickStart(p) {
    setAddress(p.formatted);
    setOrigin({ lat: p.lat, lng: p.lng, label: p.formatted });
    setError("");
    setActiveDestination(destination);
  }

  const inputStyle = {
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${COLORS.foamLine}`,
    background: "white",
    color: COLORS.ink,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    width: "100%",
  };

  return (
    <PlannerShell>
      <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 14 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>QUICK START</span>
        {START_POINTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => pickStart(p)}
            style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.sea, background: COLORS.foam, border: `1px solid ${COLORS.foamLine}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3" style={{ marginBottom: 20 }}>
        <label className="flex-1 sm:min-w-[220px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          YOUR ADDRESS OR HOTEL
          <div className="mt-1">
            <AddressAutocomplete
              value={address}
              onChange={(val) => {
                setAddress(val);
                setOrigin(null);
              }}
              onPlaceSelected={({ lat, lng, formattedAddress }) => setOrigin({ lat, lng, label: formattedAddress })}
              placeholder="Start typing an address…"
              style={inputStyle}
            />
          </div>
        </label>

        <label className="sm:w-[170px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          TRAVEL DATE
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full"
            style={inputStyle}
          />
        </label>

        <label className="sm:w-[140px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          I SET OFF AT
          <input type="time" value={leaveAt} onChange={(e) => setLeaveAt(e.target.value)} className="mt-1 w-full" style={inputStyle} />
        </label>

        <label className="flex-1 sm:min-w-[200px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          WHERE ARE YOU HEADED?
          <select value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-1 w-full" style={inputStyle}>
            {PLANNER_DESTINATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleFind}
            style={{
              background: COLORS.coral,
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Find my route
          </button>
        </div>
      </div>
      {error && <div style={{ fontSize: 12, color: COLORS.coralDeep, marginBottom: 14 }}>{error}</div>}

      <FindPortMap origin={origin} destination={activeDestination} date={date} leaveAt={leaveAt} />

      <p style={{ fontSize: 11, color: COLORS.ink, opacity: 0.5, marginTop: 16, maxWidth: 700 }}>
        Car routes and times are live from Google Maps. Scooter times are estimated at ~75% of car drive time —
        verify locally, especially at night or in rain. Departure times come from each operator's own published
        timetable, with the date we last checked; where a port shows "coming soon" we haven't confirmed one yet.
        If you add the time you set off, each departure is marked by whether you'd reach the port in time.
        Crossing times marked ~ are estimates. Always confirm with the operator before you travel. The Book button
        opens our booking page with your route and date filled in. IslandBounce is a comparison site, not the
        operator, and may earn a commission when you book, at no extra cost to you.
      </p>
    </PlannerShell>
  );
}
