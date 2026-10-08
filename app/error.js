"use client";

import Link from "next/link";
import { COLORS } from "@/lib/theme";

export default function Error({ reset }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "70px 20px 90px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 34, color: COLORS.sea, marginBottom: 10 }}>Something went wrong</h1>
      <p style={{ fontSize: 15, opacity: 0.75, marginBottom: 24 }}>That didn&apos;t load properly. It&apos;s us, not you. Try again, or head back home.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}>Try again</button>
        <Link href="/" style={{ border: `1px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 8, textDecoration: "none" }}>Home</Link>
      </div>
    </div>
  );
}
