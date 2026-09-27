"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/theme";

const COMFORT_STYLE = {
  glassy: { label: "Glassy / very calm", color: "#1E7A4C" },
  calm: { label: "Calm", color: "#2E8B57" },
  "slight-chop": { label: "Slight chop", color: "#7A9A2E" },
  choppy: { label: "Choppy", color: "#B8860B" },
  rough: { label: "Rough", color: COLORS.coralDeep },
};

const RISK_STYLE = {
  low: { label: "Low risk of cancellation", color: "#2E8B57", bg: "#E7F5EC" },
  moderate: { label: "Some risk of delays/cancellation", color: "#B8860B", bg: "#FBF2DC" },
  high: { label: "High risk of cancellation", color: COLORS.coralDeep, bg: "#FCE9E4" },
};

// detailed=false (default): compact badge, used on port cards.
// detailed=true: badge plus a small breakdown of wave/swell numbers,
// used inside the Trip Planner's per-port result cards.
export default function SeaConditionsBadge({ lat, lng, detailed = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sea-conditions?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) setError(true);
        else setData(json);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (error) return null; // fail quietly — this is a nice-to-have, not core functionality
  if (!data) {
    return <div style={{ fontSize: 11, opacity: 0.5, fontStyle: "italic" }}>Checking sea conditions…</div>;
  }

  const comfort = COMFORT_STYLE[data.comfort];
  const risk = RISK_STYLE[data.cancellationRisk];

  return (
    <div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: risk.bg,
          color: risk.color,
          fontSize: 11.5,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 999,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: 999, background: risk.color, display: "inline-block" }} />
        {risk.label}
      </div>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 8, fontSize: 11.5, fontWeight: 600, color: comfort.color }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: comfort.color, display: "inline-block" }} />
        {comfort.label}
      </div>

      {detailed ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={{ marginTop: 8, fontSize: 11, color: COLORS.ink, opacity: 0.75 }}>
          <div><strong>Wave height:</strong> {data.waveHeight?.toFixed(1)}m</div>
          <div><strong>Wave period:</strong> {data.wavePeriod?.toFixed(0)}s</div>
          <div><strong>Swell height:</strong> {data.swellHeight?.toFixed(1)}m</div>
          <div><strong>Swell period:</strong> {data.swellPeriod?.toFixed(0)}s</div>
        </div>
      ) : (
        <div style={{ fontSize: 10.5, opacity: 0.55, marginTop: 3 }}>
          {data.waveHeight?.toFixed(1)}m waves · updated hourly
        </div>
      )}
      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 4, fontStyle: "italic" }}>
        An estimate based on BMKG's published fast-boat/ferry wave thresholds and general reported patterns — not a
        guarantee. The port authority and operator make the actual call on the day.
      </div>
    </div>
  );
}
