"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { buildTransportLink } from "@/lib/affiliateLinks";
import { VILLA_AREAS, PLANNER_DESTINATIONS, CHECKIN_BUFFER_MIN, fmtMins, planTrips } from "@/data/planner";

export default function TripPlannerPage() {
  const [address, setAddress] = useState("");
  const [villaArea, setVillaArea] = useState(VILLA_AREAS[0]);
  const [destination, setDestination] = useState(PLANNER_DESTINATIONS[0]);
  const [results, setResults] = useState(null);

  function handlePlan() {
    setResults(planTrips(villaArea, destination));
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6 }}>
        Trip Planner
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 24, maxWidth: 560 }}>
        Tell us where you&apos;re staying and where you&apos;re headed — we&apos;ll work out every real door-to-door
        option, including the drive to the port, so you&apos;re not just comparing boat prices in isolation.
      </p>

      <label className="block" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1, marginBottom: 12 }}>
        YOUR ACCOMMODATION ADDRESS OR HOTEL NAME (optional)
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Jl. Pantai Berawa No.5, Canggu"
          className="mt-1 w-full"
          style={{ padding: "10px 10px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontFamily: "'Inter', sans-serif", fontSize: 14 }}
        />
      </label>
      <p style={{ fontSize: 11.5, opacity: 0.55, marginBottom: 18, lineHeight: 1.5 }}>
        We&apos;ll use this for your own reference on the results below. Exact drive times still come from the general
        area you pick underneath, since pinpoint address-to-port routing needs live map data this planner doesn&apos;t
        have yet.
      </p>

      <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 8 }}>
        <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          CLOSEST AREA TO YOU
          <select
            value={villaArea}
            onChange={(e) => setVillaArea(e.target.value)}
            className="mt-1 w-full"
            style={{ padding: "10px 8px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontFamily: "'Inter', sans-serif", fontSize: 14 }}
          >
            {VILLA_AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="flex-1" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1 }}>
          HEADING TO
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
            onClick={handlePlan}
            style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 6, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Plan my trip
          </button>
        </div>
      </div>

      {results && (
        <div style={{ marginTop: 24 }}>
          {address && (
            <p style={{ fontSize: 12, opacity: 0.55, marginBottom: 12 }}>
              Routes from <strong>{address}</strong> ({villaArea} area) to {destination}:
            </p>
          )}
          {results.length === 0 ? (
            <p style={{ fontSize: 13.5, opacity: 0.7 }}>
              No direct route from a Bali port to {destination} in our data yet — this route may run via a connection,
              or isn&apos;t covered here yet.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {results.map((group, gi) => (
                <div key={group.port}>
                  <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
                    <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.sea }}>
                      Via {group.port}
                    </h3>
                    <span style={{ fontSize: 12, opacity: 0.6 }}>
                      {fmtMins(group.driveMin)} drive + {CHECKIN_BUFFER_MIN}m check-in
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.boats.map((b, bi) => {
                      const isFastest = gi === 0 && bi === 0;
                      return (
                        <div key={bi} style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: 14, position: "relative" }}>
                          {isFastest && (
                            <div style={{ position: "absolute", top: -10, left: 14, background: COLORS.coral, color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, letterSpacing: 0.5 }}>
                              FASTEST
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{b.operator}</div>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, opacity: 0.7, marginTop: 2 }}>
                                Departs {b.depart} · {fmtMins(b.boatMin)} crossing
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 18, color: COLORS.sea }}>
                                {fmtMins(b.totalMin)} total
                              </div>
                              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, opacity: 0.7 }}>${b.price} fare</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={buildTransportLink(group.port, destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 700, color: "white", background: COLORS.sea, padding: "7px 14px", borderRadius: 6, textDecoration: "none" }}
                    >
                      Compare {group.port} boats on 12Go →
                    </a>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                Departure times, operators, and fares here are estimated schedules for planning purposes — verify exact
                times and prices before booking. Boat fare excludes the cost of getting to the port — figure on a
                taxi/driver on top for most areas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
