import { notFound } from "next/navigation";
import { COLORS, PLATFORM_COLOR } from "@/lib/theme";
import { DESTINATIONS, ACTIVE_DESTINATIONS, EVENTIDE_URL } from "@/data/destinations";
import { buildTransportLink, buildActivityLink } from "@/lib/affiliateLinks";

export function generateStaticParams() {
  return ACTIVE_DESTINATIONS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const d = DESTINATIONS[params.slug];
  if (!d) return {};
  return {
    title: d.name,
    description: d.tagline,
  };
}

export default function GuidePage({ params }) {
  const d = DESTINATIONS[params.slug];
  if (!d || !ACTIVE_DESTINATIONS.includes(params.slug)) notFound();

  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.sea} 0%, ${COLORS.seaDeep} 100%)`, padding: "36px 20px 44px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: 2, marginBottom: 8 }}>{d.region}</div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.sand, lineHeight: 1.05 }}>
            {d.name}
          </h1>
          <p style={{ color: COLORS.foam, opacity: 0.85, maxWidth: 520, marginTop: 10, fontSize: 15 }}>{d.tagline}</p>
        </div>
      </section>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "36px 20px 56px" }}>
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.sea, marginBottom: 14 }}>
            Getting there
          </h2>
          <div className="flex flex-col gap-3">
            {d.transport.map((t, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3" style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: 16 }}>
                <div style={{ minWidth: 190 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.mode}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, opacity: 0.6 }}>
                    {t.from} → {t.to}
                  </div>
                </div>
                <div style={{ flex: 1, fontSize: 12.5, opacity: 0.75 }}>{t.note}</div>
                <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 17, minWidth: 70, textAlign: "right" }}>{t.price}</div>
                <a
                  href={t.direct ? t.direct.url : buildTransportLink(t.from, t.to)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: t.direct ? COLORS.coral : COLORS.sea,
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "8px 14px",
                    borderRadius: 6,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.direct ? `Book direct with ${t.direct.operator} →` : "Compare on 12Go →"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.sea, marginBottom: 14 }}>
            Things to do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {d.activities.map((a, i) => (
              <div key={i} style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 12, padding: 16 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "white", background: PLATFORM_COLOR[a.platform], borderRadius: 4, padding: "3px 7px" }}>
                  {a.platform.toUpperCase()}
                </span>
                <div style={{ fontWeight: 700, fontSize: 15, margin: "8px 0 4px" }}>{a.title}</div>
                <div style={{ fontSize: 12.5, opacity: 0.7, lineHeight: 1.5, marginBottom: 10 }}>{a.blurb}</div>
                <div className="flex items-center justify-between">
                  <div style={{ fontWeight: 700 }}>{a.price}</div>
                  <a
                    href={buildActivityLink(a.platform, `${a.title} ${d.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: COLORS.coral, color: "white", fontSize: 11.5, fontWeight: 700, padding: "7px 12px", borderRadius: 6, textDecoration: "none" }}
                  >
                    View →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {d.eventideSlug && (
          <section style={{ marginTop: 40 }}>
            <div style={{ background: "#12233B", borderRadius: 12, padding: 24 }} className="flex flex-col sm:flex-row items-center gap-5 sm:justify-between">
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#B8935A", letterSpacing: 1.5, marginBottom: 6 }}>
                  SKIP THE SHARED BOAT
                </div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Want your own boat instead?</div>
                <div style={{ color: "#C9D4DD", fontSize: 13, maxWidth: 380 }}>
                  Private day charters around the Gilis and Nusa Penida, arranged through Eventide, our sister site
                  for private charters and liveaboards.
                </div>
              </div>
              <a
                href={`${EVENTIDE_URL}/charters/${d.eventideSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#B8935A", color: "#12233B", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 4, textDecoration: "none", whiteSpace: "nowrap" }}
              >
                View private charters →
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
