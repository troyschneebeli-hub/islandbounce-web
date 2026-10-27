import Link from "next/link";
import { notFound } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { SITE_URL } from "@/lib/site";
import { SAILINGS_CHECKED_TEXT } from "@/data/sailings";
import { routePageFor } from "@/data/routePages";
import { GUIDES, GUIDE_SLUGS, boatStats } from "@/data/guides";
import { fmtDuration, shortPort } from "@/lib/timetable";
import WaveDivider from "@/components/WaveDivider";
import TwelveGoBookingWidget from "@/components/TwelveGoBookingWidget";

// Re-render every 6 hours so the boat numbers follow the timetable without a redeploy.
export const revalidate = 21600;
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const g = GUIDES[params.slug];
  if (!g) return {};
  const path = `/indonesia/guides/${g.slug}`;
  return {
    title: { absolute: g.metaTitle },
    description: g.metaDescription,
    alternates: { canonical: path },
    openGraph: { title: g.metaTitle, description: g.metaDescription, url: `${SITE_URL}${path}`, type: "article" },
  };
}

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 8 };
const para = { fontSize: 14.5, lineHeight: 1.7, color: COLORS.ink, opacity: 0.85, marginBottom: 10 };
const th = { textAlign: "left", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: COLORS.sea, padding: "8px 10px", borderBottom: `2px solid ${COLORS.foamLine}`, whiteSpace: "nowrap" };
const td = { padding: "10px", fontSize: 13.5, color: COLORS.ink, borderBottom: `1px solid ${COLORS.foamLine}`, verticalAlign: "top" };
const pill = { border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none" };

export default function GuidePage({ params }) {
  const g = GUIDES[params.slug];
  if (!g) notFound();
  const stats = boatStats(g.compare.fromPorts, g.compare.toPorts);
  const sections = g.sections();
  const faqs = g.faqs();
  const url = `${SITE_URL}/indonesia/guides/${g.slug}`;
  const others = GUIDE_SLUGS.filter((s) => s !== g.slug).map((s) => GUIDES[s]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Indonesia", item: `${SITE_URL}/indonesia` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/indonesia/guides` },
        { "@type": "ListItem", position: 3, name: g.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "40px 20px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <nav aria-label="Breadcrumb" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: COLORS.skyDeep, marginBottom: 10 }}>
            <Link href="/indonesia" style={{ color: "inherit", textDecoration: "none" }}>INDONESIA</Link>
            {" / "}
            <Link href="/indonesia/guides" style={{ color: "inherit", textDecoration: "none" }}>GUIDES</Link>
          </nav>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 42px)", color: COLORS.seaDeep, lineHeight: 1.08 }}>
            {g.h1}
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.85, maxWidth: 640, margin: "14px auto 0", fontSize: 15.5, lineHeight: 1.6 }}>{g.intro}</p>
        </div>
        <WaveDivider into="white" height={64} bleed={20} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "16px 20px 56px" }}>
          {sections.map((sec) => (
            <section key={sec.heading} style={{ marginBottom: 32 }}>
              <h2 style={h2}>{sec.heading}</h2>
              {sec.paragraphs.map((text, i) => (
                <p key={i} style={para}>{text}</p>
              ))}
              {sec.cta && (
                <Link href={sec.cta.href} style={{ fontSize: 14, fontWeight: 700, color: COLORS.coral, textDecoration: "none", borderBottom: `1.5px solid ${COLORS.coral}` }}>
                  {sec.cta.label}
                </Link>
              )}
            </section>
          ))}

          {stats.pairs.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={h2}>{g.compare.title}</h2>
              <p style={{ ...para, fontSize: 13, opacity: 0.7 }}>
                Boats on the booking page at least 6 days a week, {SAILINGS_CHECKED_TEXT}. Tap a route for every departure time.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                  <caption className="sr-only">{g.compare.title}</caption>
                  <thead>
                    <tr>
                      <th style={th}>Route</th>
                      <th style={th}>Daily boats</th>
                      <th style={th}>First – last</th>
                      <th style={th}>Fastest crossing</th>
                      <th style={th}>From (1 adult)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pairs.map((p) => {
                      const page = routePageFor(p.from, p.to);
                      const label = `${shortPort(p.from)} → ${shortPort(p.to)}`;
                      return (
                        <tr key={`${p.from}|${p.to}`}>
                          <td style={{ ...td, fontWeight: 600 }}>
                            {page ? (
                              <Link href={`/indonesia/routes/${page.slug}`} style={{ color: COLORS.sea, textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>{label}</Link>
                            ) : (
                              label
                            )}
                          </td>
                          <td style={td}>{p.count}</td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{p.earliest === p.latest ? p.earliest : `${p.earliest} – ${p.latest}`}</td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDuration(p.minDur)}</td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{p.minFare != null ? `A$${p.minFare}` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section style={{ marginBottom: 36 }}>
            <h2 style={h2}>Check times for your date</h2>
            <TwelveGoBookingWidget initialFrom={g.compare.fromPorts[0]} />
            <p style={{ ...para, marginTop: 14 }}>
              Not sure which port is closest to your hotel?{" "}
              <Link href={`/indonesia?to=${encodeURIComponent(g.planner)}`} style={{ color: COLORS.coral, fontWeight: 700 }}>
                Open the Trip Planner
              </Link>{" "}
              for real drive times to every port.
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2 style={{ ...h2, marginBottom: 10 }}>Common questions</h2>
            {faqs.map((f, i) => (
              <div key={f.q} style={{ padding: "16px 0", borderTop: i === 0 ? "none" : `1px solid ${COLORS.foamLine}` }}>
                <h3 style={{ fontWeight: 700, fontSize: 15.5, color: COLORS.sea, marginBottom: 6 }}>{f.q}</h3>
                <p style={{ ...para, marginBottom: 0 }}>{f.a}</p>
              </div>
            ))}
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={h2}>More guides</h2>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 10 }}>
              {others.map((o) => (
                <Link key={o.slug} href={`/indonesia/guides/${o.slug}`} style={pill}>{o.name} →</Link>
              ))}
            </div>
          </section>

          <p style={{ fontSize: 11.5, color: COLORS.ink, opacity: 0.6, lineHeight: 1.6 }}>
            Drive times are rough ranges and change with traffic. We&apos;re a comparison site, not the operator, so confirm times on the booking page when you book.
          </p>
        </div>
      </div>
    </div>
  );
}
