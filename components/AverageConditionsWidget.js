"use client";

import { useEffect, useState } from "react";
import { BALI_PORTS } from "@/data/ports";
import { COLORS } from "@/lib/theme";

const COMFORT_STYLE = {
  glassy: { label: "Glassy / very calm", color: "#1E7A4C" },
  calm: { label: "Calm", color: "#2E8B57" },
  "slight-chop": { label: "Slight chop", color: "#7A9A2E" },
  choppy: { label: "Choppy", color: "#B8860B" },
  rough: { label: "Rough", color: COLORS.coralDeep },
};

// Fetches sea conditions for all 5 Bali departure ports in parallel and
// averages the wave heights into one overall read — a quick "how's it
// looking today, generally" signal, not a substitute for checking the
// specific port you're actually using (that's what the detailed per-port
// version in the Trip Planner results is for). Cancellation-risk thresholds
// are grounded in BMKG's published fast-boat/ferry wave thresholds — see
// app/api/sea-conditions/route.js for the sourcing note.
export default function AverageConditionsWidget() {
  const [avgWaveHeight, setAvgWaveHeight] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      BALI_PORTS.map((p) =>
        fetch(`/api/sea-conditions?lat=${p.lat}&lng=${p.lng}`)
          .then((res) => res.json())
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      const valid = results.filter((r) => r && !r.error && typeof r.waveHeight === "number");
      if (valid.length === 0) {
        setError(true);
        return;
      }
      const avg = valid.reduce((sum, r) => sum + r.waveHeight, 0) / valid.length;
      setAvgWaveHeight(avg);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return null;

  let comfort = "glassy";
  let elevatedRisk = false;
  if (avgWaveHeight != null) {
    if (avgWaveHeight >= 2.5) comfort = "rough";
    else if (avgWaveHeight >= 1.5) comfort = "choppy";
    else if (avgWaveHeight >= 1.0) comfort = "slight-chop";
    else if (avgWaveHeight >= 0.5) comfort = "calm";
    elevatedRisk = avgWaveHeight >= 2.5;
  }
  const style = COMFORT_STYLE[comfort];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.6)",
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: 12,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: style.color, display: "inline-block", flexShrink: 0 }} />
      {avgWaveHeight == null ? (
        <span style={{ color: COLORS.seaDeep, opacity: 0.7 }}>Checking today&apos;s sea conditions…</span>
      ) : (
        <span style={{ color: COLORS.seaDeep }}>
          Today across Bali&apos;s ports: <strong>{style.label}</strong> (avg {avgWaveHeight.toFixed(1)}m)
          {elevatedRisk && <span style={{ color: COLORS.coralDeep, fontWeight: 700 }}> · some routes may be delayed</span>}
        </span>
      )}
    </div>
  );
}
