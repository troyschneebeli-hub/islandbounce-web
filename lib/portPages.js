// Port guide pages (/indonesia/ports/<slug>): one per harbour that has at least one daily sailing in or out, so no page
// is thin. Everything shown is computed from SAILINGS (the route pages' daily sailings) and data/ports.js.
import { SAILINGS } from "@/data/sailings";
import { BALI_PORTS, ISLAND_PORTS } from "@/data/ports";
import { slug } from "@/lib/affiliateLinks";
import { durationMins, shortPort } from "@/lib/timetable";

export const ALL_PORTS = [...BALI_PORTS, ...ISLAND_PORTS];
export const portSlug = (name) => slug(name);
export const portBySlug = (s) => ALL_PORTS.find((p) => portSlug(p.name) === s) || null;
// "Benoa / Nusa Dua" -> "Benoa", "Bangsal (Lombok)" -> "Bangsal": the short name for headings.
export const portShortName = (name) => shortPort(name).replace(/ \/ .*$/, "");

// One row per other port: daily boats, first and last departure, crossing range, lowest fare, operators.
function summarise(list, keyOf) {
  const by = new Map();
  for (const s of list) {
    const k = keyOf(s);
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(s);
  }
  return [...by.entries()]
    .map(([port, rows]) => {
      const times = rows.map((s) => s.departs).sort();
      const durs = rows.map((s) => durationMins(s.departs, s.arrives)).filter((d) => d != null);
      const fares = rows.map((s) => s.fareAUD ?? s.price).filter((p) => p != null);
      return {
        port, rows: rows.sort((a, b) => a.departs.localeCompare(b.departs)), count: rows.length,
        first: times[0], last: times[times.length - 1],
        minDur: durs.length ? Math.min(...durs) : null, maxDur: durs.length ? Math.max(...durs) : null,
        minFare: fares.length ? Math.min(...fares) : null,
        operators: [...new Set(rows.map((s) => s.operator))].sort(),
      };
    })
    .sort((a, b) => b.count - a.count || a.port.localeCompare(b.port));
}

export function portTraffic(name, sailings = SAILINGS) {
  const departures = summarise(sailings.filter((s) => s.from === name), (s) => s.to);
  const arrivals = summarise(sailings.filter((s) => s.to === name), (s) => s.from);
  const count = (list) => list.reduce((n, r) => n + r.count, 0);
  const operators = [...new Set(sailings.filter((s) => s.from === name || s.to === name).map((s) => s.operator))].sort();
  return { departures, arrivals, departuresCount: count(departures), arrivalsCount: count(arrivals), operators };
}

export const PORT_PAGE_SLUGS = ALL_PORTS.filter((p) => {
  const t = portTraffic(p.name);
  return t.departuresCount + t.arrivalsCount > 0;
}).map((p) => portSlug(p.name));
