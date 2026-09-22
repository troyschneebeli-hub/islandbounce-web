import { COLORS } from "@/lib/theme";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import PortCard from "@/components/PortCard";

export const metadata = {
  title: "All Ports — Indonesia",
  description: "Every harbor covering Bali, the Gili Islands, Nusa Penida, Nusa Lembongan, and Lombok.",
};

export default function PortsPage() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6 }}>
        All Ports
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 28, maxWidth: 600 }}>
        Every harbor covering Bali, the Gili Islands, Nusa Penida, Nusa Lembongan, and Lombok — which port you leave from
        changes your options a lot more than most people realize.
      </p>

      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 12 }}>
        Bali mainland harbors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 32 }}>
        {BALI_PORTS.map((p) => (
          <PortCard key={p.name} port={p} />
        ))}
      </div>

      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 12 }}>
        Gili Islands, Nusa & Lombok harbors
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ISLAND_PORTS.map((p) => (
          <PortCard key={p.name} port={p} />
        ))}
      </div>
    </div>
  );
}
