"use client";

import { useEffect, useRef, useState } from "react";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { BOAT_ROUTES, genDepartures, fmtMins } from "@/data/planner";
import { COLORS } from "@/lib/theme";
import { loadGoogleMaps } from "@/components/AddressAutocomplete";

// Same light map style already validated and in use on the Trip Planner.
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

const REGION_COLOR = { bali: "#E8823C", nusa: "#3B82C4", "gili-lombok": "#3F9142" };
const REGION_LABEL = { bali: "Bali", nusa: "Nusa", "gili-lombok": "Gili / Lombok" };

const ALL_PORTS = [...BALI_PORTS, ...ISLAND_PORTS];

// For a Bali port: real destinations straight from BOAT_ROUTES.
// For a Gili/Nusa/Lombok port: the reverse lookup — which Bali ports
// actually have a route TO this one — since BOAT_ROUTES is only modeled
// one direction (Bali port → destination). Crossing time is symmetric
// either way, so the same genDepartures data is valid read backwards.
function getConnectionsFrom(port) {
  if (port.region === "bali") {
    const routes = BOAT_ROUTES[port.name];
    if (!routes) return [];
    return Object.keys(routes).map((destName) => {
      const boats = genDepartures(port.name, destName, routes[destName]);
      const fastest = boats.reduce((a, b) => (a.boatMin < b.boatMin ? a : b));
      const destPort = ISLAND_PORTS.find((p) => p.name === destName);
      return { name: destName, region: destPort?.region, boatMin: fastest.boatMin };
    });
  }
  const reachableFrom = [];
  BALI_PORTS.forEach((baliPort) => {
    const cfg = BOAT_ROUTES[baliPort.name]?.[port.name];
    if (cfg) {
      const boats = genDepartures(baliPort.name, port.name, cfg);
      const fastest = boats.reduce((a, b) => (a.boatMin < b.boatMin ? a : b));
      reachableFrom.push({ name: baliPort.name, region: "bali", boatMin: fastest.boatMin });
    }
  });
  return reachableFrom;
}

export default function PortsOverviewMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);

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
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: false,
          gestureHandling: "greedy",
          backgroundColor: "#F3ECDB",
        });

        const bounds = new maps.LatLngBounds();

        ALL_PORTS.forEach((port) => {
          const position = { lat: port.lat, lng: port.lng };
          const marker = new maps.Marker({
            position,
            map: mapInstance.current,
            title: port.name,
            icon: { path: maps.SymbolPath.CIRCLE, scale: 7, fillColor: REGION_COLOR[port.region], fillOpacity: 1, strokeColor: "white", strokeWeight: 2 },
          });
          marker.addListener("click", () => setSelected(port.name));
          markersRef.current[port.name] = marker;
          bounds.extend(position);
        });

        mapInstance.current.fitBounds(bounds, 40);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="h-[340px]" style={{ background: COLORS.foam, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: COLORS.coralDeep }}>{error}</p>
      </div>
    );
  }

  const selectedPort = selected ? ALL_PORTS.find((p) => p.name === selected) : null;
  const connections = selectedPort ? getConnectionsFrom(selectedPort) : [];

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="h-[340px] sm:h-[440px]" style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${COLORS.foamLine}`, flex: "1 1 auto", minWidth: 0 }}>
          {!loaded && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3ECDB", fontSize: 12.5, color: COLORS.sea, opacity: 0.7 }}>
              Loading map…
            </div>
          )}
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Side panel — appears once a port is clicked, same pattern as the Trip Planner's results panel. */}
        <div className="h-[340px] sm:h-[440px] lg:w-[300px]" style={{ flex: "0 0 auto", overflowY: "auto" }}>
          {!selectedPort ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.foam, borderRadius: 14, padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 12.5, color: COLORS.sea, opacity: 0.6 }}>Tap a pin to see where you can go from there.</p>
            </div>
          ) : (
            <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: 16, height: "100%", overflowY: "auto" }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: REGION_COLOR[selectedPort.region],
                  background: `${REGION_COLOR[selectedPort.region]}18`,
                  padding: "2px 8px",
                  borderRadius: 999,
                  marginBottom: 6,
                }}
              >
                {REGION_LABEL[selectedPort.region]}
              </div>
              <div style={{ fontWeight: 800, fontSize: 17, color: COLORS.ink, marginBottom: 10 }}>{selectedPort.name}</div>

              {connections.length === 0 ? (
                <p style={{ fontSize: 12, opacity: 0.6 }}>No routes in our data yet for this port.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {connections
                    .sort((a, b) => a.boatMin - b.boatMin)
                    .map((c) => (
                      <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: COLORS.foam, borderRadius: 8 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: REGION_COLOR[c.region] || COLORS.sea, display: "inline-block" }} />
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.ink }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.sea }}>{fmtMins(c.boatMin)}</span>
                      </div>
                    ))}
                </div>
              )}
              <p style={{ fontSize: 10, opacity: 0.5, marginTop: 12, fontStyle: "italic" }}>
                Boat times are estimated schedules for planning purposes — verify before booking.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-5" style={{ marginTop: 10, fontSize: 11, color: COLORS.sea, opacity: 0.75 }}>
        {Object.entries(REGION_LABEL).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: 999, background: REGION_COLOR[key], display: "inline-block" }} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}
