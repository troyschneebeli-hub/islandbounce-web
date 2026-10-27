import Link from "next/link";
import { COLORS } from "@/lib/theme";
import WaveDivider from "@/components/WaveDivider";
import AllRoutesDirectory from "@/components/AllRoutesDirectory";

export const metadata = {
  title: "All Boat Routes: Bali, Gili Islands, Nusa Penida & Lombok",
  description:
    "Every fast boat and ferry route we cover between Bali, the Gili Islands, Nusa Penida, Nusa Lembongan and Lombok, grouped by departure port, with times, operators and live prices.",
  alternates: { canonical: "/indonesia/routes" },
};

export default function RoutesIndex() {
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
          <p style={{ marginTop: 28, fontSize: 14, color: COLORS.ink }}>
            Comparing companies?{" "}
            <Link href="/indonesia/operators" style={{ color: COLORS.sea, fontWeight: 700 }}>See every operator&apos;s schedule</Link>.
            {" "}Not sure which port?{" "}
            <Link href="/indonesia/guides" style={{ color: COLORS.sea, fontWeight: 700 }}>Read the planning guides</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
