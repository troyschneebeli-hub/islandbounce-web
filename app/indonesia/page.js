import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { DESTINATIONS, ACTIVE_DESTINATIONS } from "@/data/destinations";

export const metadata = {
  title: "Indonesia",
  description: "Bali, the Gili Islands, Nusa Penida, and Lombok — boat routes, ports, and things to do.",
};

const TOOLS = [
  { href: "/indonesia/route-finder", title: "Route Finder", blurb: "Type your address, pick a destination — every exit port's real drive time and boat crossing in one search." },
  { href: "/indonesia/find-port", title: "Find My Closest Port", blurb: "Real driving times from your hotel to every Bali port." },
  { href: "/indonesia/planner", title: "Trip Planner", blurb: "Drive + boat math for every departure to your destination." },
  { href: "/indonesia/ports", title: "All Ports", blurb: "Every harbor across Bali, the Gilis, Nusa & Lombok." },
  { href: "/indonesia/compare", title: "Compare Boats", blurb: "Quick side-by-side operator comparison." },
];

export default function IndonesiaHub() {
  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.sea} 0%, ${COLORS.seaDeep} 100%)`, padding: "36px 20px 44px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: 2, marginBottom: 8 }}>
            INDONESIA
          </div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.sand, lineHeight: 1.05 }}>
            Bali, Gili Islands, Nusa & Lombok
          </h1>
          <p style={{ color: COLORS.foam, opacity: 0.85, maxWidth: 520, marginTop: 10, fontSize: 15 }}>
            Every short crossing in the region, compared side by side — plus tools to work out exactly how to get
            there from where you're staying.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 20px 56px" }}>
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 14 }}>
            Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                style={{ textAlign: "left", background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 12, padding: 18, textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 13, opacity: 0.65 }}>{t.blurb}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.coral, marginTop: 8 }}>Open →</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 14 }}>
            Destination guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(DESTINATIONS)
              .filter(([key]) => ACTIVE_DESTINATIONS.includes(key))
              .map(([key, d]) => (
                <Link
                  key={key}
                  href={`/indonesia/guide/${key}`}
                  style={{ textAlign: "left", background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 12, padding: 18, textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brass, marginBottom: 4 }}>{d.region}</div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{d.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>{d.tagline}</div>
                </Link>
              ))}
          </div>
        </section>

        <section>
          <div style={{ background: COLORS.sea, borderRadius: 14, padding: 28 }} className="flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brass, letterSpacing: 1.5, marginBottom: 6 }}>
                NEW · COMING SOON
              </div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                Can&apos;t justify a private charter alone?
              </div>
              <div style={{ color: COLORS.foam, opacity: 0.85, fontSize: 13.5, maxWidth: 420 }}>
                Split the cost with other travelers heading the same way. A $650 charter becomes ~$108/person, six
                ways.
              </div>
            </div>
            <Link
              href="/indonesia/split-charter"
              style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Learn more →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
