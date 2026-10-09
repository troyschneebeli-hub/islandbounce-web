"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";

// Same real-photo-with-fallback pattern as components/RegionCard.js — drop
// a real photo at the given path and it takes over automatically. Until
// then, a simple illustrated placeholder holds the spot so the strip never
// looks broken or generic. See public/images/indonesia/README.md for
// where to actually get photos you have the right to use.
const SLOTS = [
  { path: "/images/indonesia/gilis.jpg", label: "Gili Trawangan", alt: "Aerial view of a Gili island ringed by turquoise water and reef", kind: "beach" },
  { path: "/images/indonesia/gili-air.jpg", label: "Gili Air", alt: "Wide aerial view of Gili Air with its beach fringe, reef and boats offshore", kind: "beach" },
  { path: "/images/indonesia/meno.jpg", label: "Gili Meno", alt: "Aerial view of Gili Meno with its white-sand beach and salt lake", kind: "beach" },
  { path: "/images/indonesia/nusa-penida.jpg", label: "Nusa Penida", alt: "Green clifftops and sea stacks on the coast of Nusa Penida", kind: "temple" },
  { path: "/images/indonesia/lembongan.jpg", label: "Nusa Lembongan", alt: "Aerial view of the yellow bridge over the channel at Nusa Lembongan, with boats below", kind: "boat" },
  { path: "/images/indonesia/lombok.jpg", label: "Lombok", alt: "A turquoise bay with a pale sand beach and hills behind, on the Lombok coast", kind: "beach" },
];

function PlaceholderTile({ kind }) {
  const gradients = {
    temple: `linear-gradient(160deg, ${COLORS.brass} 0%, ${COLORS.coral} 100%)`,
    beach: `linear-gradient(160deg, #6FD8C7 0%, ${COLORS.sea} 100%)`,
    boat: `linear-gradient(160deg, ${COLORS.skyMid} 0%, ${COLORS.sea} 100%)`,
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: gradients[kind], display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.85">
        {kind === "temple" && (
          <>
            <path d="M24 8 L34 22 L14 22 Z" fill="white" fillOpacity="0.9" />
            <rect x="16" y="22" width="16" height="14" rx="2" fill="white" fillOpacity="0.9" />
          </>
        )}
        {kind === "beach" && (
          <path d="M8 34 C14 26 20 26 24 32 C28 26 34 26 40 34" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
        {kind === "boat" && (
          <path d="M10 30 L38 30 L33 38 L15 38 Z M24 30 L24 10 L34 16 Z" fill="white" fillOpacity="0.9" />
        )}
      </svg>
    </div>
  );
}

function PhotoTile({ slot }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = !failed;
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4 / 3", flex: 1, minWidth: 180, flexBasis: "30%" }}>
      {showPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.path}
          alt={slot.alt || slot.label}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {failed && <PlaceholderTile kind={slot.kind} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,47,44,0) 60%, rgba(6,47,44,0.55) 100%)" }} />
      <div style={{ position: "absolute", bottom: 10, left: 12, color: "white", fontWeight: 700, fontSize: 13, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
        {slot.label}
      </div>
    </div>
  );
}

export default function PhotoStrip() {
  return (
    <div className="flex flex-wrap gap-3">
      {SLOTS.map((slot) => (
        <PhotoTile key={slot.path} slot={slot} />
      ))}
    </div>
  );
}
