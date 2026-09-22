"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { buildTransportLink } from "@/lib/affiliateLinks";
import { ORIGINS, DESTS, genTrips } from "@/data/planner";

export default function ComparePage() {
  const [from, setFrom] = useState(ORIGINS[0]);
  const [to, setTo] = useState(DESTS[0]);
  const [trips, setTrips] = useState(null);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 16 }}>
        Compare boats
      </h1>
      <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: 20 }}>
        <select value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: 10, borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, flex: 1 }}>
          {ORIGINS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: 10, borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, flex: 1 }}>
          {DESTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={() => setTrips(genTrips(from, to))}
          style={{ background: COLORS.coral, color: "white", fontWeight: 700, padding: "10px 20px", borderRadius: 6, border: "none", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {trips && (
        <div className="flex flex-col gap-2">
          {trips.map((t) => (
            <div key={t.id} className="flex items-center justify-between" style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 8, padding: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.operator}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, opacity: 0.6 }}>{t.depart}</div>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ fontWeight: 700 }}>${t.price}</div>
                <a
                  href={buildTransportLink(from, to)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: COLORS.sea, color: "white", fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 6, textDecoration: "none" }}
                >
                  Book on 12Go →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
