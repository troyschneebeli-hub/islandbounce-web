// Parses one 12Go trip card (its text lines joined with "|") into a sailing.
// Kept apart from scan_12go.mjs so it can be tested without a browser: node scripts/weekly/test_parse.mjs
//
// Card layout (checked on the live page, 22 Oct 2026):
//   [badges]|10:30|12:00|1h 30m|<from station>|<to station>|[7+]|<class> | Ferry|<operator>|[rating]|A$31|...|Book now
// The station names vary in length and number of parts, so the operator is found next to the
// transport type ("Ferry", "Van", ...), not at a fixed position after the duration.
export const TRANSPORT_TYPES = ["Ferry", "Van", "Bus", "Taxi", "Flight", "Train", "Minibus", "Private"];

// "13:30", "1:30 PM", "8:05am" -> "13:30" / "08:05"; anything else (e.g. "--:--") -> null.
export function to24h(x) {
  const m = /^(\d{1,2}):(\d\d)\s*([ap])?\.?m?\.?$/i.exec(x);
  if (!m) return null;
  let h = +m[1];
  if (m[3]) h = (h % 12) + (/p/i.test(m[3]) ? 12 : 0);
  return h < 24 ? `${String(h).padStart(2, "0")}:${m[2]}` : null;
}

export function parseRaw(raw) {
  const t = raw.split("|").map((s) => s.trim()).filter(Boolean);
  const di = t.findIndex((x) => /^(\d+h( \d+m)?|\d+m)$/.test(x));
  if (di < 0) return null;
  const times = t.slice(0, di).map(to24h).filter(Boolean); // "--:--" (choose-a-time packages) has no times
  if (times.length < 2) return null;
  const ti = t.findIndex((x, i) => i > di && TRANSPORT_TYPES.includes(x));
  if (ti < 0) return null; // flights and multi-leg packages ("Flight #IW1850", "Van+Ferry") have no plain type
  const op = t[ti + 1];
  if (!op || /^A\$|^\d(\.\d)?$/.test(op)) return null;
  const pr = (raw.match(/A\$(\d+(?:\.\d+)?)/) || [])[1];
  return { dep: times[0], arr: times[1], dur: t[di], op, ty: t[ti], cls: t[ti - 1], price: pr ? +pr : null };
}
