import Link from "next/link";
import { notFound } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { SAILINGS, SAILINGS_CHECKED_TEXT } from "@/data/sailings";
import { ROUTE_PAGES, ROUTE_SLUGS, specificPagesIn } from "@/data/routePages";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { PORT_PHOTOS } from "@/data/portPhotos";
import { bookingLink } from "@/lib/bookingLink";
import { selectSailings, groupByPair, summarize, routeContext, lastChecked, isStale, fmtDuration, shortPort, durationMins, joinList, rangeText } from "@/lib/timetable";
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
  "sanur-to-nusa-penida": { src: "/images/indonesia/nusa-penida.jpg", alt: "Limestone cliffs and turquoise water on Nusa Penida" },
  "sanur-to-nusa-lembongan": { src: "/images/indonesia/lembongan.jpg", alt: "The yellow suspension bridge between Nusa Lembongan and Nusa Ceningan" },
  "bali-to-nusa-penida": { src: "/images/indonesia/nusa-penida-cliffs.jpg", alt: "Sea cliffs on the coast of Nusa Penida" },
  "bali-to-nusa-lembongan": { src: "/images/indonesia/lembongan.jpg", alt: "The yellow suspension bridge between Nusa Lembongan and Nusa Ceningan" },
  "nusa-lembongan-to-bali": { src: "/images/indonesia/sanur.jpg", alt: "Beachfront pavilions on Sanur beach in Bali" },
  "nusa-penida-to-bali": { src: "/images/indonesia/nusa-penida-cliffs.jpg", alt: "Sea cliffs on the coast of Nusa Penida" },
  "gili-islands-to-nusa-penida": { src: "/images/indonesia/nusa-penida.jpg", alt: "Limestone cliffs and turquoise water on Nusa Penida" },
  "gili-islands-to-nusa-lembongan": { src: "/images/indonesia/lembongan.jpg", alt: "The yellow suspension bridge between Nusa Lembongan and Nusa Ceningan" },
  "lombok-to-bali": { src: "/images/indonesia/lombok.jpg", alt: "A turquoise bay and pale sand beach on the Lombok coast" },
  "lombok-to-nusa-islands": { src: "/images/indonesia/lombok.jpg", alt: "A turquoise bay and pale sand beach on the Lombok coast" },
  "nusa-islands-to-lombok": { src: "/images/indonesia/lombok.jpg", alt: "A turquoise bay and pale sand beach on the Lombok coast" },
  "gili-meno-to-bali": { src: "/images/indonesia/meno.jpg", alt: "Aerial view of Gili Meno, its white beach and its inland salt lake" },
};

// Pages without their own photo (the one-port-to-one-port pages) use the destination port's photo.
const photoFor = (route) => ROUTE_PHOTOS[route.slug] || PORT_PHOTOS[route.toPorts[0]] || null;

const ALL_PORTS = [...BALI_PORTS, ...ISLAND_PORTS];

export function generateStaticParams() {
  return ROUTE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const route = ROUTE_PAGES[params.slug];
  if (!route) return {};
  const path = `/indonesia/routes/${route.slug}`;
  const photo = photoFor(route);
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
  // SAILINGS = confirmed daily sailings only, so every row, count and pick below comes from the same table.
  const { active } = selectSailings(SAILINGS, route, today);
  const summary = summarize(active);
  const hasData = summary.count > 0;
  const groups = groupByPair(active);
  const checked = lastChecked(active);
  const stale = isStale(checked, new Date().toISOString().slice(0, 10));
  const confirmedActive = active;
  const ctx = routeContext(route, active, SAILINGS_CHECKED_TEXT);
  // A page can have no confirmed daily sailings in a given week (an operator drops off the booking site, or a boat
  // isn't listed every day). The page stays up with live times instead of a table; the weekly report lists it.
  const lead = hasData
    ? route.lead(ctx)
    : `No boat on ${route.name} was on the booking page on at least six of the seven days when we ${SAILINGS_CHECKED_TEXT}. Choose your date below to see live times and fares on the booking page.`;
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
  // Trip data for confirmed sailings only; the 12Go-only listings aren't checked enough to mark up.
  // Times are Bali/Lombok local time (WITA, UTC+8).
  const wita = (t) => `${t}:00+08:00`;
  const tripsLd = confirmedActive.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${route.name} daily fast boat departures`,
        itemListElement: confirmedActive.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "BoatTrip",
            name: `${s.operator}: ${shortPort(s.from)} to ${shortPort(s.to)}, ${s.departs}`,
            provider: { "@type": "Organization", name: s.operator },
            departureBoatTerminal: { "@type": "BoatTerminal", name: s.from },
            arrivalBoatTerminal: { "@type": "BoatTerminal", name: s.to },
            departureTime: wita(s.departs),
            ...(s.arrives ? { arrivalTime: wita(s.arrives) } : {}),
          },
        })),
      }
    : null;
  const jsonLd = [breadcrumbLd, faqLd, tripsLd].filter(Boolean);

  // Summary strip and booking box: cheapest fare and fastest crossing across
  // every port pair on the page, plus each pair's own lowest fare for the picker.
  const minOf = (nums) => (nums.length ? Math.min(...nums) : null);
  const priced = (list) => list.map((s) => s.price).filter((p) => p != null);
  const lowestPrice = minOf(priced(active));
  const pairMins = summary.pairs.map((p) => p.min).filter((m) => m != null);
  const pairMaxes = summary.pairs.map((p) => p.max).filter((m) => m != null);
  const fastestMin = pairMins.length ? Math.min(...pairMins) : null;
  const stats = hasData
    ? [
        ...(lowestPrice != null ? [{ n: `A$${lowestPrice}`, label: "from (adult)" }] : []),
        { n: fmtDuration(fastestMin), label: "fastest crossing" },
        { n: summary.count, label: summary.count === 1 ? "departure" : "departures" },
        { n: summary.operators.length, label: summary.operators.length === 1 ? "operator" : "operators" },
      ]
    : [];
  // With no confirmed sailings the booking box still works, for the page's main pair.
  const bookingPairs = hasData
    ? groups.map((g) => ({ from: g.from, to: g.to, minPrice: minOf(priced(g.sailings)) }))
    : [{ from: route.bookFrom, to: route.bookTo, minPrice: null }];

  // Summary card above the table, from the same confirmed daily rows.
  const slowestMin = pairMaxes.length ? Math.max(...pairMaxes) : null;
  const summaryCard = hasData
    ? [
        { n: summary.count, label: summary.count === 1 ? "daily departure" : "daily departures" },
        { n: `${summary.earliest}–${summary.latest}`, label: "earliest to latest" },
        { n: summary.operators.length, label: summary.operators.length === 1 ? "operator" : "operators" },
        { n: rangeText(fastestMin, slowestMin), label: "crossing time" },
        ...(lowestPrice != null ? [{ n: `From A$${lowestPrice}`, label: "lowest adult fare" }] : []),
      ]
    : [];

  // "Our pick": fastest, cheapest and earliest/latest, all computed from the
  // listed sailings. Ties list every operator that matches.
  const multiPair = summary.pairs.length > 1;
  const where = (s) => (multiPair ? ` · ${shortPort(s.from)} → ${shortPort(s.to)}` : "");
  const opsFor = (list) => joinList([...new Set(list.map((s) => s.operator))]);
  const pickRows = [];
  if (hasData) {
    const basis = active;
    const basisDurs = basis.map((s) => durationMins(s.departs, s.arrives)).filter((d) => d != null);
    const fastestPick = basisDurs.length ? Math.min(...basisDurs) : null;
    const fastest = basis.filter((s) => durationMins(s.departs, s.arrives) === fastestPick);
    if (fastest.length) pickRows.push({ label: "Fastest", value: `${opsFor(fastest)}, ${fmtDuration(fastestPick)}`, note: where(fastest[0]) });
    if (lowestPrice != null) {
      const cheapest = active.filter((s) => s.price === lowestPrice);
      pickRows.push({ label: "Cheapest", value: `${opsFor(cheapest)}, from A$${lowestPrice}`, note: where(cheapest[0]) });
    }
    const first = active.filter((s) => s.departs === summary.earliest);
    const last = active.filter((s) => s.departs === summary.latest);
    pickRows.push({
      label: "Earliest / latest departure",
      value: `${summary.earliest} (${opsFor(first)}) / ${summary.latest} (${opsFor(last)})`,
      note: "",
    });
  }

  // On a group page ("Bali to the Gili Islands"), links down to each port-to-port page it covers.
  const byPort = specificPagesIn(route);
  const related = route.related.map((slug) => ROUTE_PAGES[slug]).filter((r) => r && !byPort.includes(r));
  const photo = photoFor(route);

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
        {photo && (
          <div style={{ maxWidth: 760, margin: "0 auto 8px" }}>
            <PlacePhoto src={photo.src} alt={photo.alt} aspect="21 / 9" radius={16} priority />
          </div>
        )}
        <WaveDivider into="white" height={64} bleed={20} />
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
          {hasData ? (
            <BookingBox />
          ) : (
            // No confirmed daily sailings: no time table, just live times on the booking page.
            <section style={{ marginBottom: 32 }}>
              <h2 style={h2}>Check live times</h2>
              <p style={para}>
                We didn&apos;t find a boat on {route.name} that runs every day in our latest check. Boats may still be running on
                your date: pick a date to see the boats, times and fares on the booking page.
              </p>
              <BookingBox />
            </section>
          )}
          {pickRows.length > 0 && (
            <section style={{ marginBottom: 32, border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "16px 18px", background: COLORS.foam }}>
              <h2 style={{ ...h2, fontSize: 20, marginBottom: 10 }}>Our pick</h2>
              <dl style={{ margin: 0 }}>
                {pickRows.map((r, i) => (
                  <div
                    key={r.label}
                    className="flex flex-col sm:flex-row sm:gap-4"
                    style={{ padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid ${COLORS.foamLine}` }}
                  >
                    <dt style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 0.5, minWidth: 190, paddingTop: 2 }}>
                      {r.label.toUpperCase()}
                    </dt>
                    <dd style={{ margin: 0, fontSize: 14.5, color: COLORS.ink, fontWeight: 600 }}>
                      {r.value}
                      {r.note && <span style={{ fontWeight: 400, opacity: 0.65, fontSize: 13 }}>{r.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              {route.ourPick && <p style={{ ...para, marginTop: 10, marginBottom: 0 }}>{route.ourPick}</p>}
            </section>
          )}
          {hasData && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={h2}>Daily departures</h2>
            {summaryCard.length > 0 && (
              <div style={{ border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "14px 16px", margin: "12px 0 16px", background: "white" }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3">
                  {summaryCard.map((s) => (
                    <div key={s.label} style={{ textAlign: "center", padding: "0 6px" }}>
                      <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 21, color: COLORS.seaDeep, lineHeight: 1.15 }}>{s.n}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.skyDeep, letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <ul className="flex flex-wrap gap-2" style={{ listStyle: "none", padding: 0, margin: "14px 0 0", justifyContent: "center" }} aria-label="Operators">
                  {summary.operators.map((op) => (
                    <li key={op} style={{ fontSize: 12, fontWeight: 600, color: COLORS.sea, background: COLORS.foam, border: `1px solid ${COLORS.foamLine}`, borderRadius: 999, padding: "3px 10px" }}>
                      {op}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p style={{ ...para, fontSize: 13, opacity: 0.7 }}>
              Boats on the booking page at least 6 days a week. Confirmed ones also match the operator&apos;s own timetable. Lowest adult
              fares, {SAILINGS_CHECKED_TEXT}. Times change, so confirm when you book.
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
            {/* One open table: every row is in the visible HTML for search engines. */}
            <RouteTimetable groups={groups} />
            {summary.operators.length <= 2 && (
              <p style={{ ...para, fontSize: 12.5, opacity: 0.75, marginTop: 10 }}>
                This table lists the daily boats we could confirm. Others may run this route too, so use the booking page to see
                every option for your date.
              </p>
            )}
          </section>
          )}
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

          {byPort.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={h2}>{route.name} by port</h2>
              <p style={para}>Each trip on its own page, with just its boats, crossing times and fares.</p>
              <div className="flex flex-wrap gap-3" style={{ marginTop: 10 }}>
                {byPort.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/indonesia/routes/${r.slug}`}
                    style={{ border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none" }}
                  >
                    {r.name} →
                  </Link>
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
        </div>
      </div>
    </div>
  );
}
