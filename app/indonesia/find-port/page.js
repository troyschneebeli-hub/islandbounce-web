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

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6 }}>
        Find My Port
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 20, maxWidth: 620 }}>
        Type where you&apos;re staying, pick where you&apos;re headed, and watch real driving routes draw themselves
        to every port that gets you there. Hover a port card to isolate its route on the map.
      </p>

      <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div className="flex flex-col sm:flex-row gap-3">
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
                style={{ padding: "10px 10px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontFamily: "'Inter', sans-serif", fontSize: 14, width: "100%" }}
              />
            </div>
          </label>

          <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
            GOAL DESTINATION
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 w-full"
              style={{ padding: "10px 8px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontFamily: "'Inter', sans-serif", fontSize: 14 }}
            >
              {PLANNER_DESTINATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleFind}
              style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 6, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Find my route
            </button>
          </div>
        </div>
        {error && <div style={{ fontSize: 12, color: COLORS.coralDeep, marginTop: 10 }}>{error}</div>}
      </div>

      <FindPortMap origin={origin} destination={activeDestination} />

      <p style={{ fontSize: 11, opacity: 0.5, marginTop: 16 }}>
        Car routes and times are live from Google Maps. Scooter times are estimated at ~75% of car drive time —
        verify locally, especially at night or in rain. Boat departures, operators, and fares are estimated
        schedules for planning purposes — verify before booking.
      </p>
    </div>
  );
}
