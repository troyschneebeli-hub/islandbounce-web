import Link from "next/link";
import { COLORS } from "@/lib/theme";
// Booking links only (no times), so it lists every pair the planner knows, not just confirmed ones.
import { PLANNER_SAILINGS as SAILINGS } from "@/data/sailings";
import { routePageFor } from "@/data/routePages";
import { bookingLink } from "@/lib/bookingLink";

// Every route pair the 12Go sailings cover, grouped by where it leaves from.
// Pairs come from data/sailings.js (12Go only), so this list grows
// automatically when the 12Go capture is rebuilt. Lombok ports we no longer
// serve are left out.
const EXCLUDED = ["Senggigi (Lombok)", "Lembar (Lombok)", "Gili Gede"];
const ORIGIN_ORDER = [
  "Padang Bai", "Sanur", "Serangan", "Benoa / Nusa Dua", "Kusamba",
  "Nusa Penida", "Nusa Lembongan",
  "Gili Trawangan", "Gili Air", "Gili Meno",
  "Bangsal (Lombok)",
];
const DEST_ORDER = [
  "Gili Trawangan", "Gili Air", "Gili Meno", "Bangsal (Lombok)",
  "Nusa Penida", "Nusa Lembongan",
  "Padang Bai", "Sanur", "Serangan", "Benoa / Nusa Dua", "Kusamba",
];

// The most specific route page for the pair, e.g. Sanur -> Gili Air links to "Sanur to Gili Air",
// not "Bali to the Gili Islands".
const pageFor = routePageFor;

export function allRoutePairs() {
  const seen = new Map();
  for (const s of SAILINGS) {
    if (EXCLUDED.includes(s.from) || EXCLUDED.includes(s.to)) continue;
    const k = `${s.from}|${s.to}`;
    seen.set(k, { from: s.from, to: s.to });
  }
  const byOrigin = {};
  for (const p of seen.values()) (byOrigin[p.from] = byOrigin[p.from] || []).push(p);
  return ORIGIN_ORDER.filter((o) => byOrigin[o]).map((o) => ({
    origin: o,
    dests: byOrigin[o].sort((a, b) => DEST_ORDER.indexOf(a.to) - DEST_ORDER.indexOf(b.to)),
  }));
}

const short = (n) => n.replace(" (Lombok)", "");

export default function AllRoutesDirectory() {
  const groups = allRoutePairs();
  const total = groups.reduce((n, g) => n + g.dests.length, 0);
  return (
    <section aria-labelledby="all-routes" style={{ marginTop: 20 }}>
      <h2 id="all-routes" style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 6 }}>
        {total} routes by departure port
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink, opacity: 0.8, maxWidth: 640, marginBottom: 20 }}>
        Tap a destination for its daily times, or “Check prices” to see operators and fares for your date. Not every boat runs every
        day, so if a route shows nothing for your date, try another day.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.origin} style={{ border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: "14px 16px", background: "white" }}>
            <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.seaDeep, marginBottom: 8 }}>
              From {short(g.origin)}
            </h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {g.dests.map((d) => {
                const page = pageFor(d.from, d.to);
                return (
                  <li key={d.to} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 0", borderTop: `1px solid ${COLORS.foamLine}`, fontSize: 14 }}>
                    {page ? (
                      <Link href={`/indonesia/routes/${page.slug}`} style={{ color: COLORS.ink, textDecoration: "none" }}>
                        → {short(d.to)}
                      </Link>
                    ) : (
                      <span style={{ color: COLORS.ink }}>→ {short(d.to)}</span>
                    )}
                    <span style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {page && (
                        <Link href={`/indonesia/routes/${page.slug}`} style={{ color: COLORS.sea, fontWeight: 600, fontSize: 13 }}>
                          Times
                        </Link>
                      )}
                      <a
                        href={bookingLink(d.from, d.to)}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 12.5, padding: "5px 11px", borderRadius: 999, textDecoration: "none" }}
                      >
                        Check prices
                      </a>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
