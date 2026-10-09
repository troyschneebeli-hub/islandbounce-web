import { COLORS } from "@/lib/theme";
import PortsExplorer from "@/components/PortsExplorer";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";

export const metadata = {
  title: "All Ports — Indonesia",
  description: "Every harbor covering Bali, the Gili Islands, Nusa Penida, Nusa Lembongan, and Bangsal on Lombok.",
  alternates: { canonical: "/indonesia/ports" },
};

export default function PortsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6 }}>
        All Ports
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 28, maxWidth: 600 }}>
        Every harbor covering Bali, the Gili Islands, Nusa Penida, Nusa Lembongan, and Bangsal on Lombok — which port you leave from
        changes your options a lot more than most people realize.
      </p>

      <PortsExplorer />

      {/* The same details as plain text: easy to skim, and readable without the map. */}
      <details style={{ marginTop: 28, background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 12, padding: "14px 18px" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, color: COLORS.sea, fontSize: 14 }}>All ports at a glance</summary>
        <div style={{ marginTop: 14 }}>
          {[...BALI_PORTS, ...ISLAND_PORTS].map((p) => (
            <div key={p.name} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink }}>{p.name}</div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: COLORS.ink, opacity: 0.75 }}>{p.blurb}</p>
              <div style={{ fontSize: 12, color: COLORS.ink, opacity: 0.65 }}><strong>Connects to:</strong> {p.connects}</div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
