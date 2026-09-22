"use client";

import { useState } from "react";
import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { PLANNER_DESTINATIONS, CHECKIN_BUFFER_MIN, fmtMins } from "@/data/planner";
import { buildTransportLink } from "@/lib/affiliateLinks";

export default function RouteFinderPage() {
  const [address, setAddress] = useState("");
  const [destination, setDestination] = useState(PLANNER_DESTINATIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function handleFind() {
    if (!address.trim()) {
      setError("Enter your current address or hotel name first.");
      return;
    }
    setError("");
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/route-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, destination }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong looking that up.");
      } else {
        setData(json);
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6 }}>
        Where are you, where are you headed?
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 24, maxWidth: 560 }}>
        Real driving times from Google Maps to every exit port, paired with the boat crossing on to your destination
        — one search instead of two.
      </p>

      <label className="block" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.sea, letterSpacing: 1, marginBottom: 14 }}>
        CURRENT ADDRESS OR HOTEL NAME
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFind()}
          placeholder="e.g. Jl. Pantai Berawa No.5, Canggu"
          className="mt-1 w-full"
          style={{ padding: "10px 10px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontFamily: "'Inter', sans-serif", fontSize: 14 }}
        />
      </label>

      <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 4 }}>
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
            disabled={loading}
            style={{
              background: COLORS.coral,
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              padding: "11px 22px",
              borderRadius: 6,
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Finding…" : "Find my route"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FDEDEA", border: `1px solid ${COLORS.coralDeep}`, color: COLORS.coralDeep, borderRadius: 8, padding: 12, fontSize: 13, marginTop: 12 }}>
          {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 12, opacity: 0.55, marginBottom: 14 }}>
            From <strong>{data.resolvedAddress}</strong> to <strong>{data.destination}</strong> — every exit port, fastest first:
          </p>
          <div className="flex flex-col gap-2">
            {data.results.map((r, i) => (
              <div
                key={r.port}
                style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: 16, position: "relative" }}
              >
                {i === 0 && r.status === "OK" && (
                  <div style={{ position: "absolute", top: -10, left: 14, background: COLORS.coral, color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, letterSpacing: 0.5 }}>
                    FASTEST OVERALL
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: r.status === "OK" ? 10 : 0 }}>{r.port}</div>

                {r.status !== "OK" ? (
                  <div style={{ fontSize: 12, color: COLORS.coralDeep }}>No driving route found to this port.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, opacity: 0.55, letterSpacing: 1 }}>BY CAR</div>
                        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.ink }}>{r.driveText}</div>
                        <div style={{ fontSize: 11, opacity: 0.5 }}>{r.distanceText}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, opacity: 0.55, letterSpacing: 1 }}>BY SCOOTER (EST.)</div>
                        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.ink }}>{fmtMins(r.scooterMin)}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, opacity: 0.55, letterSpacing: 1 }}>BOAT CROSSING</div>
                        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.coral }}>{fmtMins(r.fastestBoat.boatMin)}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.6, marginTop: 10 }}>
                      Fastest boat: {r.fastestBoat.operator}, departs {r.fastestBoat.depart}, from ${r.fastestBoat.price} ·
                      total door-to-arrival ~{fmtMins(r.totalMin)} (includes {CHECKIN_BUFFER_MIN}m check-in buffer)
                    </div>
                    <a
                      href={buildTransportLink(r.port, data.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 700, color: "white", background: COLORS.sea, padding: "6px 12px", borderRadius: 6, textDecoration: "none" }}
                    >
                      Compare {r.port} boats on 12Go →
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, opacity: 0.5, marginTop: 12 }}>
            Car times are live from Google Maps. Scooter times are estimated at ~75% of car drive time (a common
            lane-splitting-through-traffic heuristic) — verify locally, especially at night or in rain. Boat
            departures, operators, and fares are estimated schedules for planning purposes — verify before booking.
          </p>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/indonesia/planner" style={{ fontSize: 12.5, color: COLORS.sea, fontWeight: 600 }}>
          Prefer to pick a general area instead of typing an address? Use the original Trip Planner →
        </Link>
      </div>
    </div>
  );
}
