import Link from "next/link";
import { notFound } from "next/navigation";
import { COLORS } from "@/lib/theme";
import { SITE_URL } from "@/lib/site";
import { SAILINGS, SAILINGS_CHECKED_TEXT } from "@/data/sailings";
import { routePageFor } from "@/data/routePages";
import { OPERATOR_NAMES, OPERATOR_SLUGS, operatorBySlug, operatorData, operatorPageHref } from "@/lib/operatorPages";
import { fmtDuration, joinList, plural, shortPort } from "@/lib/timetable";
import WaveDivider from "@/components/WaveDivider";
import RouteTimetable from "@/components/RouteTimetable";
import { RouteBookingProvider, BookingBox } from "@/components/RouteBooking";

// Re-render every 6 hours, like the route pages, so it follows the timetable without a redeploy.
export const revalidate = 21600;
export const dynamicParams = false;

export function generateStaticParams() {
  return OPERATOR_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const name = operatorBySlug(params.slug);
  if (!name) return {};
  const d = operatorData(name);
  const title = `${name} Schedule: Daily Times, Routes & Fares`;
  const description =
    `${name} fast boat schedule: ${plural(d.count, "daily departure")} between ${joinList(d.ports.map(shortPort).slice(0, 4))}${d.ports.length > 4 ? " and more" : ""}, ` +
    "with crossing times and fares. An independent comparison: see every time, then book on 12Go.";
  const path = `/indonesia/operators/${params.slug}`;
  return { title: { absolute: title }, description, alternates: { canonical: path }, openGraph: { title, description, url: `${SITE_URL}${path}` } };
}

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 8 };
const para = { fontSize: 14.5, lineHeight: 1.7, color: COLORS.ink, opacity: 0.85, marginBottom: 10 };
const pill = { border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13.5, padding: "8px 16px", borderRadius: 999, textDecoration: "none" };

// Each pair's heading in the timetable links to the route page comparing every operator on it.
function routeHref(from, to) {
  const page = routePageFor(from, to);
  return page ? `/indonesia/routes/${page.slug}` : null;
}

export default function OperatorPage({ params }) {
  const name = operatorBySlug(params.slug);
  if (!name) notFound();
  const d = operatorData(name);
  const url = `${SITE_URL}/indonesia/operators/${params.slug}`;
  const top = d.pairs[0];
  const minOf = (nums) => (nums.length ? Math.min(...nums) : null);

  // Other operators with daily boats on at least one of the same from -> to pairs: the comparison people came for.
  const pairKeys = new Set(d.pairs.map((p) => `${p.from}|${p.to}`));
  const rivals = OPERATOR_NAMES.filter((n) => n !== name && SAILINGS.some((s) => s.operator === n && pairKeys.has(`${s.from}|${s.to}`)));

  const lead =
    `We list ${plural(d.count, "daily departure")} with ${name} on ${plural(d.pairs.length, "route")} between ${joinList(d.ports.map(shortPort))}, ` +
    `leaving between ${d.earliest} and ${d.latest}.` +
    (d.confirmedCount === d.count
      ? ` All of them also match ${name}'s own timetable.`
      : d.confirmedCount
        ? ` ${d.confirmedCount} of them also match ${name}'s own timetable.`
        : "");

  const faqs = [
    {
      q: `What time does ${name} leave ${shortPort(top.from)} for ${shortPort(top.to)}?`,
      a: `${name}'s daily ${plural(top.count, "departure")} from ${shortPort(top.from)} to ${shortPort(top.to)} ${top.count === 1 ? "leaves" : "leave"} at ${joinList(top.times)}. Times change with the season, so confirm on the booking page for your date.`,
    },
    {
      q: `Where does ${name} go?`,
      a: `We list daily ${name} boats on ${plural(d.pairs.length, "route")}: ${d.pairs.map((p) => `${shortPort(p.from)} to ${shortPort(p.to)}`).join(", ")}.`,
    },
    {
      q: `How long is the ${name} crossing?`,
      a: `It depends on the route. ${d.pairs
        .filter((p) => p.minDur != null)
        .slice(0, 4)
        .map((p) => `${shortPort(p.from)} to ${shortPort(p.to)} takes from ${fmtDuration(p.minDur)}`)
        .join("; ")}. Boats that call at other islands on the way take longer.`,
    },
    {
      q: `How do I book ${name}?`,
      a: `Pick a route and date in the booking box on this page. It opens the booking page run with our partner 12Go, which lists ${name} next to the other operators on that route. The price is the same as booking with 12Go directly.`,
    },
    {
      q: `Is this ${name}'s official website?`,
      a: `No. IslandBounce is an independent comparison site. We list ${name}'s daily boats next to other operators so you can compare them.${d.site ? ` ${name}'s own website is ${d.site}.` : ""} For luggage rules, changes or refunds, contact the operator or check your ticket.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Indonesia", item: `${SITE_URL}/indonesia` },
        { "@type": "ListItem", position: 2, name: "Operators", item: `${SITE_URL}/indonesia/operators` },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  const bookingPairs = d.groups.map((g) => ({ from: g.from, to: g.to, minPrice: minOf(g.sailings.map((s) => s.fareAUD ?? s.price).filter((p) => p != null)) }));
  const stats = [
    { n: d.count, label: d.count === 1 ? "daily departure" : "daily departures" },
    { n: d.pairs.length, label: d.pairs.length === 1 ? "route" : "routes" },
    { n: fmtDuration(d.minDur), label: "fastest crossing" },
    ...(d.minFare != null ? [{ n: `A$${d.minFare}`, label: "from (adult)" }] : []),
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "40px 20px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", paddingBottom: 30, textAlign: "center" }}>
          <nav aria-label="Breadcrumb" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1.5, color: COLORS.skyDeep, marginBottom: 10 }}>
            <Link href="/indonesia" style={{ color: "inherit", textDecoration: "none" }}>INDONESIA</Link>
            {" / "}
            <Link href="/indonesia/operators" style={{ color: "inherit", textDecoration: "none" }}>OPERATORS</Link>
          </nav>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            {name} schedule: daily times and routes
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.85, maxWidth: 640, margin: "14px auto 0", fontSize: 15.5, lineHeight: 1.6 }}>{lead}</p>
        </div>
        <WaveDivider into="white" height={64} bleed={20} />
      </section>

      <div style={{ background: "white" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 56px" }}>
          <p style={{ ...para, fontSize: 13, background: COLORS.foam, border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: "10px 14px", opacity: 1 }}>
            IslandBounce is an independent comparison site, not {name}. We show {name}&apos;s daily boats next to the other operators on the
            same routes, and bookings go through our partner 12Go.
            {d.site && <> {name}&apos;s own website is <a href={`https://${d.site}`} target="_blank" rel="nofollow noopener noreferrer" style={{ color: COLORS.sea, fontWeight: 700 }}>{d.site}</a>.</>}
          </p>

          <RouteBookingProvider pairs={bookingPairs} defaultPair={{ from: top.from, to: top.to }}>
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, margin: "16px 0 12px", overflow: "hidden" }}>
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", borderRight: `1px solid ${COLORS.foamLine}`, borderBottom: `1px solid ${COLORS.foamLine}`, marginRight: -1, marginBottom: -1 }}>
                  <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.seaDeep, lineHeight: 1.1 }}>{s.n}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.skyDeep, letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <BookingBox />

            <section style={{ margin: "32px 0 40px" }}>
              <h2 style={h2}>Every daily {name} departure</h2>
              <p style={{ ...para, fontSize: 13, opacity: 0.7 }}>
                Boats on the booking page at least 6 days a week. Confirmed ones also match {name}&apos;s own timetable. Lowest adult fares,{" "}
                {SAILINGS_CHECKED_TEXT}. Times change, so confirm when you book. A boat that calls at several ports appears under each
                destination. Tap a route to compare every operator on it.
              </p>
              <RouteTimetable groups={d.groups} hrefFor={routeHref} />
            </section>
          </RouteBookingProvider>

          {rivals.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={h2}>Compare other operators on these routes</h2>
              <p style={para}>These companies also run daily boats on at least one of {name}&apos;s routes.</p>
              <div className="flex flex-wrap gap-3" style={{ marginTop: 10 }}>
                {rivals.map((n) => (
                  <Link key={n} href={operatorPageHref(n)} style={pill}>{n} →</Link>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginBottom: 44 }}>
            <h2 style={{ ...h2, marginBottom: 10 }}>Common questions</h2>
            {faqs.map((f, i) => (
              <div key={f.q} style={{ padding: "16px 0", borderTop: i === 0 ? "none" : `1px solid ${COLORS.foamLine}` }}>
                <h3 style={{ fontWeight: 700, fontSize: 15.5, color: COLORS.sea, marginBottom: 6 }}>{f.q}</h3>
                <p style={{ ...para, marginBottom: 0 }}>{f.a}</p>
              </div>
            ))}
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href="/indonesia/operators" style={pill}>All operators →</Link>
            <Link href="/indonesia/routes" style={pill}>All routes →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
