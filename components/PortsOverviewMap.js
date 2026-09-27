"use client";

import { useEffect, useRef, useState } from "react";
import { BALI_PORTS } from "@/data/ports";
import { COLORS } from "@/lib/theme";
import { loadGoogleMaps } from "@/components/AddressAutocomplete";

// Same light map style already validated and in use on the Trip Planner
// (components/FindPortMap.js) — reused here for visual consistency, and
// because it's proven to actually look good, unlike a hand-drawn SVG.
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

// A small real map showing every Bali departure port as a pin, with a
// click-to-see-connections info window. Real coastlines, real geography —
// intentionally simple and mostly static rather than another interactive
// tool, since the Trip Planner already covers the interactive routing job.
export default function PortsOverviewMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

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
        const infoWindow = new maps.InfoWindow();

        BALI_PORTS.forEach((port) => {
          const position = { lat: port.lat, lng: port.lng };
          const marker = new maps.Marker({
            position,
            map: mapInstance.current,
            title: port.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: COLORS.coral,
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });
          marker.addListener("click", () => {
            infoWindow.setContent(
              `<div style="font-family:Arial,sans-serif;padding:2px;max-width:220px;">
                <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${port.name}</div>
                <div style="font-size:11.5px;color:#555;">Connects to: ${port.connects}</div>
              </div>`
            );
            infoWindow.open({ map: mapInstance.current, anchor: marker });
          });
          bounds.extend(position);
        });

        mapInstance.current.fitBounds(bounds, 50);
        setLoaded(true);
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="h-[280px]" style={{ background: COLORS.foam, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <p style={{ fontSize: 12.5, color: COLORS.coralDeep }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] sm:h-[340px]" style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${COLORS.foamLine}` }}>
      {!loaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3ECDB", fontSize: 12.5, color: COLORS.sea, opacity: 0.7 }}>
          Loading map…
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
