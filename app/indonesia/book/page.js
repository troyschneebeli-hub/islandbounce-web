import { COLORS } from "@/lib/theme";
import { SITE_URL } from "@/lib/site";
import WaveDivider from "@/components/WaveDivider";
import TwelveGoBookingWidget from "@/components/TwelveGoBookingWidget";

export const metadata = {
  title: "Book Your Ferry",
  description: "Search and book fast boat and ferry tickets across Bali, the Gili Islands, Nusa Penida and Lombok.",
  alternates: { canonical: "/indonesia/book" },
};

export default function BookPage() {
  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "44px 20px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 2, marginBottom: 10 }}>INDONESIA</div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            Book your ferry
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.8, margin: "12px auto 0", fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>
            Search real fares and availability across Bali, the Gilis, Nusa Penida and Lombok, and book straight through 12Go.
          </p>
        </div>
        <WaveDivider into="white" height={64} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 20px 56px" }}>
          <TwelveGoBookingWidget />
          <p style={{ fontSize: 12, color: COLORS.ink, opacity: 0.6, textAlign: "center", marginTop: 24 }}>
            Not sure which route you need yet? Use the{" "}
            <a href="/indonesia" style={{ color: COLORS.sea, fontWeight: 700 }}>
              Trip Planner
            </a>{" "}
            to compare drive and boat times first.
          </p>
        </div>
      </div>
    </div>
  );
}
