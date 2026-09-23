"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { PLANNER_DESTINATIONS } from "@/data/planner";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import FindPortMap from "@/components/FindPortMap";

export default function FindPortPage() {
  const [address, setAddress] = useState("");
  const [destination, setDestination] = useState(PLANNER_DESTINATIONS[0]);
  const [origin, setOrigin] = useState(null); // { lat, lng, label } — only set once a real place is picked
  const [activeDestination, setActiveDestination] = useState(null); // destination actually being searched, vs the dropdown's current value
  const [error, setError] = useState("");

  function handleFind() {
    if (!origin) {
      setError("Pick your address from the suggestions list — typing alone isn't enough, the map needs real coordinates.");
      return;
    }
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
    // Full-bleed: still breaks out of the site's normal centered layout to
    // span the entire browser width, edge to edge — now in the site's own
    // light sand/foam palette instead of the earlier dark/neon treatment.
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen" style={{ background: COLORS.foam }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px 60px" }}>
        <h1
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontWeight: 800,
            fontSize: 32,
            color: COLORS.sea,
            marginBottom: 6,
          }}
        >
          Trip Planner
        </h1>
        <p style={{ fontSize: 13.5, color: COLORS.ink, opacity: 0.65, marginBottom: 24, maxWidth: 620 }}>
          Type where you&apos;re staying, pick where you&apos;re headed, and watch real driving routes draw
          themselves to every port that gets you there. Hover a port card to isolate its route — and its boat
          crossing — on the map.
        </p>

        <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 24 }}>
          <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
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

          <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
            GOAL DESTINATION
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
        {error && <div style={{ fontSize: 12, color: COLORS.coralDeep, marginBottom: 16 }}>{error}</div>}

        <FindPortMap origin={origin} destination={activeDestination} />

        <p style={{ fontSize: 11, color: COLORS.ink, opacity: 0.5, marginTop: 20, maxWidth: 700 }}>
          Car routes and times are live from Google Maps. Scooter times are estimated at ~75% of car drive time —
          verify locally, especially at night or in rain. Boat departures, operators, and fares are estimated
          schedules for planning purposes — verify before booking.
        </p>
      </div>
    </div>
  );
}
