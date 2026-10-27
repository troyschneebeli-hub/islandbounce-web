import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { OPERATOR_NAMES, operatorData, operatorPageHref } from "@/lib/operatorPages";
import { joinList, plural, shortPort } from "@/lib/timetable";
import WaveDivider from "@/components/WaveDivider";

export const metadata = {
  title: "Fast Boat Operators: Bali, Gilis, Nusa Penida & Lombok",
  description:
    "Every fast boat company with daily departures between Bali, the Gili Islands, Nusa Penida, Nusa Lembongan and Lombok: schedules, routes and fares compared side by side.",
  alternates: { canonical: "/indonesia/operators" },
};

export default function OperatorsIndex() {
  const ops = OPERATOR_NAMES.map((n) => operatorData(n));
  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "44px 20px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 2, marginBottom: 10 }}>INDONESIA</div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            Fast boat operators
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.8, margin: "12px auto 0", fontSize: 15, lineHeight: 1.6 }}>
            The companies running daily boats between Bali, the Nusa Islands, the Gili Islands and Lombok, busiest first. Tap one for its
            schedule, routes and fares. We&apos;re an independent comparison site, not any of these operators.
          </p>
        </div>
        <WaveDivider into="white" height={64} bleed={20} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "8px 20px 56px" }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ops.map((d) => (
            <Link
              key={d.name}
              href={operatorPageHref(d.name)}
              style={{ display: "block", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "16px 18px", textDecoration: "none", color: COLORS.ink }}
            >
              <h2 style={{ fontWeight: 700, fontSize: 17, color: COLORS.sea, marginBottom: 6 }}>{d.name} →</h2>
              <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                <strong>{d.count}</strong> daily {d.count === 1 ? "departure" : "departures"} on {plural(d.pairs.length, "route")}
                {d.minFare != null && <> · from <strong>A${d.minFare}</strong></>}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.65, marginTop: 4 }}>
                {d.ports.length > 5 ? `${d.ports.slice(0, 5).map(shortPort).join(", ")} and ${d.ports.length - 5} more` : joinList(d.ports.map(shortPort))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
