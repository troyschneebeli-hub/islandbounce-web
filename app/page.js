import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { REGIONS } from "@/data/regions";
import WaveDivider from "@/components/WaveDivider";
import RegionCard from "@/components/RegionCard";

export default function CoverPage() {
  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "48px 20px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 40, textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 2, marginBottom: 10 }}>
            SOUTHEAST ASIA · ISLAND-HOPPING SPECIALISTS
          </div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 6vw, 56px)", color: COLORS.seaDeep, lineHeight: 1.02, marginBottom: 14 }}>
            COMPARE BOATS.
            <br />
            FIND YOUR ISLAND.
            <br />
            GO PROPERLY.
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.75, maxWidth: 480, margin: "0 auto 26px", fontSize: 15 }}>
            Real insight from people who actually know these places. Not a scraped schedule table — start with
            Indonesia, the region we know best.
          </p>
          <Link
            href="/indonesia"
            style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 22px", borderRadius: 6, textDecoration: "none", display: "inline-block" }}
          >
            Explore Indonesia →
          </Link>
        </div>
        <WaveDivider into="white" height={70} />
      </section>

      <section style={{ background: "white", padding: "36px 20px 8px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Pick a spot", blurb: "Where you're staying, where you're headed." },
            { n: "02", title: "We compare", blurb: "Every port, every boat, real times." },
            { n: "03", title: "You book", blurb: "Straight to the operator. No markup." },
          ].map((s) => (
            <div key={s.n} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 34, color: COLORS.brass, marginBottom: 2 }}>{s.n}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, opacity: 0.6 }}>{s.blurb}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="regions" style={{ background: "white", padding: "44px 20px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 4 }}>
              Where we operate
            </h2>
            <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 18 }}>
              Starting deep in one country before expanding — each destination gets its own dedicated toolset.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REGIONS.map((r) => (
              <RegionCard key={r.slug} region={r} />
            ))}
          </div>
        </div>
      </section>

      <div style={{ background: "white" }}>
        <WaveDivider into={COLORS.foam} height={56} />
      </div>

      <section style={{ background: COLORS.foam, padding: "8px 20px 48px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.sea, marginBottom: 8 }}>
            Insight from people who know these places
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
            No generic listing. We&apos;re building this from real, on-the-ground knowledge of these islands — and
            being upfront about what&apos;s firsthand-verified versus what&apos;s still being confirmed, route by
            route.
          </p>
          <Link
            href="/about"
            style={{ marginTop: 14, background: "none", border: `1px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13, padding: "9px 16px", borderRadius: 6, textDecoration: "none", display: "inline-block" }}
          >
            Why IslandBounce →
          </Link>
        </div>
      </section>
    </div>
  );
}
