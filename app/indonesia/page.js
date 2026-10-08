import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { REGIONS } from "@/data/regions";
import { BALI_PORTS } from "@/data/ports";
import { SAILINGS } from "@/data/timetables";
import RegionCard from "@/components/RegionCard";
import WaveDivider from "@/components/WaveDivider";
import PoppyCard from "@/components/PoppyCard";
import { ROUTE_PAGES, ROUTE_SLUGS } from "@/data/routePages";
import AverageConditionsWidget from "@/components/AverageConditionsWidget";
import TripPlanner from "@/components/TripPlanner";

export const metadata = {
  title: "Indonesia",
  description: "Bali, the Gili Islands, Nusa Penida, and Lombok — boat routes, ports, and things to do.",
  alternates: { canonical: "/indonesia" },
};

// Real counts from the verified timetable data (not the wider operator list).
const VERIFIED_OPERATORS = new Set(SAILINGS.map((s) => s.operator)).size;
const VERIFIED_ROUTES = new Set(SAILINGS.map((s) => `${s.from}|${s.to}`)).size;

const TOOLS = [
  { href: "/indonesia/ports", title: "All Ports", blurb: "Every harbor across Bali, the Gilis, Nusa & Lombok." },
];

const FAQS = [
  {
    q: "Do I need to book my ferry in advance?",
    a: "For popular routes (Sanur or Padang Bai to Gili Trawangan) in peak season, yes — the busiest morning departures can sell out a day or two ahead. Off-peak or less-traveled routes are usually fine to book the day before, or even the same morning.",
  },
  {
    q: "What happens if my boat gets cancelled?",
    a: "Rough seas (most common in wet season, roughly November to March) are the usual cause. Operators typically rebook you onto their next available departure at no extra cost — but policies vary, so check the specific operator's terms before you pay.",
  },
  {
    q: "Fast boat vs. public ferry — what's the difference?",
    a: "Fast boats are quicker and pricier, running specific tourist routes a few times a day. The public ferry (like Padang Bai → Lembar) is slower, much cheaper, and runs around the clock — a solid backup when fast boats are cancelled or fully booked.",
  },
  {
    q: "Does IslandBounce sell tickets directly?",
    a: "No — we compare real options and send you to the operator or booking platform to actually pay. IslandBounce may earn a commission when you book through links on this site, at no extra cost to you.",
  },
];

// FAQ structured data, built from the same list shown on the page.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function IndonesiaHub() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
      {/* Blue hero, matching the homepage's exact cover-page treatment
          instead of the deep-teal "in a destination" look used elsewhere. */}
      <section style={{ background: `linear-gradient(180deg, ${COLORS.skyLight} 0%, ${COLORS.sky} 100%)`, padding: "48px 20px 0" }}>
        <div style={{ maxWidth: 700, margin: "0 auto 18px" }}>
          <AverageConditionsWidget />
        </div>
        <div style={{ maxWidth: 700, margin: "0 auto", paddingBottom: 24, textAlign: "center" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.skyDeep, letterSpacing: 2, marginBottom: 10 }}>
            INDONESIA
          </div>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: COLORS.seaDeep, lineHeight: 1.05 }}>
            Bali, Gili Islands, Nusa & Lombok
          </h1>
          <p style={{ color: COLORS.seaDeep, opacity: 0.75, maxWidth: 520, margin: "12px auto 0", fontSize: 15 }}>
            Type where you're staying and where you're headed. See the real drive to every port that gets you there,
            and the boat crossing from each.
          </p>
        </div>

        {/* The Trip Planner, front and center under the heading. */}
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <TripPlanner />
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", paddingBottom: 34, textAlign: "center" }}>
          {/* Quick stats — real counts from the site's own data, not invented numbers. */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3" style={{ marginTop: 30 }}>
            {[
              { n: BALI_PORTS.length, label: "Bali ports tracked" },
              { n: VERIFIED_OPERATORS, label: "operators with verified timetables" },
              { n: VERIFIED_ROUTES, label: "routes with real times" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.seaDeep }}>{s.n}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.skyDeep, letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider into="white" height={70} />
      </section>

      {/* Other tools. The Trip Planner itself now lives in the hero above. */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen" style={{ background: "white", padding: "28px 20px 8px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ maxWidth: 440, margin: "0 auto" }}>
            {TOOLS.map((t) => (
              <PoppyCard key={t.href} href={t.href} title={t.title} blurb={t.blurb} width="100%" />
            ))}
          </div>
        </div>
      </section>

      {/* Popular routes — the actual target-keyword headings, right at the
          top of the page for both visitors and Google, not buried lower down. */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen" style={{ background: "white", padding: "8px 20px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 14 }}>
            Popular routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ maxWidth: 640, margin: "0 auto" }}>
            {ROUTE_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/indonesia/routes/${slug}`}
                style={{ display: "block", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: "12px 16px", textDecoration: "none", textAlign: "left" }}
              >
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.sea, margin: 0 }}>{ROUTE_PAGES[slug].name} →</h3>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Link href="/indonesia/routes" style={{ fontSize: 13, fontWeight: 700, color: COLORS.sea, textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>
              See all routes
            </Link>
          </div>
        </div>
      </section>

      <main className="relative left-1/2 right-1/2 -mx-[50vw] w-screen" style={{ background: "white", padding: "36px 20px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Seasonal note — plain text block, no box, sized and colored for real readability. */}
        <section style={{ maxWidth: 620, margin: "0 auto 44px" }} className="flex items-start gap-4">
          <div style={{ fontSize: 24, lineHeight: 1 }}>🌊</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: COLORS.sea, marginBottom: 5 }}>Worth knowing: sea conditions vary by season</div>
            <div style={{ fontSize: 14, color: COLORS.ink, opacity: 0.78, lineHeight: 1.65 }}>
              Roughly April to October tends to be drier with calmer seas — generally the more reliable window for
              fast boats. November to March brings the wet season, and rougher water means delays and
              cancellations are more common. Neither is a hard rule — check conditions closer to your trip, and
              keep the public ferry to Lembar in mind as a weather-reliable backup.
            </div>
          </div>
        </section>

        {/* FAQ — a plain divided list, sized and colored for real readability. */}
        <section style={{ marginBottom: 44 }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 14, textAlign: "center" }}>
            Common questions
          </h2>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {FAQS.map((f, i) => (
              <div key={f.q} style={{ padding: "18px 0", borderTop: i === 0 ? "none" : `1px solid ${COLORS.foamLine}` }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.sea, marginBottom: 6 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: COLORS.ink, opacity: 0.78, lineHeight: 1.65 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ paddingBottom: 44 }}>
          <div style={{ background: COLORS.sea, borderRadius: 14, padding: 28 }} className="flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brass, letterSpacing: 1.5, marginBottom: 6 }}>
                NEW · COMING SOON
              </div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                Can&apos;t justify a private charter alone?
              </div>
              <div style={{ color: COLORS.foam, opacity: 0.85, fontSize: 13.5, maxWidth: 420 }}>
                Split the cost with other travelers heading the same way. A $650 charter becomes ~$108/person, six
                ways.
              </div>
            </div>
            <Link
              href="/indonesia/split-charter"
              style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Learn more →
            </Link>
          </div>
        </section>
        </div>
      </main>

      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen" style={{ background: "white" }}>
        <WaveDivider into={COLORS.foam} height={56} />
      </div>

      {/* Faded green (foam) at the very bottom — matching the homepage's
          own closing section exactly. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen" style={{ background: COLORS.foam, padding: "8px 20px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: COLORS.ink, opacity: 0.65, marginBottom: 16, textAlign: "center" }}>
            IslandBounce covers more of Southeast Asia than just Indonesia
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: 16 }}>
            {REGIONS.map((r) => (
              <RegionCard key={r.slug} region={r} />
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: COLORS.sea, textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>
              Visit the main IslandBounce site →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
