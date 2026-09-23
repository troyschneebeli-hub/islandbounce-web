"use client";

import { useEffect, useRef, useState } from "react";
import { BALI_PORTS } from "@/data/ports";
import { BOAT_ROUTES, genDepartures, CHECKIN_BUFFER_MIN, fmtMins } from "@/data/planner";
import { buildTransportLink } from "@/lib/affiliateLinks";
import { COLORS } from "@/lib/theme";
import { loadGoogleMaps } from "@/components/AddressAutocomplete";

// Light, bright map style built from the site's own palette (sand/sea/
// coral) — a full flip from the earlier dark/neon version, to match the
// rest of the website instead of standing apart from it.
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#F3ECDB" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F3ECDB" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B8A83" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#D8C9A3" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#0B4F4A" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#EFE6D0" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E4D9BC" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8FA69D" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#C9A227" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#BFE3DD" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3E8478" }] },
];

// Real brand colors, used directly — no brightening needed since these
// read fine on a light background (unlike the old dark map, which needed
// neon versions for contrast against near-black).
const ACCENT_FASTEST = COLORS.coral; // #FF6B4D
const ACCENT_OTHER = COLORS.sea; // #0B4F4A
const ACCENT_DIM = "#C9D8D2";

const DEFAULT_BOUNDS = { south: -8.9, west: 114.85, north: -8.05, east: 116.18 };

// NOTE: approximate coordinates from general knowledge, not independently
// verified against exact harbor points — worth a spot-check against
// Google Maps directly before treating as precise.
const DESTINATION_COORDS = {
  "Gili Trawangan": { lat: -8.3496, lng: 116.0463 },
  "Gili Air": { lat: -8.3563, lng: 116.0836 },
  "Gili Meno": { lat: -8.3453, lng: 116.0667 },
  "Nusa Penida": { lat: -8.7278, lng: 115.5444 },
  "Nusa Lembongan": { lat: -8.6784, lng: 115.4425 },
  "Bangsal (Lombok)": { lat: -8.3489, lng: 116.0913 },
  "Senggigi (Lombok)": { lat: -8.4880, lng: 116.0410 },
  "Lembar (Lombok)": { lat: -8.7402, lng: 116.0796 },
  "Gili Gede (SW Lombok)": { lat: -8.8180, lng: 116.0450 },
};

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function animateRouteDrawIn(fullPath, glow, line, duration, delay) {
  let rafId;
  const timeoutId = setTimeout(() => {
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const count = Math.max(2, Math.round(fullPath.length * eased));
      const partial = fullPath.slice(0, count);
      glow.setPath(partial);
      line.setPath(partial);
      if (t < 1) rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }, delay);
  return () => {
    clearTimeout(timeoutId);
    if (rafId) cancelAnimationFrame(rafId);
  };
}

function tweenStrokeOpacity(polyline, toOpacity, duration = 250) {
  const fromOpacity = polyline.get("strokeOpacity") ?? toOpacity;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const value = fromOpacity + (toOpacity - fromOpacity) * easeOutCubic(t);
    polyline.setOptions({ strokeOpacity: value });
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function computeHeading(from, to) {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function lerpLatLng(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

export default function FindPortMap({ origin, destination, height = 520 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routesRef = useRef([]); // [{ port, isFastest, glow, line, cancelDraw, fullPath }]
  const seaLegsRef = useRef([]); // [{ port, dashLine, boatMarker, rafId }]
  const originMarkerRef = useRef(null);
  const pulseCirclesRef = useRef([]);
  const pulseRafRef = useRef(null);
  const flowRafRef = useRef(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
    if (!apiKey) {
      setError("Map isn't configured yet — missing NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY.");
      return;
    }
    let cancelled = false;

    loadGoogleMaps(apiKey, "places")
      .then((maps) => {
        if (cancelled || !mapRef.current || mapInstance.current) return;
        mapInstance.current = new maps.Map(mapRef.current, {
          styles: MAP_STYLE,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          scrollwheel: false,
          disableDoubleClickZoom: false,
          gestureHandling: "greedy",
          backgroundColor: "#F3ECDB",
        });
        mapInstance.current.fitBounds(DEFAULT_BOUNDS, 20);

        BALI_PORTS.forEach((port) => {
          new maps.Marker({
            position: { lat: port.lat, lng: port.lng },
            map: mapInstance.current,
            title: port.name,
            icon: { path: maps.SymbolPath.CIRCLE, scale: 6, fillColor: ACCENT_OTHER, fillOpacity: 0.9, strokeColor: "#FFFFFF", strokeWeight: 1.5 },
          });
        });

        setLoaded(true);
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !origin || !destination || !mapInstance.current) return;
    const maps = window.google.maps;

    routesRef.current.forEach((r) => {
      if (r.cancelDraw) r.cancelDraw();
      r.glow.setMap(null);
      r.line.setMap(null);
    });
    routesRef.current = [];
    seaLegsRef.current.forEach((s) => {
      if (s.rafId) cancelAnimationFrame(s.rafId);
      s.dashLine.setMap(null);
      s.boatMarker.setMap(null);
    });
    seaLegsRef.current = [];
    if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current);
    if (pulseRafRef.current) cancelAnimationFrame(pulseRafRef.current);
    pulseCirclesRef.current.forEach((c) => c.setMap(null));
    pulseCirclesRef.current = [];
    if (originMarkerRef.current) originMarkerRef.current.setMap(null);
    setResults([]);
    setCardsVisible(false);
    setHovered(null);

    originMarkerRef.current = new maps.Marker({
      position: { lat: origin.lat, lng: origin.lng },
      map: mapInstance.current,
      title: origin.label || "Your location",
      icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: "#FFFFFF", fillOpacity: 1, strokeColor: ACCENT_FASTEST, strokeWeight: 3 },
      zIndex: 999,
    });

    const pulse1 = new maps.Circle({ map: mapInstance.current, center: originMarkerRef.current.getPosition(), radius: 1, strokeColor: ACCENT_FASTEST, strokeOpacity: 0.5, strokeWeight: 1.5, fillOpacity: 0, zIndex: 5 });
    const pulse2 = new maps.Circle({ map: mapInstance.current, center: originMarkerRef.current.getPosition(), radius: 1, strokeColor: ACCENT_FASTEST, strokeOpacity: 0.5, strokeWeight: 1.5, fillOpacity: 0, zIndex: 5 });
    pulseCirclesRef.current = [pulse1, pulse2];
    const PULSE_CYCLE = 2200;
    const PULSE_MAX_RADIUS = 900;
    const pulseStart = performance.now();
    function pulseFrame(now) {
      const elapsed = now - pulseStart;
      [pulse1, pulse2].forEach((circle, i) => {
        const phase = ((elapsed + (i === 1 ? PULSE_CYCLE / 2 : 0)) % PULSE_CYCLE) / PULSE_CYCLE;
        circle.setRadius(phase * PULSE_MAX_RADIUS);
        circle.setOptions({ strokeOpacity: 0.5 * (1 - phase) });
      });
      pulseRafRef.current = requestAnimationFrame(pulseFrame);
    }
    pulseRafRef.current = requestAnimationFrame(pulseFrame);

    const candidatePorts = BALI_PORTS.filter((p) => BOAT_ROUTES[p.name]?.[destination]);
    if (candidatePorts.length === 0) {
      setError(`No Bali port in our data has a route to ${destination} yet.`);
      return;
    }
    setError("");
    setCalculating(true);

    const directionsService = new maps.DirectionsService();
    const bounds = new maps.LatLngBounds();
    bounds.extend(originMarkerRef.current.getPosition());
    const destCoord = DESTINATION_COORDS[destination];
    if (destCoord) bounds.extend(destCoord);

    Promise.all(
      candidatePorts.map(
        (port) =>
          new Promise((resolve) => {
            directionsService.route(
              { origin: { lat: origin.lat, lng: origin.lng }, destination: { lat: port.lat, lng: port.lng }, travelMode: maps.TravelMode.DRIVING },
              (result, status) => {
                if (status === "OK" && result) {
                  const leg = result.routes[0].legs[0];
                  resolve({ port, result, driveSeconds: leg.duration.value, driveText: leg.duration.text, distanceText: leg.distance.text });
                } else {
                  resolve({ port, result: null, driveSeconds: null });
                }
              }
            );
          })
      )
    ).then((outcomes) => {
      const withDrive = outcomes.filter((o) => o.driveSeconds != null);
      withDrive.sort((a, b) => a.driveSeconds - b.driveSeconds);

      withDrive.forEach((o, i) => {
        const isFastest = i === 0;
        const path = o.result.routes[0].overview_path;
        const color = isFastest ? ACCENT_FASTEST : ACCENT_OTHER;

        const glow = new maps.Polyline({ path: [], map: mapInstance.current, strokeColor: color, strokeOpacity: isFastest ? 0.25 : 0.12, strokeWeight: isFastest ? 12 : 8, zIndex: isFastest ? 2 : 1 });
        const line = new maps.Polyline({ path: [], map: mapInstance.current, strokeColor: color, strokeOpacity: isFastest ? 1 : 0.8, strokeWeight: isFastest ? 4 : 2.5, zIndex: isFastest ? 4 : 3 });
        const cancelDraw = animateRouteDrawIn(path, glow, line, 900, i * 140);
        routesRef.current.push({ port: o.port.name, isFastest, glow, line, cancelDraw, fullPath: path });
        path.forEach((p) => bounds.extend(p));

        // Illustrative sea leg + boat marker — hidden by default, only
        // shown when this specific port's card is hovered (handled in the
        // hover effect below), so all 4 aren't animating at once.
        if (destCoord) {
          const dashLine = new maps.Polyline({
            path: [{ lat: o.port.lat, lng: o.port.lng }, destCoord],
            map: null,
            strokeOpacity: 0,
            strokeColor: color,
            zIndex: isFastest ? 3 : 2,
            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.7, strokeColor: color, scale: 2.5 }, offset: "0", repeat: "14px" }],
          });
          const heading = computeHeading({ lat: o.port.lat, lng: o.port.lng }, destCoord);
          const boatMarker = new maps.Marker({
            position: { lat: o.port.lat, lng: o.port.lng },
            map: null,
            icon: { path: maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: isFastest ? 4.5 : 3.5, rotation: heading, fillColor: color, fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 1.2 },
            zIndex: isFastest ? 20 : 15,
          });
          seaLegsRef.current.push({ port: o.port.name, dashLine, boatMarker, rafId: null, from: { lat: o.port.lat, lng: o.port.lng }, to: destCoord, cycle: isFastest ? 3200 : 4200 });
          bounds.extend(destCoord);
        }
      });

      mapInstance.current.fitBounds(bounds, 70);

      const fastestRoute = routesRef.current.find((r) => r.isFastest);
      if (fastestRoute) {
        let flowOffset = 0;
        function flowFrame() {
          flowOffset = (flowOffset + 0.4) % 100;
          fastestRoute.line.setOptions({ icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: "#FFFFFF", scale: 3 }, offset: `${flowOffset}%`, repeat: "60px" }] });
          flowRafRef.current = requestAnimationFrame(flowFrame);
        }
        setTimeout(() => {
          flowRafRef.current = requestAnimationFrame(flowFrame);
        }, 900);
      }

      const computed = withDrive.map((o) => {
        const cfg = BOAT_ROUTES[o.port.name][destination];
        const boats = genDepartures(o.port.name, destination, cfg);
        const fastestBoat = boats.reduce((a, b) => (a.boatMin < b.boatMin ? a : b));
        const driveMin = Math.round(o.driveSeconds / 60);
        return {
          port: o.port.name,
          connects: o.port.connects,
          driveMin,
          driveText: o.driveText,
          distanceText: o.distanceText,
          scooterMin: Math.max(5, Math.round(driveMin * 0.75)),
          fastestBoat,
          totalMin: driveMin + CHECKIN_BUFFER_MIN + fastestBoat.boatMin,
        };
      });
      setResults(computed);
      setCalculating(false);
      setTimeout(() => setCardsVisible(true), 30);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, origin?.lat, origin?.lng, destination]);

  // Hover isolation — fades car routes, and now ALSO shows/hides the sea
  // leg + boat animation for whichever port is being hovered. Nothing
  // hovered = no boats animating at all (this was the actual ask: only
  // show the boat for the route someone's actually looking at).
  useEffect(() => {
    routesRef.current.forEach((r) => {
      const isHoveredOne = hovered === r.port;
      const showFull = hovered === null || isHoveredOne;
      const lineTarget = showFull ? (r.isFastest ? 1 : 0.8) : 0.08;
      const glowTarget = showFull ? (r.isFastest ? 0.25 : 0.12) : 0.03;
      const color = isHoveredOne ? ACCENT_FASTEST : r.isFastest ? ACCENT_FASTEST : hovered ? ACCENT_DIM : ACCENT_OTHER;
      r.line.setOptions({ strokeColor: color, zIndex: isHoveredOne ? 10 : r.isFastest ? 4 : 3 });
      r.glow.setOptions({ strokeColor: isHoveredOne ? ACCENT_FASTEST : r.isFastest ? ACCENT_FASTEST : ACCENT_OTHER });
      tweenStrokeOpacity(r.line, lineTarget, 250);
      tweenStrokeOpacity(r.glow, glowTarget, 250);
    });

    seaLegsRef.current.forEach((s) => {
      const shouldShow = hovered === s.port;
      if (s.rafId) {
        cancelAnimationFrame(s.rafId);
        s.rafId = null;
      }
      if (shouldShow) {
        s.dashLine.setMap(mapInstance.current);
        s.boatMarker.setMap(mapInstance.current);
        const start = performance.now();
        function boatFrame(now) {
          const t = ((now - start) % s.cycle) / s.cycle;
          s.boatMarker.setPosition(lerpLatLng(s.from, s.to, easeInOutSine(t)));
          s.rafId = requestAnimationFrame(boatFrame);
        }
        s.rafId = requestAnimationFrame(boatFrame);
      } else {
        s.dashLine.setMap(null);
        s.boatMarker.setMap(null);
      }
    });
  }, [hovered]);

  useEffect(() => {
    return () => {
      if (pulseRafRef.current) cancelAnimationFrame(pulseRafRef.current);
      if (flowRafRef.current) cancelAnimationFrame(flowRafRef.current);
      routesRef.current.forEach((r) => r.cancelDraw && r.cancelDraw());
      seaLegsRef.current.forEach((s) => s.rafId && cancelAnimationFrame(s.rafId));
    };
  }, []);

  if (error) {
    return (
      <div style={{ height, background: COLORS.foam, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: COLORS.coralDeep }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div style={{ position: "relative", height, overflow: "hidden", flex: "1 1 auto", minWidth: 0 }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3ECDB", fontSize: 12.5, color: COLORS.sea, opacity: 0.7 }}>
            Loading map…
          </div>
        )}
        {calculating && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.92)", color: COLORS.sea, fontSize: 11.5, fontWeight: 600, padding: "6px 12px", borderRadius: 999, zIndex: 10, border: `1px solid ${COLORS.foamLine}` }}>
            Calculating routes…
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {results.length > 0 && (
        <div
          className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-w-[320px]"
          style={{ flex: "0 0 auto", width: "100%", maxHeight: height, paddingTop: 12 }}
        >
          <div className="flex flex-row lg:flex-col gap-2" style={{ minWidth: "min-content" }}>
            {results.map((r, i) => (
              <div
                key={r.port}
                onMouseEnter={() => setHovered(r.port)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "white",
                  border: `1px solid ${hovered === r.port ? ACCENT_FASTEST : i === 0 ? ACCENT_FASTEST + "66" : COLORS.foamLine}`,
                  borderRadius: 10,
                  padding: 14,
                  minWidth: 220,
                  width: 260,
                  flexShrink: 0,
                  position: "relative",
                  cursor: "pointer",
                  transition: `border-color 0.15s, transform 0.15s, opacity 0.4s ease ${i * 60}ms, translate 0.4s ease ${i * 60}ms`,
                  transform: hovered === r.port ? "translateY(-2px)" : "none",
                  opacity: cardsVisible ? 1 : 0,
                  translate: cardsVisible ? "0 0" : "0 10px",
                  boxShadow: hovered === r.port ? `0 4px 16px ${ACCENT_FASTEST}33` : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {i === 0 && (
                  <div style={{ position: "absolute", top: -9, left: 12, background: ACCENT_FASTEST, color: "white", fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999, letterSpacing: 0.5 }}>
                    FASTEST
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.ink, marginBottom: 8 }}>{r.port}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, opacity: 0.6, color: COLORS.sea, letterSpacing: 0.5 }}>CAR</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{r.driveText}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, opacity: 0.6, color: COLORS.sea, letterSpacing: 0.5 }}>SCOOTER</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{fmtMins(r.scooterMin)}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, opacity: 0.6, color: ACCENT_FASTEST, letterSpacing: 0.5 }}>BOAT</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 16, color: ACCENT_FASTEST }}>{fmtMins(r.fastestBoat.boatMin)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.65, color: COLORS.ink, marginTop: 8 }}>
                  {r.fastestBoat.operator}, departs {r.fastestBoat.depart} · ~{fmtMins(r.totalMin)} total
                </div>
                <a
                  href={buildTransportLink(r.port, destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 700, color: "white", background: COLORS.sea, padding: "5px 10px", borderRadius: 6, textDecoration: "none" }}
                >
                  Compare on 12Go →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
