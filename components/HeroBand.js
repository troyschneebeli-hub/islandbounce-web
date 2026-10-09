"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS } from "@/lib/theme";

// Full-width photo band behind a page heading. White text sits on a dark teal
// overlay, and the bottom edge fades into the sky-blue below. If the photo file
// is missing it falls back to a solid deep-teal band, so the white text is
// always readable.
export default function HeroBand({ src, alt, position = "center 40%", children }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: `linear-gradient(160deg, ${COLORS.sea} 0%, ${COLORS.seaDeep} 100%)` }}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          decoding="async"
          fetchPriority="high"
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: position }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,47,44,0.5) 0%, rgba(6,47,44,0.66) 100%)" }} />
      <div style={{ position: "relative", padding: "72px 24px 76px" }}>{children}</div>
    </div>
  );
}
