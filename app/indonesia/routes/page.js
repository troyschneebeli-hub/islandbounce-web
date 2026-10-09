import { COLORS } from "@/lib/theme";
import { ROUTE_PAGES, ROUTE_SLUGS } from "@/data/routePages";
import PoppyCard from "@/components/PoppyCard";
import WaveDivider from "@/components/WaveDivider";

export const metadata = {
  title: "Bali, Gili & Lombok Fast Boat Routes",
  description:
    "Fast boat and ferry routes between Bali, the Gili Islands and Lombok, with departure times and operators.",
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
            Fast boat routes
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.8, margin: "12px auto 0", fontSize: 15, lineHeight: 1.6 }}>
            Every route below lists real departures and operators, plus live sea conditions for each port.
          </p>
        </div>
        <WaveDivider into="white" height={64} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 56px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
            {routes.map((r) => (
              <PoppyCard key={r.slug} href={`/indonesia/routes/${r.slug}`} eyebrow={r.region.toUpperCase()} title={r.name} blurb={r.blurb} width="100%" />
            ))}
          </div>
          <p style={{ fontSize: 13, color: COLORS.ink, opacity: 0.65, textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            More routes, including Nusa Penida and Nusa Lembongan, are added as we verify each operator&apos;s timetable.
          </p>
        </div>
      </div>
    </div>
  );
}
