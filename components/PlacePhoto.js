"use client";

import { useEffect, useRef, useState } from "react";
import { optimized, srcSetFor } from "@/lib/img";

// A photo that simply isn't rendered if its file is missing, so a slot never
// shows a broken-image icon. Drop a file at the path and it appears.
// `sizes` tells the browser how wide the photo shows, so it picks the smallest copy that's sharp enough.
export default function PlacePhoto({ src, alt, aspect = "16 / 9", radius = 14, position = "center", priority = false, sizes = "(max-width: 900px) 100vw, 900px", style }) {
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
        src={optimized(src)}
        srcSet={srcSetFor(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: position }}
      />
    </div>
  );
}
