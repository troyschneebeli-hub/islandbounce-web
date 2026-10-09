// Real departure times for one Bali port -> one island destination, taken from
// the verified operator timetables (data/timetables.js). Used by the Trip
// Planner's port cards, which used to show generated placeholder times with
// real operator names attached.
//
// Only sailings running today count (seasonal timetables are filtered by
// date). If there's no verified data for a pair, hasReal is false and the card
// says the timetable is coming soon rather than inventing times.

import { SAILINGS } from "@/data/timetables";
import { ROUTE_PAGES } from "@/data/routePages";
import { selectSailings, durationMins, lastChecked, isStale } from "@/lib/timetable";

const shortOperator = (name) => name.replace(/ Fast Boat$/, "");

// `today` picks which season applies (the travel date). `asOf` is the real current date,
// used to judge how fresh our data is.
export function portDepartures(port, destination, today, sailings = SAILINGS, asOf = today) {
  const { active } = selectSailings(sailings, { fromPorts: [port], toPorts: [destination] }, today);

  // Link to our own full timetable page for this route, if there is one.
  const routeSlug =
    Object.keys(ROUTE_PAGES).find(
      (k) => ROUTE_PAGES[k].fromPorts.includes(port) && ROUTE_PAGES[k].toPorts.includes(destination)
    ) || null;

  if (active.length === 0) {
    return { hasReal: false, groups: [], fastestMin: null, checked: null, stale: false, routeSlug };
  }

  // operator -> (departure time -> check-in time), plus whether we've confirmed
  // the operator's timetable directly (used only to order the list; never shown).
  const byOperator = new Map();
  for (const s of active) {
    if (!byOperator.has(s.operator)) byOperator.set(s.operator, { byTime: new Map(), confirmed: false });
    const g = byOperator.get(s.operator);
    g.byTime.set(s.departs, s.checkIn || null);
    if (s.confidence !== "unconfirmed") g.confirmed = true;
  }
  // Operators we've confirmed with come first, then everyone else by earliest departure.
  const groups = [...byOperator.entries()]
    .map(([operator, { byTime, confirmed }]) => {
      const times = [...byTime.keys()].sort();
      return { operator: shortOperator(operator), times, details: times.map((time) => ({ time, checkIn: byTime.get(time) })), confirmed };
    })
    .sort((a, b) => Number(b.confirmed) - Number(a.confirmed) || a.times[0].localeCompare(b.times[0]) || a.operator.localeCompare(b.operator));

  // The headline crossing time comes from operators we've confirmed with when
  // there are any, so one odd listing can't change it. Sailings flagged as
  // unusual are ignored unless every sailing is flagged.
  const confirmedActive = active.filter((s) => s.confidence !== "unconfirmed");
  const pool = confirmedActive.length ? confirmedActive : active;
  const trusted = pool.filter((s) => !s.flag);
  const basis = trusted.length ? trusted : pool;
  const fastestMin = Math.min(...basis.map((s) => durationMins(s.departs, s.arrives)));

  const checked = lastChecked(active);
  return { hasReal: true, groups, fastestMin, checked, stale: isStale(checked, asOf), routeSlug };
}
