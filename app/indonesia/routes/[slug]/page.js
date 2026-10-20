import Link from "next/link";
import { notFound } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { SAILINGS } from "@/data/sailings";
import { ROUTE_PAGES, ROUTE_SLUGS } from "@/data/routePages";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { bookingLink } from "@/lib/bookingLink";
import { selectSailings, groupByPair, summarize, describeDurations, lastChecked, formatDate, isStale, fmtDuration, shortPort } from "@/lib/timetable";
import PlacePhoto from "@/components/PlacePhoto";
import WaveDivider from "@/components/WaveDivider";
import RouteTimetable from "@/components/RouteTimetable";
import { RouteBookingProvider, BookingBox } from "@/components/RouteBooking";
import SeaConditionsBadge from "@/components/SeaConditionsBadge";

// Re-render every 6 hours so "which season is running today" stays correct
// without a redeploy.
export const revalidate = 21600;
export const dynamicParams = false;

// One hero photo per route page, by where the route goes.
const ROUTE_PHOTOS = {
  "gili-trawangan-to-bali": { src: "/images/indonesia/gilis.jpg", alt: "Aerial view of a Gili island ringed by turquoise water" },
  "bali-to-gili-islands": { src: "/images/indonesia/gilis.jpg", alt: "Aerial view of a Gili island ringed by turquoise water" },
  "gili-air-to-bali": { src: "/images/indonesia/harbor.jpg", alt: "Aerial view of Padang Bai harbour in Bali with ferries at the pier" },
  "nusa-penida-to-gili-islands": { src: "/images/indonesia/nusa-penida.jpg", alt: "Limestone cliffs and turquoise water on Nusa Penida" },
  "nusa-lembongan-to-gili-islands": { src: "/images/indonesia/lembongan.jpg", alt: "The yellow suspension bridge between Nusa Lembongan and Nusa Ceningan" },
  "padang-bai-to-gili-trawangan": { src: "/images/indonesia/harbor.jpg", alt: "Aerial view of Padang Bai harbour in Bali with ferries at the pier" },
  "padang-bai-to-gili-air": { src: "/images/indonesia/gili-air.jpg", alt: "Aerial panorama of Gili Air and its turquoise shallows" },
  "sanur-to-gili-trawangan": { src: "/images/indonesia/sanur.jpg", alt: "Beachfront pavilions on Sanur beach in Bali" },
  "sanur-to-gili-air": { src: "/images/indonesia/gili-air.jpg", alt: "Aerial panorama of Gili Air and its turquoise shallows" },
  "bali-to-lombok-ferry": { src: "/images/indonesia/lombok.jpg", alt: "A turquoise bay and pale sand beach on the Lombok coast" },
};

const ALL_PORTS = [...BALI_PORTS, ...ISLAND_PORTS];

export function generateStaticParams() {
  return ROUTE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const route = ROUTE_PAGES[params.slug];
  if (!route) return {};
  const path = `/indonesia/routes/${route.slug}`;
  const photo = ROUTE_PHOTOS[route.slug];
  return {
    title: { absolute: route.metaTitle },
    description: route.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: route.metaTitle,
      description: route.metaDescription,
      url: `${SITE_URL}${path}`,
      siteName: "IslandBounce",
      type: "website",
      ...(photo ? { images: [{ url: photo.src, alt: photo.alt }] } : {}),
    },
  };
}

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 8 };
const para = { fontSize: 14.5, lineHeight: 1.7, color: COLORS.ink, opacity: 0.85, marginBottom: 10 };

export default function RoutePage({ params }) {
  const route = ROUTE_PAGES[params.slug];
  if (!route) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const { active, upcoming } = selectSailings(SAILINGS, route, today);
  const summary = summarize(active);
  const hasData = summary.count > 0;
  const groups = groupByPair(active);
  const upcomingGroups = groupByPair(upcoming);
  const checked = lastChecked([...active, ...upcoming]);
  const stale = isStale(checked, new Date().toISOString().slice(0, 10));
  const ctx = { ...summary, durations: hasData ? describeDurations(summary, route) : "" };
  const lead = hasData
    ? route.lead(ctx)
    : "We're adding a current timetable for this route. Check back soon, or compare options on 12Go below.";
  const faqs = hasData ? route.faqs(ctx) : [];

  const url = `${SITE_URL}/indonesia/routes/${route.slug}`;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Indonesia", item: `${SITE_URL}/indonesia` },
      { "@type": "ListItem", position: 2, name: "Routes", item: `${SITE_URL}/indonesia/routes` },
      { "@type": "ListItem", position: 3, name: route.name, item: url },
    ],
  };
  const faqLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;
  const jsonLd = [breadcrumbLd, faqLd].filter(Boolean);

  // Summary strip and booking box: cheapest fare and fastest crossing across
  // every port pair on the page, plus each pair's own lowest fare for the picker.
  const minOf = (nums) => (nums.length ? Math.min(...nums) : null);
  const priced = (list) => list.map((s) => s.price).filter((p) => p != null);
  const lowestPrice = minOf(priced(active));
  const fastestMin = hasData ? Math.min(...summary.pairs.map((p) => p.min)) : null;
  const stats = hasData
    ? [
        ...(lowestPrice != null ? [{ n: `A$${lowestPrice}`, label: "from (adult)" }] : []),
        { n: fmtDuration(fastestMin), label: "fastest crossing" },
        { n: summary.count, label: summary.count === 1 ? "departure" : "departures" },
        { n: summary.operators.length, label: summary.operators.length === 1 ? "operator" : "operators" },
      ]
    : [];
  const bookingPairs = groups.map((g) => ({ from: g.from, to: g.to, minPrice: minOf(priced(g.sailings)) }));

  const related = route.related.map((slug) => ROUTE_PAGES[slug]).filter(Boolean);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "40px 20px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <nav aria-label="Breadcrumb" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: COLORS.skyDeep, marginBottom: 10 }}>
            <Link href="/indonesia" style={{ color: "inherit", textDecoration: "none" }}>INDONESIA</Link>
            {" / "}
            <Link href="/indonesia/routes" style={{ color: "inherit", textDecoration: "none" }}>ROUTES</Link>
          </nav>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            {route.h1}
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.85, maxWidth: 640, margin: "14px auto 0", fontSize: 15.5, lineHeight: 1.6 }}>{lead}</p>
        </div>
        {ROUTE_PHOTOS[route.slug] && (
          <div style={{ maxWidth: 760, margin: "0 auto 8px" }}>
            <PlacePhoto src={ROUTE_PHOTOS[route.slug].src} alt={ROUTE_PHOTOS[route.slug].alt} aspect="21 / 9" radius={16} priority />
          </div>
        )}
        <WaveDivider into="white" height={64} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 56px" }}>
          <RouteBookingProvider pairs={bookingPairs} defaultPair={{ from: route.bookFrom, to: route.bookTo }}>
          {stats.length > 0 && (
            <div
              className="grid grid-cols-2 sm:grid-cols-4"
              style={{ border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, marginBottom: 12, overflow: "hidden", background: "white" }}
            >
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", borderRight: `1px solid ${COLORS.foamLine}`, borderBottom: `1px solid ${COLORS.foamLine}`, marginRight: -1, marginBottom: -1 }}>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.seaDeep, lineHeight: 1.1 }}>{s.n}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.skyDeep, letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {hasData && <BookingBox />}
          <section style={{ marginBottom: 40 }}>
            <h2 style={h2}>{route.name} fast boat times</h2>
            <p style={{ ...para, fontSize: 13, opacity: 0.7 }}>
              Times and fares are guides taken from the booking site{checked ? ` and were last checked ${formatDate(checked)}` : ""}. Fares are the
              lowest adult price listed. Please check in 1 hour before departure. Operators change schedules and prices, so confirm on the booking page
              when you book.
            </p>
            {stale && (
              <p style={{ ...para, fontSize: 13, background: "#FFF2CC", color: "#8A5A00", borderRadius: 8, padding: "8px 12px" }}>
                These times were last updated a while ago and may have changed. Please confirm with the operator before you travel.
              </p>
            )}
            <p style={{ ...para, fontSize: 12.5, opacity: 0.75 }}>
              Spotted a time that&apos;s wrong?{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Timetable correction: ${route.name}`)}`}
                style={{ color: COLORS.sea, fontWeight: 700 }}
              >
                Tell us
              </a>{" "}
              and we&apos;ll fix it.
            </p>
            {hasData ? (
              <>
                <RouteTimetable groups={groups} />
                {summary.operators.length <= 2 && (
                  <p style={{ ...para, fontSize: 12.5, opacity: 0.75, marginTop: 10 }}>
                    This table lists the operators the booking site showed when we last checked. Others may run this route too, so
                    use the booking page below to see every option for your date.
                  </p>
                )}
              </>
            ) : (
              <p style={para}>There&apos;s nothing to show yet. Check back soon, or compare options on 12Go below.</p>
            )}
            {upcomingGroups.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: COLORS.sea, marginBottom: 4 }}>Starting soon</h3>
                <p style={{ ...para, fontSize: 13, opacity: 0.7 }}>These run in a later season and aren&apos;t operating yet.</p>
                <RouteTimetable groups={upcomingGroups} />
              </div>
            )}
          </section>
          </RouteBookingProvider>

          <section style={{ marginBottom: 44, textAlign: "center" }}>
            <a
              href={bookingLink(route.bookFrom, route.bookTo)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              style={{ display: "inline-block", background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}
            >
              Check availability and book →
            </a>
            <p style={{ fontSize: 11.5, color: COLORS.ink, opacity: 0.6, marginTop: 10 }}>
              We're a comparison site, not the operator — schedules, boat condition and on-the-day organization are
              the operator's responsibility, not ours.
            </p>
          </section>

          <section style={{ marginBottom: 44 }}>
            <h2 style={h2}>Sea conditions right now</h2>
            <p style={para}>
              Rough seas are the main reason fast boats are delayed or cancelled. These estimates come from wave-height forecasts at each port. They&apos;re a
              guide, not a promise: the operator and the port authority decide on the day.
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-4" style={{ marginTop: 14 }}>
              {route.conditionPorts.map((name) => {
                const port = ALL_PORTS.find((p) => p.name === name);
                if (!port) return null;
                return (
                  <div key={name}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.ink, marginBottom: 6 }}>{shortPort(name)}</div>
                    <SeaConditionsBadge lat={port.lat} lng={port.lng} showDisclaimer={false} />
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11.5, color: COLORS.ink, opacity: 0.55, fontStyle: "italic", marginTop: 12 }}>
              Based on published wave-height thresholds for fast boats and ferries in Indonesia. Not a guarantee. Always check with your operator before you travel.
            </p>
          </section>

          {route.sections.map((sec) => (
            <section key={sec.heading} style={{ marginBottom: 36 }}>
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

          {faqs.length > 0 && (
            <section style={{ marginBottom: 44 }}>
              <h2 style={{ ...h2, marginBottom: 10 }}>Common questions</h2>
              <div>
                {faqs.map((f, i) => (
                  <div key={f.q} style={{ padding: "16px 0", borderTop: i === 0 ? "none" : `1px solid ${COLORS.foamLine}` }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15.5, color: COLORS.sea, marginBottom: 6 }}>{f.q}</h3>
                    <p style={{ ...para, marginBottom: 0 }}>{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginBottom: 32 }}>
            <h2 style={h2}>Related routes</h2>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 10 }}>
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/indonesia/routes/${rel.slug}`}
                  style={{ border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none" }}
                >
                  {rel.name} →
                </Link>
              ))}
              <Link href="/indonesia/routes" style={{ color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 4px", textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>
                All routes
              </Link>
            </div>
          </section>

          <p style={{ fontSize: 12, color: COLORS.ink, opacity: 0.6, lineHeight: 1.6 }}>
            How we compile this: we read the departures listed on the booking site, date-stamp them, and refresh them about once a month.
          </p>
          {/* Room for the booking button pinned to the bottom of the screen on phones. */}
          {hasData && <div className="md:hidden" style={{ height: 72 }} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
