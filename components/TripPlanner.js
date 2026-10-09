"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { PLANNER_DESTINATIONS, destinationsFor } from "@/data/planner";
import { originRegion } from "@/lib/originRegion";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import FindPortMap from "@/components/FindPortMap";

// The Trip Planner, moved from its own page onto the Indonesia hub, directly
// under the main heading. Reads an optional ?to=<destination> from the URL so
// route pages can link here with the destination pre-selected.
//
// useSearchParams() needs a Suspense boundary in the App Router (or the
// production build fails). The fallback reserves roughly the card's height so
// the page doesn't jump when the planner appears.
// Planner colours. "sea" is the site's deep teal (the same as the header), with
// sand text and a coral button; "sand" is a lighter alternative. To switch,
// change PLANNER_THEME. Everything inside the white cards keeps its own colours.
const THEMES = {
  sea: {
    bg: COLORS.sea, label: COLORS.sand, muted: "rgba(240, 231, 211, 0.72)", error: "#FFB8A8",
    chipBg: "rgba(240, 231, 211, 0.10)", chipBorder: "rgba(240, 231, 211, 0.32)", chipText: COLORS.sand,
    fieldBorder: "transparent", shadow: "0 14px 44px rgba(6, 47, 44, 0.38)",
  },
  sand: {
    bg: COLORS.sand, label: COLORS.sea, muted: "rgba(14, 42, 41, 0.6)", error: COLORS.coralDeep,
    chipBg: "white", chipBorder: COLORS.foamLine, chipText: COLORS.sea,
    fieldBorder: COLORS.foamLine, shadow: "0 14px 44px rgba(6, 47, 44, 0.14)",
  },
};
const PLANNER_THEME = "sea";
const T = THEMES[PLANNER_THEME];

export default function TripPlanner() {
  return (
    <Suspense fallback={<PlannerShell><div style={{ minHeight: 520, display: "flex", alignItems: "center", justifyContent: "center", color: T.label, opacity: 0.8, fontSize: 13 }}>Loading planner…</div></PlannerShell>}>
      <PlannerContent />
    </Suspense>
  );
}

function PlannerShell({ children }) {
  return (
    <div
      id="trip-planner"
      style={{
        background: T.bg,
        borderRadius: 18,
        boxShadow: T.shadow,
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
  const [travellers, setTravellers] = useState(2);
  const [isReturn, setIsReturn] = useState(false);
  const [returnDate, setReturnDate] = useState(""); // "YYYY-MM-DD", only used when isReturn
  const [error, setError] = useState("");

  // The destination list depends on where you start: from a Gili the boats go
  // back to Bali or across to the Nusas.
  const region = originRegion(origin);
  const destinationOptions = destinationsFor(region);
  const shownDestination = destinationOptions.includes(destination) ? destination : destinationOptions[0];
  const todayStr = new Date().toISOString().slice(0, 10);

  function handleFind() {
    if (!origin) {
      setError("Pick your address from the suggestions list — typing alone isn't enough, the map needs real coordinates.");
      return;
    }
    if (isReturn && (!date || !returnDate)) {
      setError("For a return trip, pick both your travel date and your return date, or switch Trip to One way.");
      return;
    }
    if (isReturn && returnDate < date) {
      setError("Your return date is before your travel date. Check the dates.");
      return;
    }
    setError("");
    setDestination(shownDestination);
    setActiveDestination(shownDestination);
  }

  const inputStyle = {
    padding: "11px 12px",
    borderRadius: 8,
    border: `1px solid ${T.fieldBorder}`,
    background: "white",
    color: COLORS.ink,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    width: "100%",
  };

  return (
    <PlannerShell>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3" style={{ marginBottom: 20 }}>
        <label className="flex-1 sm:min-w-[220px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.label, letterSpacing: 1 }}>
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

        <label className="sm:w-[170px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.label, letterSpacing: 1 }}>
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

        <label className="sm:w-[130px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.label, letterSpacing: 1 }}>
          TRIP
          <select value={isReturn ? "return" : "oneway"} onChange={(e) => setIsReturn(e.target.value === "return")} className="mt-1 w-full" style={inputStyle}>
            <option value="oneway">One way</option>
            <option value="return">Return</option>
          </select>
        </label>

        {isReturn && (
          <label className="sm:w-[170px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.label, letterSpacing: 1 }}>
            RETURN DATE
            <input
              type="date"
              value={returnDate}
              min={date || todayStr}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-1 w-full"
              style={inputStyle}
            />
          </label>
        )}

        <label className="sm:w-[120px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.label, letterSpacing: 1 }}>
          TRAVELLERS
          <select value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="mt-1 w-full" style={inputStyle}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="flex-1 sm:min-w-[200px]" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.label, letterSpacing: 1 }}>
          WHERE ARE YOU HEADED?
          <select value={shownDestination} onChange={(e) => setDestination(e.target.value)} className="mt-1 w-full" style={inputStyle}>
            {destinationOptions.map((d) => (
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
      {error && <div style={{ fontSize: 12, color: T.error, marginBottom: 14 }}>{error}</div>}

      <FindPortMap origin={origin} destination={activeDestination} date={date} returnDate={isReturn ? returnDate : ""} travellers={travellers} />

      <p style={{ fontSize: 11, color: T.muted, marginTop: 14, maxWidth: 700 }}>
        All check-ins are 1 hour before departure. Scooter times are estimates, so confirm before you travel.
      </p>
    </PlannerShell>
  );
}
