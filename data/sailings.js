// Every sailing the site shows. Import SAILINGS from here, not from the generated files.
//
// Sources, best first:
//   1. data/confirmed.js: seen on the operator's own timetable AND on 12Go (7-day scan)
//   2. data/twelvego.js:  12Go listings only, shown as "typical departures" (confidence "unconfirmed")
// Only sailings that are on 12Go may appear on the site, and both sources are. data/timetables.js
// (the old operator research, the "verified" tier) is kept for reference but not used.
//
// A confirmed sailing replaces the ONE 12Go listing that is the same sailing: same operator, same
// from/to, departure within 10 minutes, closest time first. Every other row is kept, so two
// listings that differ only by fare class, or two operators at the same time, both show.
import { CONFIRMED_SAILINGS, CONFIRMED_SCAN } from "@/data/confirmed";
import { TWELVEGO_SAILINGS, TWELVEGO_CAPTURED } from "@/data/twelvego";
import { toMins } from "@/lib/timetable";

const MATCH_WINDOW_MINS = 10;
const nameKey = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const names = (s) => [s.operator, s.operatorBrand, s.twelvegoOperator].filter(Boolean).map(nameKey);
const gap = (a, b) => (a && b ? Math.abs(toMins(a) - toMins(b)) : Infinity);

// How far apart two rows are as the same sailing, in minutes; Infinity when they can't be.
function matchGap(better, worse) {
  if (better.from !== worse.from || better.to !== worse.to) return Infinity;
  const theirs = names(worse);
  if (!names(better).some((n) => theirs.includes(n))) return Infinity;
  const g = Math.min(gap(better.twelvegoDeparts, worse.departs), gap(better.departs, worse.departs));
  return g <= MATCH_WINDOW_MINS ? g : Infinity;
}

// Returns { sailings, replaced } where replaced maps a dropped 12Go id to the confirmed id that
// replaced it. A confirmed row with no arrival time takes the arrival of the listing it replaced.
export function mergeSailings(confirmed, typical) {
  const taken = new Map(); // typical id -> confirmed id
  const kept = confirmed.map((c) => {
    let best = null;
    for (const t of typical) {
      if (taken.has(t.id)) continue;
      const g = matchGap(c, t);
      // closest time wins; on a tie prefer the listing with the same fare
      const score = g * 10 + (t.price === c.fareAUD ? 0 : 1);
      if (g !== Infinity && (!best || score < best.score)) best = { t, score };
    }
    const row = { ...c };
    if (best) {
      taken.set(best.t.id, c.id);
      row.replaces = best.t.id;
      if (!row.arrives && best.t.arrives) {
        row.arrives = best.t.arrives;
        row.arrivesFrom = "12Go listing";
      }
    }
    return row;
  });
  return { sailings: [...kept, ...typical.filter((t) => !taken.has(t.id))], replaced: taken };
}

const merged = mergeSailings(CONFIRMED_SAILINGS, TWELVEGO_SAILINGS);
export const SAILINGS = merged.sailings;
export const REPLACED_BY_CONFIRMED = merged.replaced;
// The latest real check date. The confirmed scan date is the day it was run, never a scanned day.
export const SAILINGS_UPDATED = [CONFIRMED_SCAN.checked, TWELVEGO_CAPTURED].sort().pop();
