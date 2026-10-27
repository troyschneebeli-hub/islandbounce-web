import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { GUIDES, GUIDE_SLUGS } from "@/data/guides";
import WaveDivider from "@/components/WaveDivider";

export const metadata = {
  title: "Bali to Gili Planning Guides: Ports & Drive Times",
  description:
    "Practical guides for getting from Ubud, Seminyak, Canggu or Bali airport to the Gili Islands: which port to use, how long it takes and which daily boats fit your day.",
  alternates: { canonical: "/indonesia/guides" },
};

export default function GuidesIndex() {
  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "44px 20px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 2, marginBottom: 10 }}>INDONESIA</div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            Planning guides
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.8, margin: "12px auto 0", fontSize: 15, lineHeight: 1.6 }}>
            Which port to use from where you&apos;re staying, how long it takes, and which daily boats fit your day.
          </p>
        </div>
        <WaveDivider into="white" height={64} bleed={20} />
      </section>
      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "8px 20px 56px" }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDE_SLUGS.map((s) => (
            <Link
              key={s}
              href={`/indonesia/guides/${s}`}
              style={{ display: "block", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "16px 18px", textDecoration: "none", color: COLORS.ink }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 17, color: COLORS.sea, marginBottom: 6 }}>{GUIDES[s].name} →</h2>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, opacity: 0.75, margin: 0 }}>{GUIDES[s].intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
