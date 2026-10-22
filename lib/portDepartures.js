// Departure times for one port -> one destination, for the Trip Planner's port cards.
// Uses PLANNER_SAILINGS (data/sailings.js): confirmed daily sailings first, tagged "Confirmed",
// then the rest labelled "Typical, check live times" (confirmed but not daily, and 12Go-only listings).
//
// Only sailings running on the travel date count: a sailing seen on some weekdays only is shown
// on those weekdays. If there's no data for a pair, hasReal is false; BOAT_ROUTES in data/planner.js
// only lists pairs that have sailings, so the planner shouldn't reach that case.

import { PLANNER_SAILINGS } from "@/data/sailings";
import { routePageFor } from "@/data/routePages";
import { selectSailings, knownDurations, lastChecked, isStale } from "@/lib/timetable";

const shortOperator = (name) => name.replace(/ Fast Boat$/, "");
const isConfirmed = (s) => s.confidence === "confirmed";

// `today` picks which sailings run (the travel date). `asOf` is the real current date,
// used to judge how fresh our data is.
export function portDepartures(port, destination, today, sailings = PLANNER_SAILINGS, asOf = today) {
  const weekday = today ? new Date(`${today}T00:00:00Z`).getUTCDay() : null;
  const runs = (s) => !s.weekdays || weekday == null || s.weekdays.includes(weekday);
  const active = selectSailings(sailings, { fromPorts: [port], toPorts: [destination] }, today).active.filter(runs);

  // Link to our own full timetable page for this route, if there is one.
  const routeSlug = routePageFor(port, destination)?.slug || null;

  if (active.length === 0) {
    return { hasReal: false, groups: [], fastestMin: null, checked: null, stale: false, routeSlug };
  }

  // One group per operator and kind (confirmed / typical), so an operator's confirmed times and
  // its typical ones are listed and labelled separately. A time that is confirmed isn't repeated as typical.
  const confirmedTimes = new Set(active.filter(isConfirmed).map((s) => `${s.operator}|${s.departs}`));
  const byGroup = new Map();
  for (const s of active) {
    const confirmed = isConfirmed(s);
    if (!confirmed && confirmedTimes.has(`${s.operator}|${s.departs}`)) continue;
    const key = `${s.operator}|${confirmed}`;
    if (!byGroup.has(key)) byGroup.set(key, { operator: s.operator, confirmed, byTime: new Map() });
    byGroup.get(key).byTime.set(s.departs, { checkIn: s.checkIn || null, arrives: s.arrives || null, price: s.price ?? null });
  }
  // Confirmed first, then typical; within each, by earliest departure.
  const groups = [...byGroup.values()]
    .map(({ operator, confirmed, byTime }) => {
      const times = [...byTime.keys()].sort();
      return { operator: shortOperator(operator), times, details: times.map((time) => ({ time, ...byTime.get(time) })), confirmed };
    })
    .sort((a, b) => Number(b.confirmed) - Number(a.confirmed) || a.times[0].localeCompare(b.times[0]) || a.operator.localeCompare(b.operator));

  // The headline crossing time comes from confirmed sailings when there are any, so one odd
  // listing can't change it. Sailings flagged as unusual are ignored unless every sailing is flagged.
  const confirmedActive = active.filter(isConfirmed);
  const pool = confirmedActive.length ? confirmedActive : active;
  const trusted = pool.filter((s) => !s.flag);
  const basis = trusted.length ? trusted : pool;
  const durs = knownDurations(basis);
  const fastestMin = durs.length ? Math.min(...durs) : null;

  const checked = lastChecked(active);
  return { hasReal: true, groups, fastestMin, checked, stale: isStale(checked, asOf), routeSlug };
}
