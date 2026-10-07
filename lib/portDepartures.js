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
import { selectSailings, durationMins, lastChecked } from "@/lib/timetable";

const shortOperator = (name) => name.replace(/ Fast Boat$/, "");

export function portDepartures(port, destination, today, sailings = SAILINGS) {
  const { active } = selectSailings(sailings, { fromPorts: [port], toPorts: [destination] }, today);

  // Link to our own full timetable page for this route, if there is one.
  const routeSlug =
    Object.keys(ROUTE_PAGES).find(
      (k) => ROUTE_PAGES[k].fromPorts.includes(port) && ROUTE_PAGES[k].toPorts.includes(destination)
    ) || null;

  if (active.length === 0) {
    return { hasReal: false, groups: [], fastestMin: null, checked: null, routeSlug };
  }

  const byOperator = new Map();
  for (const s of active) {
    if (!byOperator.has(s.operator)) byOperator.set(s.operator, new Set());
    byOperator.get(s.operator).add(s.departs);
  }
  const groups = [...byOperator.entries()]
    .map(([operator, times]) => ({ operator: shortOperator(operator), times: [...times].sort() }))
    .sort((a, b) => a.times[0].localeCompare(b.times[0]) || a.operator.localeCompare(b.operator));

  // Fastest crossing, ignoring sailings flagged as unusual (a flagged time is
  // one we haven't been able to confirm), unless every sailing is flagged.
  const trusted = active.filter((s) => !s.flag);
  const basis = trusted.length ? trusted : active;
  const fastestMin = Math.min(...basis.map((s) => durationMins(s.departs, s.arrives)));

  return { hasReal: true, groups, fastestMin, checked: lastChecked(active), routeSlug };
}
