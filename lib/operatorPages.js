// Operator pages (/indonesia/operators/<slug>): one per boat company with at least OPERATOR_MIN_DAILY daily sailings on
// the route pages, so no page is thin. Everything shown is computed from SAILINGS (the route pages' daily sailings);
// IslandBounce is not the operator, and the page says so.
import { SAILINGS } from "@/data/sailings";
import { slug } from "@/lib/affiliateLinks";
import { durationMins, groupByPair, shortPort } from "@/lib/timetable";

export const OPERATOR_MIN_DAILY = 3;

// The operator's own website (domain only), for the "not the operator" note. Taken from the operator timetables
// we check by hand (data/operator-sailings.json sources). Leave an operator out rather than guess.
export const OPERATOR_SITES = {
  "Wijaya Buyuk": "wijayabuyuk.com",
  "Semaya One": "semayaone.com",
  "Eka Jaya Fast Boat": "ekajayafastferry.com",
  "The Tanis Fast Cruise": "tanisfastcruise.com",
  WaterJet: "waterjet.id",
  "Gili Gili Fast Boat": "giligilifastboat.com",
  "Semabu Hills Fast Boat": "semabuhillssanur.com",
  "The Angkal Fast Boat": "theangkalfastcruise.com",
  "Angel Billabong Fast Cruise": "angelbillabongfastcruises.com",
  "Axe Stone Fast Cruise": "axestonefastcruise.com",
  "Blue Water Express": "bluewater-express.com",
  "El Rey Fast Cruise": "elreyfastcruise.com",
  "Maruti Group Fast Boat": "marutigroupfastboat.com",
  "Marina Group": "marinafastferry.com",
  "Scoot Fast Cruises": "scootcruise.com",
  "Ocean Speed Fast Boat": "oceanspeedfastboat.com",
};

export const operatorSlug = (name) => slug(name);

export function operatorData(name, sailings = SAILINGS) {
  const rows = sailings.filter((s) => s.operator === name);
  const groups = groupByPair(rows);
  const durs = rows.map((s) => durationMins(s.departs, s.arrives)).filter((d) => d != null);
  const fares = rows.map((s) => s.fareAUD ?? s.price).filter((p) => p != null);
  const times = rows.map((s) => s.departs).sort();
  const ports = [...new Set(rows.flatMap((s) => [s.from, s.to]))];
  // One line per from -> to pair, busiest first, for the routes list and the FAQ.
  const pairs = groups
    .map((g) => {
      const d = g.sailings.map((s) => durationMins(s.departs, s.arrives)).filter((x) => x != null);
      const f = g.sailings.map((s) => s.fareAUD ?? s.price).filter((x) => x != null);
      return {
        from: g.from, to: g.to, count: g.sailings.length, times: g.sailings.map((s) => s.departs),
        minDur: d.length ? Math.min(...d) : null, minFare: f.length ? Math.min(...f) : null,
      };
    })
    .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from));
  return {
    name, rows, groups, pairs, ports,
    count: rows.length,
    confirmedCount: rows.filter((s) => s.confidence === "confirmed").length,
    earliest: times[0], latest: times[times.length - 1],
    minDur: durs.length ? Math.min(...durs) : null,
    minFare: fares.length ? Math.min(...fares) : null,
    site: OPERATOR_SITES[name] || null,
  };
}

const counts = SAILINGS.reduce((m, s) => m.set(s.operator, (m.get(s.operator) || 0) + 1), new Map());
// Busiest first, so the index page and links lead with the operators most people book.
export const OPERATOR_NAMES = [...counts.entries()]
  .filter(([, n]) => n >= OPERATOR_MIN_DAILY)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([name]) => name);
export const OPERATOR_SLUGS = OPERATOR_NAMES.map(operatorSlug);
export const operatorBySlug = (s) => OPERATOR_NAMES.find((n) => operatorSlug(n) === s) || null;
export const operatorPageHref = (name) => (OPERATOR_NAMES.includes(name) ? `/indonesia/operators/${operatorSlug(name)}` : null);

// "Padang Bai, Gili Trawangan and 3 more" style list of the ports an operator serves.
export const portNames = (ports) => ports.map(shortPort);
