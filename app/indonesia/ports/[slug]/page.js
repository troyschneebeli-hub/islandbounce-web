import Link from "next/link";
import { notFound } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { SITE_URL } from "@/lib/site";
import { SAILINGS_CHECKED_TEXT } from "@/data/sailings";
import { routePageFor } from "@/data/routePages";
import { PORT_PHOTOS } from "@/data/portPhotos";
import { ALL_PORTS, PORT_PAGE_SLUGS, portBySlug, portShortName, portSlug, portTraffic } from "@/lib/portPages";
import { fmtDuration, shortPort, joinList, plural } from "@/lib/timetable";
import PlacePhoto from "@/components/PlacePhoto";
import WaveDivider from "@/components/WaveDivider";
import TwelveGoBookingWidget from "@/components/TwelveGoBookingWidget";
import SeaConditionsBadge from "@/components/SeaConditionsBadge";
import WhereToStay from "@/components/WhereToStay";

export const dynamicParams = false;

export function generateStaticParams() {
  return PORT_PAGE_SLUGS.map((slug) => ({ slug }));
}

const isBali = (port) => port.region === "bali";

export function generateMetadata({ params }) {
  const port = portBySlug(params.slug);
  if (!port) return {};
  const name = portShortName(port.name);
  const t = portTraffic(port.name);
  const places = joinList(t.departures.slice(0, 3).map((d) => shortPort(d.port)));
  const title = `${name} Harbour Fast Boats: Times, Routes & Getting There`;
  const description = `Fast boats from ${name}${places ? ` to ${places}` : ""}: ${plural(t.departuresCount, "daily departure")} and crossing times, plus how to get to the harbour. Compare and book.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/indonesia/ports/${params.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/indonesia/ports/${params.slug}`, ...(PORT_PHOTOS[port.name] ? { images: [{ url: PORT_PHOTOS[port.name].src, alt: PORT_PHOTOS[port.name].alt }] } : {}) },
  };
}

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 8 };
const para = { fontSize: 14.5, lineHeight: 1.7, color: COLORS.ink, opacity: 0.85, marginBottom: 10 };
const th = { textAlign: "left", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: COLORS.sea, padding: "8px 10px", borderBottom: `2px solid ${COLORS.foamLine}`, whiteSpace: "nowrap" };
const td = { padding: "10px", fontSize: 13.5, color: COLORS.ink, borderBottom: `1px solid ${COLORS.foamLine}`, verticalAlign: "top" };

// One table: a row per destination (or origin), linking to that route's page when there is one.
function TrafficTable({ rows, dir, portName, caption }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th style={th}>{dir === "from" ? "To" : "From"}</th>
            <th style={th}>Daily boats</th>
            <th style={th}>First – last</th>
            <th style={th}>Fastest crossing</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const page = dir === "from" ? routePageFor(portName, r.port) : routePageFor(r.port, portName);
            return (
              <tr key={r.port}>
                <td style={{ ...td, fontWeight: 600 }}>
                  {page ? (
                    <Link href={`/indonesia/routes/${page.slug}`} style={{ color: COLORS.sea, textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>
                      {shortPort(r.port)}
                    </Link>
                  ) : (
                    shortPort(r.port)
                  )}
                  <div style={{ fontWeight: 400, fontSize: 12, opacity: 0.65, marginTop: 2 }}>{r.operators.length > 2 ? `${r.operators.slice(0, 2).join(", ")} and ${r.operators.length - 2} more` : joinList(r.operators)}</div>
                </td>
                <td style={td}>{r.count}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>{r.first === r.last ? r.first : `${r.first} – ${r.last}`}</td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtDuration(r.minDur)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PortPage({ params }) {
  const port = portBySlug(params.slug);
  if (!port || !PORT_PAGE_SLUGS.includes(params.slug)) notFound();
  const name = portShortName(port.name);
  const t = portTraffic(port.name);
  const photo = PORT_PHOTOS[port.name];
  const url = `${SITE_URL}/indonesia/ports/${params.slug}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(port.address || `${port.name} harbour, Indonesia`)}`;
  const others = ALL_PORTS.filter((p) => p.name !== port.name && PORT_PAGE_SLUGS.includes(portSlug(p.name)));

  // The data sentence only; the port's own description sits under "Getting to" / "About" below.
  const lead =
    t.departuresCount > 0
      ? `${plural(t.departuresCount, "daily fast boat")} leave ${name} for ${joinList(t.departures.map((d) => shortPort(d.port)))}, run by ${plural(t.operators.length, "operator")}${t.arrivalsCount ? `, and ${t.arrivalsCount} arrive each day` : ""}. Times and crossing times are below.`
      : `${plural(t.arrivalsCount, "daily fast boat")} arrive at ${name}, run by ${plural(t.operators.length, "operator")}. Times and crossing times are below.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Indonesia", item: `${SITE_URL}/indonesia` },
        { "@type": "ListItem", position: 2, name: "Ports", item: `${SITE_URL}/indonesia/ports` },
        { "@type": "ListItem", position: 3, name: `${name} harbour`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BoatTerminal",
      name: `${port.name} harbour`,
      url,
      ...(port.address ? { address: port.address } : {}),
      geo: { "@type": "GeoCoordinates", latitude: port.lat, longitude: port.lng },
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
            <Link href="/indonesia/ports" style={{ color: "inherit", textDecoration: "none" }}>PORTS</Link>
          </nav>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            {name} harbour: fast boats and how to get there
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.85, maxWidth: 640, margin: "14px auto 0", fontSize: 15.5, lineHeight: 1.6 }}>{lead}</p>
        </div>
        {photo && (
          <div style={{ maxWidth: 760, margin: "0 auto 8px" }}>
            <PlacePhoto src={photo.src} alt={photo.alt} aspect="21 / 9" radius={16} priority />
          </div>
        )}
        <WaveDivider into="white" height={64} bleed={20} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 56px" }}>
          <section style={{ marginBottom: 36 }}>
            <h2 style={h2}>Book a boat from {name}</h2>
            <TwelveGoBookingWidget initialFrom={port.name} />
          </section>

          {t.departures.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={h2}>Daily boats from {name}</h2>
              <p style={{ ...para, fontSize: 13, opacity: 0.7 }}>
                Daily boats on the operators&apos; own timetables ({SAILINGS_CHECKED_TEXT}). The booking page shows live fares. Tap a
                destination for every departure time.
              </p>
              <TrafficTable rows={t.departures} dir="from" portName={port.name} caption={`Daily fast boats from ${name}`} />
            </section>
          )}

          {t.arrivals.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={h2}>Daily boats to {name}</h2>
              <TrafficTable rows={t.arrivals} dir="to" portName={port.name} caption={`Daily fast boats to ${name}`} />
            </section>
          )}

          <section style={{ marginBottom: 36 }}>
            <h2 style={h2}>{isBali(port) ? `Getting to ${name} harbour` : `About ${name} harbour`}</h2>
            <p style={para}>{port.blurb}</p>
            {port.address && <p style={{ ...para, fontSize: 13.5 }}><strong>Address:</strong> {port.address}</p>}
            <p style={para}>
              Check in at the time on your ticket, usually about an hour before departure, and allow extra time for traffic on the way.
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none" }}
            >
              Open in Google Maps →
            </a>
          </section>

          <section style={{ marginBottom: 36 }}>
            <h2 style={h2}>Sea conditions at {name} right now</h2>
            <SeaConditionsBadge lat={port.lat} lng={port.lng} />
          </section>

          <WhereToStay places={[port.name]} />

          <section style={{ marginBottom: 32 }}>
            <h2 style={h2}>Other ports</h2>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 10 }}>
              {others.map((p) => (
                <Link
                  key={p.name}
                  href={`/indonesia/ports/${portSlug(p.name)}`}
                  style={{ border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none" }}
                >
                  {portShortName(p.name)} →
                </Link>
              ))}
              <Link href="/indonesia/ports" style={{ color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 4px", textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>
                Ports map
              </Link>
            </div>
          </section>

          <p style={{ fontSize: 11.5, color: COLORS.ink, opacity: 0.6, lineHeight: 1.6 }}>
            We&apos;re a comparison site, not the operator. Times come from the operators&apos; own timetables and can change, so confirm on
            the booking page when you book.
          </p>
        </div>
      </div>
    </div>
  );
}
