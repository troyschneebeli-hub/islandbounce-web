"use client";

import { useState } from "react";
import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { COUNTRY_ART, COUNTRY_BG } from "@/components/CountryArt";

export default function RegionCard({ region }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = region.photo && !imgFailed;
  const active = region.status === "active";
  const Art = COUNTRY_ART[region.name];

  const card = (
    <div
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        aspectRatio: "16 / 9",
        opacity: active ? 1 : 0.6,
        filter: active ? "none" : "grayscale(0.5)",
      }}
    >
      {showPhoto ? (
        // Real, licensed photo — drop one at public/images/regions/<slug>.jpg
        // and it takes over from the flag automatically.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={region.photo}
          alt=""
          onError={() => setImgFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: COUNTRY_BG[region.name] || "#EEE" }}>
          {Art && <Art />}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,47,44,0) 55%, rgba(6,47,44,0.82) 100%)" }} />

      {!active && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: 1,
            color: "white",
            background: "rgba(0,0,0,0.4)",
            padding: "3px 8px",
            borderRadius: 999,
          }}
        >
          COMING SOON
        </div>
      )}

      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{region.name}</div>
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{region.tagline}</div>
        {active && (
          <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.sand, marginTop: 4 }}>Explore →</div>
        )}
      </div>
    </div>
  );

  return active ? (
    <Link href={`/${region.slug}`} style={{ display: "block", textDecoration: "none" }}>
      {card}
    </Link>
  ) : (
    <div>{card}</div>
  );
}
