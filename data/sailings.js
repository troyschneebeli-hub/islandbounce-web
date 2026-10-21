// Every sailing the site shows. Import SAILINGS from here, not from the generated files.
//
// Sources, best first (a better source replaces the same sailing from a worse one):
//   1. data/confirmed.js: seen on the operator's own timetable AND on 12Go (weekly 7-day scan)
//   2. data/twelvego.js:  12Go listings only, shown as "typical departures" (confidence "unconfirmed")
// Only sailings that are on 12Go may appear on the site, and both sources are. data/timetables.js
// (the old operator research, the "verified" tier) is kept for reference but not used.
//
// "The same sailing" = same operator, same from/to and departures within 10 minutes. 12Go-only
// listings that no confirmed sailing matches are kept.
import { CONFIRMED_SAILINGS, CONFIRMED_VERIFIED } from "@/data/confirmed";
import { TWELVEGO_SAILINGS, TWELVEGO_CAPTURED } from "@/data/twelvego";
import { toMins } from "@/lib/timetable";

const MATCH_WINDOW_MINS = 10;
const nameKey = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const names = (s) => [s.operator, s.operatorBrand, s.twelvegoOperator].filter(Boolean).map(nameKey);
const near = (a, b) => a && b && Math.abs(toMins(a) - toMins(b)) <= MATCH_WINDOW_MINS;

function sameSailing(better, worse) {
  if (better.from !== worse.from || better.to !== worse.to) return false;
  const theirs = names(worse);
  if (!names(better).some((n) => theirs.includes(n))) return false;
  return near(better.departs, worse.departs) || near(better.twelvegoDeparts, worse.departs);
}

// tiers: best first. Rows from a lower tier are dropped when a kept row from a higher tier is the
// same sailing; the kept row borrows any arrival time it lacks from the row it replaced.
export function mergeSailings(tiers) {
  const kept = [];
  for (const tier of tiers) {
    for (const s of tier) {
      const better = kept.find((k) => sameSailing(k, s));
      if (!better) {
        kept.push({ ...s });
        continue;
      }
      if (!better.arrives && s.arrives) {
        better.arrives = s.arrives;
        better.arrivesFrom = "12Go listing";
      }
    }
  }
  return kept;
}

export const SAILINGS = mergeSailings([CONFIRMED_SAILINGS, TWELVEGO_SAILINGS]);
export const SAILINGS_UPDATED = [CONFIRMED_VERIFIED, TWELVEGO_CAPTURED].sort().pop();
