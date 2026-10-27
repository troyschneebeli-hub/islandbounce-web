import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { ROUTE_PAGES, ROUTE_SLUGS } from "@/data/routePages";
import WaveDivider from "@/components/WaveDivider";
import AllRoutesDirectory from "@/components/AllRoutesDirectory";

export const metadata = {
  title: "All Boat Routes: Bali, Gili Islands, Nusa Penida & Lombok",
  description:
    "Every fast boat and ferry route we cover between Bali, the Gili Islands, Nusa Penida, Nusa Lembongan and Lombok, grouped by departure port, with times, operators and live prices.",
  alternates: { canonical: "/indonesia/routes" },
};

export default function RoutesIndex() {
  const routes = ROUTE_SLUGS.map((s) => ROUTE_PAGES[s]);

  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "44px 20px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 2, marginBottom: 10 }}>INDONESIA</div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            All boat routes
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.8, margin: "12px auto 0", fontSize: 15, lineHeight: 1.6 }}>
            Every route between Bali, the Nusa Islands, the Gili Islands and Lombok, by departure port. Tap a destination for its daily
            times, or Check prices for live fares on your date.
          </p>
        </div>
        <WaveDivider into="white" height={64} bleed={20} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 56px" }}>
          <AllRoutesDirectory />

          {/* Plain links to every route guide, including the ones that cover several ports at once (e.g. "Bali to the
              Gili Islands"), which no single row above links to. */}
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 8 }}>Route guides</h2>
            <p style={{ fontSize: 14, lineHeight: 1.9, color: COLORS.ink }}>
              {routes.map((r, i) => (
                <span key={r.slug}>
                  <Link href={`/indonesia/routes/${r.slug}`} style={{ color: COLORS.sea, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}44` }}>
                    {r.name}
                  </Link>
                  {i < routes.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
