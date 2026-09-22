import Link from "next/link";
import { COLORS } from "@/lib/theme";

export default function PortCard({ port }) {
  return (
    <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{port.name}</div>
      <p style={{ fontSize: 12.5, opacity: 0.7, lineHeight: 1.5, marginBottom: 8 }}>{port.blurb}</p>
      <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 4 }}>
        <strong>Connects to:</strong> {port.connects}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.brass, marginBottom: 10 }}>
        {port.frequency}
      </div>
      <Link
        href="/indonesia/compare"
        style={{ fontSize: 12, fontWeight: 700, color: COLORS.sea, background: "none", border: `1px solid ${COLORS.sea}`, padding: "6px 12px", borderRadius: 6, textDecoration: "none", display: "inline-block" }}
      >
        Compare boats from here →
      </Link>
    </div>
  );
}
