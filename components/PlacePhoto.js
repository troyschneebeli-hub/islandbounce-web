"use client";

import { useEffect, useRef, useState } from "react";

// A photo that simply isn't rendered if its file is missing, so a slot never
// shows a broken-image icon. Drop a file at the path and it appears.
export default function PlacePhoto({ src, alt, aspect = "16 / 9", radius = 14, position = "center", priority = false, style }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) return null;
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: radius, aspectRatio: aspect, background: "#E4F0EB", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: position }}
      />
    </div>
  );
}
