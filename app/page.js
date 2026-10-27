import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { SAILINGS, SAILINGS_CHECKED_TEXT } from "@/data/sailings";
import { ROUTE_PAGES, ROUTE_SLUGS } from "@/data/routePages";
import { PORT_PHOTOS } from "@/data/portPhotos";
import { selectSailings, summarize, fmtDuration, knownDurations } from "@/lib/timetable";
import { ALL_PORTS, PORT_PAGE_SLUGS, portShortName, portSlug } from "@/lib/portPages";
import WaveDivider from "@/components/WaveDivider";
import HeroBand from "@/components/HeroBand";
import PlacePhoto from "@/components/PlacePhoto";
import TwelveGoBookingWidget from "@/components/TwelveGoBookingWidget";
import IslandRequest from "@/components/IslandRequest";
import { GUIDES, GUIDE_SLUGS } from "@/data/guides";

export const metadata = {
  title: { absolute: "Bali to Gili, Nusa Penida & Lombok Fast Boats | IslandBounce" },
  description:
    "Compare daily fast boats from Bali to the Gili Islands, Nusa Penida, Nusa Lembongan and Lombok: departure times, crossing times and fares from every port, then book with our partner 12Go.",
  alternates: { canonical: "/" },
};

// Re-render every 6 hours so the route cards follow the timetable without a redeploy.
export const revalidate = 21600;

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.sea, marginBottom: 6 };

// The six route pages with the most daily boats, with their counts, lowest fare and fastest crossing.
function popularRoutes(today) {
  return ROUTE_SLUGS.map((slug) => {
    const route = ROUTE_PAGES[slug];
    const { active } = selectSailings(SAILINGS, route, today);
    const s = summarize(active);
    const fares = active.map((x) => x.fareAUD ?? x.price).filter((p) => p != null);
    const durs = knownDurations(active);
    return { route, count: s.count, minFare: fares.length ? Math.min(...fares) : null, fastest: durs.length ? Math.min(...durs) : null };
  })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export default function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const routes = popularRoutes(today);
  const operators = new Set(SAILINGS.map((s) => s.operator)).size;
  const routesWithBoats = ROUTE_SLUGS.filter((slug) => selectSailings(SAILINGS, ROUTE_PAGES[slug], today).active.length).length;
  const ports = ALL_PORTS.filter((p) => PORT_PAGE_SLUGS.includes(portSlug(p.name)));

  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "20px 16px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <HeroBand src="/images/indonesia/hero.jpg" alt="Boats moored around the yellow bridge between Nusa Lembongan and Nusa Ceningan" position="center 55%">
            <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", color: "white" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, opacity: 0.85, marginBottom: 10 }}>
                BALI · GILI ISLANDS · NUSA PENIDA · LOMBOK
              </div>
              <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 6vw, 58px)", lineHeight: 1.02, marginBottom: 14 }}>
                Bali to Gili, Nusa Penida &amp; Lombok fast boats
              </h1>
              <p style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 560, margin: "0 auto", opacity: 0.95 }}>
                Every daily departure, crossing time and fare from each port, side by side. Pick your boat, then book with our partner 12Go
                at the same price.
              </p>
            </div>
          </HeroBand>
        </div>

        <div style={{ maxWidth: 760, margin: "-36px auto 0", position: "relative", padding: "0 4px" }}>
          <TwelveGoBookingWidget />
        </div>

        <div
          className="flex flex-wrap justify-center gap-x-8 gap-y-2"
          style={{ maxWidth: 760, margin: "18px auto 0", paddingBottom: 26, fontSize: 13.5, color: COLORS.seaDeep }}
        >
          <span><strong>{SAILINGS.length}</strong> daily departures</span>
          <span><strong>{operators}</strong> operators</span>
          <span><strong>{routesWithBoats}</strong> route guides</span>
          <span style={{ opacity: 0.75 }}>Times {SAILINGS_CHECKED_TEXT}</span>
        </div>
        <WaveDivider into="white" height={64} bleed={16} />
      </section>

      <section style={{ background: "white", padding: "20px 16px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={h2}>Popular routes</h2>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 18 }}>
            Every daily boat on each route, with times, crossing times and fares. Ones tagged Confirmed also match the operator&apos;s own timetable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {routes.map(({ route, count, minFare, fastest }) => (
              <Link
                key={route.slug}
                href={`/indonesia/routes/${route.slug}`}
                style={{ display: "block", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "16px 18px", textDecoration: "none", color: COLORS.ink, background: "white" }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 6 }}>{route.name} →</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                  <strong>{count}</strong> daily {count === 1 ? "boat" : "boats"}
                  {fastest != null && <> · from {fmtDuration(fastest)}</>}
                  {minFare != null && <> · from <strong>A${minFare}</strong></>}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <Link href="/indonesia/routes" style={{ color: COLORS.coral, fontWeight: 700, fontSize: 14, textDecoration: "none", borderBottom: `1.5px solid ${COLORS.coral}` }}>
              See all {ROUTE_SLUGS.length} routes
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: "white", padding: "8px 16px 44px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Pick your route", blurb: "Search from any Bali port or island, either way, one way or return." },
            { n: "02", title: "Compare the boats", blurb: "Daily departures, crossing times and fares side by side, with Confirmed tags where the operator's own timetable agrees." },
            { n: "03", title: "Book with 12Go", blurb: "Our booking partner, at the same price and no extra cost to you." },
          ].map((s) => (
            <div key={s.n}>
              <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 32, color: COLORS.brass, marginBottom: 2 }}>{s.n}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, opacity: 0.7 }}>{s.blurb}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: "white" }}>
        <WaveDivider into={COLORS.foam} height={56} />
      </div>

      <section style={{ background: COLORS.foam, padding: "8px 16px 44px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={h2}>Harbour guides</h2>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 18 }}>Which boats leave each port, and how to get to the harbour.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ports.map((p) => (
              <Link key={p.name} href={`/indonesia/ports/${portSlug(p.name)}`} style={{ display: "block", textDecoration: "none", color: COLORS.ink }}>
                {PORT_PHOTOS[p.name] ? (
                  <PlacePhoto src={PORT_PHOTOS[p.name].src} alt={PORT_PHOTOS[p.name].alt} aspect="4 / 3" radius={12} sizes="(max-width: 640px) 50vw, 250px" />
                ) : (
                  <div style={{ aspectRatio: "4 / 3", borderRadius: 12, background: `linear-gradient(160deg, ${COLORS.sea} 0%, ${COLORS.seaDeep} 100%)` }} />
                )}
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.sea, marginTop: 6 }}>{portShortName(p.name)} →</div>
              </Link>
            ))}
          </div>

          <h2 style={{ ...h2, marginTop: 36 }}>Planning guides</h2>
          <div className="flex flex-wrap gap-3" style={{ marginTop: 10 }}>
            {GUIDE_SLUGS.map((s) => (
              <Link key={s} href={`/indonesia/guides/${s}`} style={{ border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none", background: "white" }}>
                {GUIDES[s].name} →
              </Link>
            ))}
            <Link href="/indonesia/operators" style={{ border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none", background: "white" }}>
              Compare boat operators →
            </Link>
          </div>

          <div style={{ marginTop: 32, background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "18px 20px" }} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea }}>Not sure which port to leave from?</div>
              <div style={{ fontSize: 13.5, opacity: 0.75 }}>Enter where you&apos;re staying and see the drive to each port plus the boats from it.</div>
            </div>
            <Link href="/indonesia" style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "11px 20px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap", textAlign: "center" }}>
              Open the trip planner →
            </Link>
          </div>

          <div style={{ maxWidth: 520, margin: "36px auto 0" }}>
            <IslandRequest />
          </div>
        </div>
      </section>
    </div>
  );
}
