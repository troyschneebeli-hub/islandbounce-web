"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS } from "@/lib/theme";

// Shared Google Maps script loader — multiple components on the same page
// (this, plus the map itself) all need the JS API loaded, so this caches
// the loading promise instead of injecting the script twice.
let mapsLoadPromise = null;
export function loadGoogleMaps(apiKey, libraries = "places") {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps && (!libraries.includes("places") || window.google.maps.places)) {
    return Promise.resolve(window.google.maps);
  }
  if (mapsLoadPromise) return mapsLoadPromise;

  mapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });
  return mapsLoadPromise;
}

// Drop-in replacement for a plain <input> for an address field. Same
// value/onChange pattern, plus real address suggestions as you type,
// biased toward Indonesia since that's the only region live so far.
// onPlaceSelected (optional) fires with { lat, lng, formattedAddress }
// when someone picks a suggestion — used by FindPortMap to place a pin
// without a second geocoding call.
export default function AddressAutocomplete({ value, onChange, onPlaceSelected, placeholder, style }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
    if (!apiKey) {
      setWarning("Address suggestions need NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY set.");
      return;
    }
    let cancelled = false;

    loadGoogleMaps(apiKey, "places")
      .then((maps) => {
        if (cancelled || !inputRef.current || autocompleteRef.current) return;

        autocompleteRef.current = new maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry"],
          componentRestrictions: { country: "id" }, // Indonesia — update/remove once other regions go live
        });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place?.formatted_address) {
            onChange(place.formatted_address);
          }
          const loc = place?.geometry?.location;
          if (loc && onPlaceSelected) {
            onPlaceSelected({ lat: loc.lat(), lng: loc.lng(), formattedAddress: place.formatted_address });
          }
        });
      })
      .catch((err) => setWarning(err.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={style}
      />
      {warning && (
        <div style={{ fontSize: 10.5, color: COLORS.coralDeep, marginTop: 4 }}>{warning}</div>
      )}
    </>
  );
}
