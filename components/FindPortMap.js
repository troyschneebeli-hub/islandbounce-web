"use client";

import { useEffect, useRef, useState } from "react";
import { BALI_PORTS } from "@/data/ports";
import { BOAT_ROUTES, genDepartures, CHECKIN_BUFFER_MIN, fmtMins } from "@/data/planner";
import { buildTransportLink } from "@/lib/affiliateLinks";
import { COLORS } from "@/lib/theme";
import { loadGoogleMaps } from "@/components/AddressAutocomplete";

// Black/neon "futuristic" map style — near-black land and water, roads
// barely visible until you're zoomed in, everything built to let the
// neon route lines be the brightest thing on screen.
const FUTURISTIC_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#050A0C" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#050A0C" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3A5A62" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#122126" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#4FA3B8" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0A1417" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#0F1C20" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#081215" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#2E4E56" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#152A30" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#4FE0FF" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020608" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1E4A54" }] },
];

const NEON_FASTEST = "#FF2E63"; // hot neon pink-red — the standout route
const NEON_OTHER = "#00E5FF"; // neon cyan — everything else
const NEON_DIM = "#123138"; // what non-hovered "other" routes fade to while one is highlighted

// Default view: frames all of Bali (the bulk of it), the Gili Islands, and
// the west coast of Lombok down to Lembar — the whole service area, before
// anyone's searched anything yet.
const DEFAULT_BOUNDS = { south: -8.9, west: 114.85, north: -8.05, east: 116.18 };

export default function FindPortMap({ origin, destination, height = 520 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routesRef = useRef([]); // [{ port, isFastest, glow, line, marker }]
  const originMarkerRef = useRef(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState([]);
  const [hovered, setHovered] = useState(null);

  // Initial map load — runs once.
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
          styles: FUTURISTIC_STYLE,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true, // the + / − buttons stay
          scrollwheel: false, // trackpad/mouse-wheel zoom off — this was the annoying part
          disableDoubleClickZoom: false, // double-click still zooms, that's an intentional click not an accidental scroll
          gestureHandling: "greedy", // dragging to pan still works with one finger/click, no "use two fingers" nag
          backgroundColor: "#050A0C",
        });
        mapInstance.current.fitBounds(DEFAULT_BOUNDS, 20);

        BALI_PORTS.forEach((port) => {
          new maps.Marker({
            position: { lat: port.lat, lng: port.lng },
            map: mapInstance.current,
            title: port.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: NEON_OTHER,
              fillOpacity: 0.9,
              strokeColor: "#FFFFFF",
              strokeWeight: 1.2,
            },
          });
        });

        setLoaded(true);
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-run whenever origin/destination change — clears old routes, draws new ones.
  useEffect(() => {
    if (!loaded || !origin || !destination || !mapInstance.current) return;
    const maps = window.google.maps;

    routesRef.current.forEach((r) => {
      r.glow.setMap(null);
      r.line.setMap(null);
    });
    routesRef.current = [];
    if (originMarkerRef.current) originMarkerRef.current.setMap(null);
    setResults([]);
    setHovered(null);

    originMarkerRef.current = new maps.Marker({
      position: { lat: origin.lat, lng: origin.lng },
      map: mapInstance.current,
      title: origin.label || "Your location",
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#FFFFFF",
        fillOpacity: 1,
        strokeColor: NEON_FASTEST,
        strokeWeight: 3,
      },
      zIndex: 999,
    });

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

    Promise.all(
      candidatePorts.map(
        (port) =>
          new Promise((resolve) => {
            directionsService.route(
              {
                origin: { lat: origin.lat, lng: origin.lng },
                destination: { lat: port.lat, lng: port.lng },
                travelMode: maps.TravelMode.DRIVING,
              },
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
        const color = isFastest ? NEON_FASTEST : NEON_OTHER;

        // Two-layer "glow": a wide, soft, low-opacity line behind a thin
        // bright one on top — Google polylines have no real box-shadow,
        // this fakes the neon-glow look by stacking two of them.
        const glow = new maps.Polyline({
          path,
          map: mapInstance.current,
          strokeColor: color,
          strokeOpacity: isFastest ? 0.35 : 0.18,
          strokeWeight: isFastest ? 14 : 9,
          zIndex: isFastest ? 2 : 1,
        });
        const line = new maps.Polyline({
          path,
          map: mapInstance.current,
          strokeColor: color,
          strokeOpacity: isFastest ? 1 : 0.75,
          strokeWeight: isFastest ? 4 : 2.5,
          zIndex: isFastest ? 4 : 3,
        });

        routesRef.current.push({ port: o.port.name, isFastest, glow, line });
        path.forEach((p) => bounds.extend(p));
      });

      mapInstance.current.fitBounds(bounds, 70);

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
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, origin?.lat, origin?.lng, destination]);

  // Hover isolation — dims/hides every route except the one being hovered.
  useEffect(() => {
    routesRef.current.forEach((r) => {
      const isHoveredOne = hovered === r.port;
      const showFull = hovered === null || isHoveredOne;
      r.line.setOptions({
        strokeOpacity: showFull ? (r.isFastest ? 1 : 0.75) : 0.06,
        strokeColor: isHoveredOne ? NEON_FASTEST : r.isFastest ? NEON_FASTEST : hovered ? NEON_DIM : NEON_OTHER,
        zIndex: isHoveredOne ? 10 : r.isFastest ? 4 : 3,
      });
      r.glow.setOptions({
        strokeOpacity: showFull ? (r.isFastest ? 0.35 : 0.18) : 0.02,
        strokeColor: isHoveredOne ? NEON_FASTEST : r.isFastest ? NEON_FASTEST : NEON_OTHER,
      });
    });
  }, [hovered]);

  if (error) {
    return (
      <div style={{ height, background: "#050A0C", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: "#FCA5A5" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div style={{ position: "relative", height, borderRadius: 14, overflow: "hidden", border: `1px solid ${NEON_OTHER}22`, flex: "1 1 auto", minWidth: 0 }}>
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#050A0C", fontSize: 12.5, color: "#4FE0FF", opacity: 0.7 }}>
            Loading map…
          </div>
        )}
        {calculating && (
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.75)", color: NEON_OTHER, fontSize: 11.5, fontWeight: 600, padding: "6px 12px", borderRadius: 999, zIndex: 10, border: `1px solid ${NEON_OTHER}55` }}>
            Calculating routes…
          </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {results.length > 0 && (
        <div
          className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-w-[320px]"
          style={{ flex: "0 0 auto", width: "100%", maxHeight: height }}
        >
          <div className="flex flex-row lg:flex-col gap-2" style={{ minWidth: "min-content" }}>
            {results.map((r, i) => (
              <div
                key={r.port}
                onMouseEnter={() => setHovered(r.port)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "#0B1417",
                  border: `1px solid ${hovered === r.port ? NEON_FASTEST : i === 0 ? NEON_FASTEST + "66" : `${NEON_OTHER}33`}`,
                  borderRadius: 10,
                  padding: 14,
                  minWidth: 220,
                  width: 260,
                  flexShrink: 0,
                  position: "relative",
                  cursor: "pointer",
                  transition: "border-color 0.15s, transform 0.15s",
                  transform: hovered === r.port ? "translateY(-2px)" : "none",
                  boxShadow: hovered === r.port ? `0 0 16px ${NEON_FASTEST}55` : "none",
                }}
              >
                {i === 0 && (
                  <div style={{ position: "absolute", top: -9, left: 12, background: NEON_FASTEST, color: "#050A0C", fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 999, letterSpacing: 0.5 }}>
                    FASTEST
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 15, color: "#EAF7FC", marginBottom: 8 }}>{r.port}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, opacity: 0.6, color: NEON_OTHER, letterSpacing: 0.5 }}>CAR</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 16, color: "#EAF7FC" }}>{r.driveText}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, opacity: 0.6, color: NEON_OTHER, letterSpacing: 0.5 }}>SCOOTER</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 16, color: "#EAF7FC" }}>{fmtMins(r.scooterMin)}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, opacity: 0.6, color: NEON_FASTEST, letterSpacing: 0.5 }}>BOAT</div>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 16, color: NEON_FASTEST }}>{fmtMins(r.fastestBoat.boatMin)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.6, color: "#8FB4BC", marginTop: 8 }}>
                  {r.fastestBoat.operator}, departs {r.fastestBoat.depart} · ~{fmtMins(r.totalMin)} total
                </div>
                <a
                  href={buildTransportLink(r.port, destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 700, color: "#050A0C", background: NEON_OTHER, padding: "5px 10px", borderRadius: 6, textDecoration: "none" }}
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
