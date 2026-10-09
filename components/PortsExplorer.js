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

// Teardrop pin as an inline SVG, so there are no image files to host.
function pinIcon(maps, color, scale = 1) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 1C8.7 1 2 7.5 2 15.6 2 26 17 43 17 43s15-17 15-27.4C32 7.5 25.3 1 17 1z" fill="${color}" stroke="#fff" stroke-width="2.5"/><circle cx="17" cy="15.5" r="5.5" fill="#fff"/></svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new maps.Size(34 * scale, 44 * scale),
    anchor: new maps.Point(17 * scale, 43 * scale),
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
  const pulse = useRef({ circles: [], raf: null });
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
        map.fitBounds(bounds, 60);

        // Pins drop in one after another.
        ALL.forEach((p, i) => {
          const color = p.region === "bali" ? COLORS.sea : COLORS.coral;
          const place = () => {
            if (cancelled) return;
            const m = new maps.Marker({
              position: { lat: p.lat, lng: p.lng },
              map,
              title: p.name,
              icon: pinIcon(maps, color),
              animation: reduced() ? null : maps.Animation.DROP,
              zIndex: 10,
            });
            m.addListener("click", () => setSelected(p.name));
            markers.current[p.name] = { m, color };
          };
          if (reduced()) place();
          else setTimeout(place, 250 + i * 90);
        });
        setLoaded(true);
      })
      .catch(() => setMapFailed(true));
    return () => {
      cancelled = true;
      if (pulse.current.raf) cancelAnimationFrame(pulse.current.raf);
    };
  }, []);

  // When a port is chosen: enlarge its pin, glide the map to it, pulse a ring.
  useEffect(() => {
    const maps = typeof window !== "undefined" && window.google && window.google.maps;
    if (!loaded || !maps || !mapObj.current) return;
    Object.entries(markers.current).forEach(([name, { m, color }]) => {
      const on = name === selected;
      m.setIcon(pinIcon(maps, on ? COLORS.coralDeep : color, on ? 1.3 : 1));
      m.setZIndex(on ? 100 : 10);
    });
    pulse.current.circles.forEach((c) => c.setMap(null));
    pulse.current.circles = [];
    if (pulse.current.raf) cancelAnimationFrame(pulse.current.raf);
    if (!port) return;
    const center = { lat: port.lat, lng: port.lng };
    const map = mapObj.current;
    map.panTo(center);
    if ((map.getZoom() || 0) < 10) setTimeout(() => map.setZoom(10), reduced() ? 0 : 350);
    if (reduced()) return;
    const ring = new maps.Circle({ map, center, radius: 1, strokeColor: COLORS.coral, strokeOpacity: 0.6, strokeWeight: 2, fillOpacity: 0, zIndex: 5 });
    pulse.current.circles = [ring];
    const start = performance.now();
    const CYCLE = 2000;
    const MAX = 3500;
    const frame = (now) => {
      const t = ((now - start) % CYCLE) / CYCLE;
      ring.setRadius(t * MAX);
      ring.setOptions({ strokeOpacity: 0.6 * (1 - t) });
      pulse.current.raf = requestAnimationFrame(frame);
    };
    pulse.current.raf = requestAnimationFrame(frame);
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
      mapObj.current.fitBounds(bounds, 60);
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
              Tap a pin to explore a port
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
