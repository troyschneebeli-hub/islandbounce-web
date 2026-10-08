import Link from "next/link";
import { COLORS } from "@/lib/theme";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  const btn = { display: "inline-block", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 8, textDecoration: "none" };
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "70px 20px 90px", textAlign: "center" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.brass, letterSpacing: 2, marginBottom: 8 }}>404</div>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 36, color: COLORS.sea, marginBottom: 10 }}>This boat has sailed</h1>
      <p style={{ fontSize: 15, opacity: 0.75, marginBottom: 24 }}>We couldn&apos;t find that page. Try one of these instead.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/indonesia" style={{ ...btn, background: COLORS.coral, color: "white" }}>Plan a trip</Link>
        <Link href="/indonesia/routes" style={{ ...btn, border: `1px solid ${COLORS.sea}`, color: COLORS.sea }}>Popular routes</Link>
        <Link href="/" style={{ ...btn, border: `1px solid ${COLORS.sea}`, color: COLORS.sea }}>Home</Link>
      </div>
    </div>
  );
}
