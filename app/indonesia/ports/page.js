import { COLORS } from "@/lib/theme";
import PortsExplorer from "@/components/PortsExplorer";
import Link from "next/link";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { ALL_PORTS, PORT_PAGE_SLUGS, portShortName, portSlug, portTraffic } from "@/lib/portPages";

export const metadata = {
  title: "Bali, Gili & Nusa Ferry Ports Map: Padang Bai, Sanur & More",
  description: "Interactive map of every fast boat port in Bali, the Gili Islands, Nusa Penida, Nusa Lembongan and Bangsal on Lombok, with photos and what to know at each harbour.",
  alternates: { canonical: "/indonesia/ports" },
};

export default function PortsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6 }}>
        All Ports
      </h1>
      <p style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 28, maxWidth: 600 }}>
        Every harbour covering Bali, the Gili Islands, Nusa Penida, Nusa Lembongan, and Bangsal on Lombok — which port you leave from
        changes your options a lot more than most people realise.
      </p>

      <PortsExplorer />

      {/* A guide page per harbour with daily boats: departures, arrivals and how to get there. */}
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.sea, marginBottom: 10 }}>Port guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_PORTS.filter((p) => PORT_PAGE_SLUGS.includes(portSlug(p.name))).map((p) => {
            const t = portTraffic(p.name);
            return (
              <Link
                key={p.name}
                href={`/indonesia/ports/${portSlug(p.name)}`}
                style={{ display: "block", background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 12, padding: "12px 14px", textDecoration: "none", color: COLORS.ink }}
              >
                <div style={{ fontWeight: 700, color: COLORS.sea, fontSize: 15 }}>{portShortName(p.name)} harbour →</div>
                <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 2 }}>
                  {t.departuresCount} daily boats out · {t.arrivalsCount} in
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
