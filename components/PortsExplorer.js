"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { PORT_PHOTOS } from "@/data/portPhotos";
import { loadGoogleMaps } from "@/components/AddressAutocomplete";
import SeaConditionsBadge from "@/components/SeaConditionsBadge";

// The All Ports page: a map with a pin for every harbour. Click a pin (or a
// photo in the strip underneath) and the map glides to it, a ring pulses, and a
// card with the photo and the port details slides in. Motion is kept light and
// switches off for visitors who ask their device to reduce motion.

const ALL = [...BALI_PORTS, ...ISLAND_PORTS];
const REGION_LABEL = { bali: "BALI", nusa: "NUSA ISLANDS", "gili-lombok": "GILIS & LOMBOK" };
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#F3ECDB" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F3ECDB" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B8A83" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#D8C9A3" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#EFE6D0" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#BFE3DD" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3E8478" }] },
];

const reduced = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Where each marker's photo bubble sits relative to its true harbour, in pixels.
// Most ports sit just above their spot like a pin. The harbours that are packed
// together (the three Gilis and Bangsal, and the south Bali cluster) are pushed
// out into open water and joined to their real position by a line.
const DEFAULT_OFFSET = { dx: 0, dy: -36 };
const OFFSETS = {
  "Gili Trawangan": { dx: -84, dy: -46 },
  "Gili Meno": { dx: -4, dy: -96 },
  "Gili Air": { dx: 74, dy: -62 },
  "Bangsal (Lombok)": { dx: 88, dy: 38 },
  "Padang Bai": { dx: 62, dy: -52 },
  Kusamba: { dx: -10, dy: -66 },
  "Nusa Lembongan": { dx: -62, dy: 38 },
  "Nusa Penida": { dx: 64, dy: 36 },
  Sanur: { dx: -30, dy: -62 },
  Serangan: { dx: -92, dy: -26 },
  "Benoa / Nusa Dua": { dx: -48, dy: 92 },
};

// A round photo marker drawn on the map. A small dot marks the real harbour, a
// line runs out to the photo bubble, and the bubble pops in when the map loads.
function makePortOverlayClass(maps) {
  return class PortOverlay extends maps.OverlayView {
    constructor(port, color, photoSrc, delayMs, onClick) {
      super();
      this.port = port;
      this.color = color;
      this.photoSrc = photoSrc;
      this.delayMs = delayMs;
      this.onClick = onClick;
      this.el = null;
      this.selected = false;
    }
    onAdd() {
      const el = document.createElement("div");
      el.className = "pp";
      el.style.setProperty("--pp-color", this.color);
      el.innerHTML =
        '<div class="pp-pulse"></div><div class="pp-line"></div><div class="pp-dot"></div>' +
        '<button type="button" class="pp-bubble" aria-label="' + this.port.name.replace(/"/g, "") + '">' +
        '<span class="pp-photo"></span><span class="pp-label"></span></button>';
      el.querySelector(".pp-label").textContent = this.port.name;
      const bubble = el.querySelector(".pp-bubble");
      bubble.style.animationDelay = this.delayMs + "ms";
      const photo = el.querySelector(".pp-photo");
      if (this.photoSrc) {
        const img = new Image();
        img.onload = () => { photo.style.backgroundImage = 'url("' + this.photoSrc + '")'; };
        img.src = this.photoSrc;
      } else {
        photo.classList.add("pp-empty");
      }
      el.addEventListener("click", (e) => { e.stopPropagation(); this.onClick(this.port.name); });
      el.addEventListener("mousedown", (e) => e.stopPropagation());
      this.el = el;
      this.getPanes().overlayMouseTarget.appendChild(el);
      this.setSelected(this.selected);
    }
    draw() {
      const proj = this.getProjection();
      if (!proj || !this.el) return;
      const pt = proj.fromLatLngToDivPixel(new maps.LatLng(this.port.lat, this.port.lng));
      if (!pt) return;
      this.el.style.left = pt.x + "px";
      this.el.style.top = pt.y + "px";
      // Close in and the harbours spread out on their own, so the lines shorten.
      const zoom = this.getMap() ? this.getMap().getZoom() || 9 : 9;
      const f = zoom >= 12 ? 0.45 : zoom >= 11 ? 0.7 : 1;
      const o = OFFSETS[this.port.name] || DEFAULT_OFFSET;
      const dx = o.dx * f, dy = o.dy * f;
      const len = Math.hypot(dx, dy);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      this.el.style.setProperty("--dx", dx + "px");
      this.el.style.setProperty("--dy", dy + "px");
      const line = this.el.querySelector(".pp-line");
      line.style.width = len + "px";
      line.style.transform = "rotate(" + ang + "deg)";
    }
    onRemove() {
      if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
      this.el = null;
    }
    setSelected(on) {
      this.selected = on;
      if (this.el) {
        this.el.classList.toggle("pp-on", on);
        this.el.style.zIndex = on ? "100" : "";
      }
    }
  };
}

function Photo({ port, className, style }) {
  const info = PORT_PHOTOS[port.name];
  const [failed, setFailed] = useState(!info);
  const ref = useRef(null);
  useEffect(() => {
    setFailed(!info);
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [info, port.name]);
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden", background: `linear-gradient(160deg, ${COLORS.sea} 0%, ${COLORS.seaDeep} 100%)`, ...style }}>
      {!failed && info && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={info.src}
          alt={info.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="pe-photo"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {failed && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", opacity: 0.75 }}>
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none"><path d="M10 30 L38 30 L33 38 L15 38 Z M24 30 L24 10 L34 16 Z" fill="white" fillOpacity="0.9" /></svg>
        </div>
      )}
    </div>
  );
}

export default function PortsExplorer() {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markers = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cardKey, setCardKey] = useState(0);

  const port = ALL.find((p) => p.name === selected) || null;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
    if (!apiKey) {
      setMapFailed(true);
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey, "places")
      .then((maps) => {
        if (cancelled || !mapRef.current || mapObj.current) return;
        const map = new maps.Map(mapRef.current, {
          styles: MAP_STYLE,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: "cooperative",
          backgroundColor: "#F3ECDB",
        });
        mapObj.current = map;
        const bounds = new maps.LatLngBounds();
        ALL.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
        map.fitBounds(bounds, { top: 140, bottom: 70, left: 90, right: 100 });

        // Photo markers pop in one after another.
        const PortOverlay = makePortOverlayClass(maps);
        ALL.forEach((p, i) => {
          const color = p.region === "bali" ? COLORS.sea : COLORS.coral;
          const info = PORT_PHOTOS[p.name];
          const ov = new PortOverlay(p, color, info ? info.src : null, reduced() ? 0 : 250 + i * 90, (name) => setSelected(name));
          ov.setMap(map);
          markers.current[p.name] = ov;
        });
        maps.event.addListener(map, "zoom_changed", () => {
          Object.values(markers.current).forEach((ov) => ov.draw());
        });
        setLoaded(true);
      })
      .catch(() => setMapFailed(true));
    return () => {
      cancelled = true;
      Object.values(markers.current).forEach((ov) => ov.setMap(null));
      markers.current = {};
    };
  }, []);

  // When a port is chosen: highlight its marker and glide the map to it.
  useEffect(() => {
    if (!loaded || !mapObj.current) return;
    Object.entries(markers.current).forEach(([name, ov]) => ov.setSelected(name === selected));
    if (!port) return;
    const map = mapObj.current;
    map.panTo({ lat: port.lat, lng: port.lng });
    if ((map.getZoom() || 0) < 10) setTimeout(() => map.setZoom(10), reduced() ? 0 : 350);
  }, [selected, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  function choose(name) {
    setSelected(name);
  }
  function close() {
    setSelected(null);
    const maps = window.google && window.google.maps;
    if (maps && mapObj.current) {
      const bounds = new maps.LatLngBounds();
      ALL.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      mapObj.current.fitBounds(bounds, { top: 140, bottom: 70, left: 90, right: 100 });
    }
  }

  // Marker clicks set `selected` directly; keep the card animation key in step.
  useEffect(() => {
    if (selected) setCardKey((k) => k + 1);
  }, [selected]);

  const card = port && (
    <div key={cardKey} className="pe-card" style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(6,47,44,0.28)", border: `1px solid ${COLORS.foamLine}` }}>
      <div style={{ position: "relative" }}>
        <Photo port={port} style={{ height: 170 }} />
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.92)", color: COLORS.sea, fontSize: 18, lineHeight: 1, cursor: "pointer" }}
        >
          ×
        </button>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,47,44,0) 55%, rgba(6,47,44,0.6) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: 14, bottom: 10, color: "white", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          {REGION_LABEL[port.region] || ""}
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 className="pe-rise" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.sea, marginBottom: 6, animationDelay: "120ms" }}>{port.name}</h3>
        <p className="pe-rise" style={{ fontSize: 13, lineHeight: 1.55, color: COLORS.ink, opacity: 0.8, marginBottom: 10, animationDelay: "180ms" }}>{port.blurb}</p>
        <div className="pe-rise" style={{ fontSize: 12, color: COLORS.ink, opacity: 0.7, marginBottom: 4, animationDelay: "240ms" }}>
          <strong>Connects to:</strong> {port.connects}
        </div>
        <div className="pe-rise" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.brass, marginBottom: 10, animationDelay: "280ms" }}>{port.frequency}</div>
        <div className="pe-rise" style={{ marginBottom: 12, animationDelay: "320ms" }}>
          <SeaConditionsBadge lat={port.lat} lng={port.lng} />
        </div>
        <Link
          href="/indonesia#trip-planner"
          className="pe-rise"
          style={{ display: "inline-block", fontSize: 13, fontWeight: 700, color: "white", background: COLORS.coral, padding: "9px 16px", borderRadius: 999, textDecoration: "none", animationDelay: "360ms" }}
        >
          Plan a route from here →
        </Link>
      </div>
    </div>
  );

  const rail = (
    <div className="pe-rail" role="list" aria-label="All ports">
      {ALL.map((p) => {
        const on = p.name === selected;
        return (
          <button
            key={p.name}
            type="button"
            role="listitem"
            onClick={() => choose(p.name)}
            className="pe-tile"
            aria-pressed={on}
            style={{ outline: on ? `3px solid ${COLORS.coral}` : "3px solid transparent" }}
          >
            <Photo port={p} style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,47,44,0) 45%, rgba(6,47,44,0.78) 100%)" }} />
            <span style={{ position: "absolute", left: 10, bottom: 8, right: 8, color: "white", fontWeight: 700, fontSize: 13, textAlign: "left", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{p.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <style>{`
        .pp{position:absolute;width:0;height:0}
        .pp-dot{position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:var(--pp-color);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);box-sizing:content-box;margin:-2px 0 0 -2px}
        .pp-line{position:absolute;left:0;top:-1px;height:2px;background:var(--pp-color);transform-origin:0 50%;opacity:.85;border-radius:2px}
        .pp-pulse{position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;border:2px solid #FF6B4D;opacity:0;pointer-events:none}
        .pp-on .pp-pulse{animation:ppPulse 1.8s ease-out infinite}
        .pp-bubble{position:absolute;left:0;top:0;width:50px;height:50px;margin:-25px 0 0 -25px;transform:translate(var(--dx),var(--dy)) scale(1);padding:0;border:none;background:none;cursor:pointer;border-radius:50%;animation:ppPop .5s cubic-bezier(.2,1.4,.4,1) backwards;transition:transform .25s cubic-bezier(.2,1.2,.4,1)}
        .pp-photo{display:block;width:100%;height:100%;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--pp-color),0 4px 12px rgba(0,0,0,.35);background:var(--pp-color) center/cover no-repeat;box-sizing:border-box}
        .pp-empty{background:linear-gradient(160deg,#0B4F4A,#062F2C)}
        .pp-label{position:absolute;left:50%;top:100%;transform:translate(-50%,6px);white-space:nowrap;background:#fff;color:#0B4F4A;font:700 11px 'Inter',sans-serif;padding:3px 8px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);pointer-events:none;transition:background .2s,color .2s}
        .pp-bubble:hover{transform:translate(var(--dx),var(--dy)) scale(1.14)}
        .pp-on .pp-label{background:#FF6B4D;color:#fff}
        .pp-on .pp-bubble{transform:translate(var(--dx),var(--dy)) scale(1.28)}
        .pp-on .pp-photo{box-shadow:0 0 0 3px #FF6B4D,0 6px 16px rgba(0,0,0,.4)}
        .pp-on .pp-line{background:#FF6B4D}
        .pp-on .pp-dot{background:#FF6B4D}
        @keyframes ppPop{from{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}to{opacity:1;transform:translate(var(--dx),var(--dy)) scale(1)}}
        @keyframes ppPulse{0%{opacity:.8;transform:scale(.6)}100%{opacity:0;transform:scale(3.2)}}
        @media(prefers-reduced-motion:reduce){.pp-bubble{animation:none;transition:none}.pp-on .pp-pulse{animation:none;opacity:.5}}
        .pe-card{animation:peSlide .45s cubic-bezier(.2,.8,.2,1) both}
        .pe-rise{animation:peRise .5s ease both}
        .pe-card .pe-photo{animation:peZoom 1.6s ease-out both}
        .pe-tile{position:relative;flex:0 0 150px;height:104px;border-radius:12px;overflow:hidden;border:none;padding:0;cursor:pointer;transition:transform .2s ease, outline-color .2s ease}
        .pe-tile:hover{transform:translateY(-3px)}
        .pe-tile .pe-photo{transition:transform .5s ease}
        .pe-tile:hover .pe-photo{transform:scale(1.07)}
        .pe-rail{display:flex;gap:10px;overflow-x:auto;padding:14px 4px 6px;scroll-snap-type:x proximity}
        .pe-tile{scroll-snap-align:start}
        .pe-overlay{position:absolute;z-index:20;left:12px;right:12px;bottom:12px}
        @media(min-width:900px){.pe-overlay{left:auto;top:14px;bottom:14px;width:350px;right:14px;overflow-y:auto}}
        @keyframes peSlide{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @media(min-width:900px){@keyframes peSlide{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:none}}}
        @keyframes peRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes peZoom{from{transform:scale(1.12)}to{transform:scale(1)}}
        @media(prefers-reduced-motion:reduce){.pe-card,.pe-rise,.pe-card .pe-photo{animation:none}.pe-tile,.pe-tile .pe-photo{transition:none}}
      `}</style>

      {!mapFailed && (
        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `1px solid ${COLORS.foamLine}` }}>
          <div ref={mapRef} className="h-[420px] sm:h-[520px]" style={{ width: "100%", background: "#F3ECDB" }} />
          {!loaded && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.sea, opacity: 0.7, fontSize: 13 }}>Loading map…</div>
          )}
          {!port && loaded && (
            <div style={{ position: "absolute", left: 14, top: 14, background: "rgba(255,255,255,0.94)", color: COLORS.sea, fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 999, border: `1px solid ${COLORS.foamLine}` }}>
              Tap a photo to explore a port
            </div>
          )}
          {port && <div className="pe-overlay">{card}</div>}
        </div>
      )}

      {rail}

      {mapFailed && port && <div style={{ maxWidth: 420, margin: "14px auto 0" }}>{card}</div>}
    </div>
  );
}
