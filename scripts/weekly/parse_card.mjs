// Parses one 12Go trip card (its text lines joined with "|") into a sailing.
// Kept apart from scan_12go.mjs so it can be tested without a browser: node scripts/weekly/test_parse.mjs
//
// Card layout (checked on the live page, 22 Oct 2026):
//   [badges]|10:30|12:00|1h 30m|<from station>|<to station>|[7+]|<class> | Ferry|<operator>|[rating]|A$31|...|Book now
// The station names vary in length and number of parts, so the operator is found next to the
// transport type ("Ferry", "Van", ...), not at a fixed position after the duration.
export const TRANSPORT_TYPES = ["Ferry", "Van", "Bus", "Taxi", "Flight", "Train", "Minibus", "Private"];

export function parseRaw(raw) {
  const t = raw.split("|").map((s) => s.trim()).filter(Boolean);
  const di = t.findIndex((x) => /^(\d+h( \d+m)?|\d+m)$/.test(x));
  if (di < 0) return null;
  const times = t.slice(0, di).filter((x) => /^\d\d:\d\d$/.test(x)); // "--:--" (choose-a-time packages) has no times
  if (times.length < 2) return null;
  const ti = t.findIndex((x, i) => i > di && TRANSPORT_TYPES.includes(x));
  if (ti < 0) return null; // flights and multi-leg packages ("Flight #IW1850", "Van+Ferry") have no plain type
  const op = t[ti + 1];
  if (!op || /^A\$|^\d(\.\d)?$/.test(op)) return null;
  const pr = (raw.match(/A\$(\d+(?:\.\d+)?)/) || [])[1];
  return { dep: times[0], arr: times[1], dur: t[di], op, ty: t[ti], cls: t[ti - 1], price: pr ? +pr : null };
}
