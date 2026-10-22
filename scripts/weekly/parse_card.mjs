// Parses one 12Go trip card (its text lines joined with "|") into a sailing.
// Kept apart from scan_12go.mjs so it can be tested without a browser: node scripts/weekly/test_parse.mjs
//
// 12Go serves two card layouts (both seen 22 Oct 2026; GitHub's runner gets layout B):
//   A: [badges]|10:30|12:00|1h 30m|<from station>|<to station>|[7+]|<class> | Ferry|<operator>|[rating]|A$31|...|Book now
//   B: [badges]|13:30|<from station>|2h | <operator> | Ferry | <class>|15:30|<to station>|[rating]|[+3]|View details|A$28|...|Book now
// In B the operator comes straight after the duration and the type after it; in A the two stations
// (and maybe a seats badge) come first, so the type is at least 4 places after the duration.
// Multi-leg trips are dropped: in A their type is "Van+Ferry", in B their class is "Fast Ferry + Van".
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
  const ti = t.findIndex((x, i) => i > di && TRANSPORT_TYPES.includes(x));
  if (ti < 0) return null; // flights and multi-leg packages ("Flight #IW1850", "Van+Ferry") have no plain type
  const layoutB = ti === di + 2;
  const op = layoutB ? t[di + 1] : t[ti + 1];
  const cls = layoutB ? t[ti + 1] : t[ti - 1];
  if (!op || /^(A|US)?\$|^\d(\.\d)?$/.test(op)) return null;
  if (/\+/.test(cls || "")) return null; // "Fast Ferry + Van": boat plus road transfer
  // Times: in A both come before the duration; in B departure before it, arrival after the class.
  const times = (layoutB ? [...t.slice(0, di), ...t.slice(ti + 1)] : t.slice(0, di)).map(to24h).filter(Boolean); // "--:--" packages have none
  if (times.length < 2) return null;
  // Stations: in A straight after the duration; in B departure just before the duration, arrival just after the arrival time.
  const ai = layoutB ? t.findIndex((x, i) => i > ti && to24h(x)) : -1;
  const from = layoutB ? t[di - 1] : t[di + 1];
  const to = layoutB ? (ai > 0 ? t[ai + 1] : undefined) : t[di + 2];
  // Price only when shown in A$ (the scanner asks for curr=AUD); a US$ or other price is left out, not misread.
  const pm = raw.match(/(?:^|\|)\s*(A\$|US\$|\$|IDR\s?|Rp\s?)\s?([\d,]+(?:\.\d+)?)/);
  const currency = pm ? (pm[1].trim() === "$" ? "USD?" : pm[1].trim()) : null;
  const price = pm && currency === "A$" ? +pm[2].replace(/,/g, "") : null;
  return { dep: times[0], arr: times[1], dur: t[di], op, ty: t[ti], cls, price, currency, from, to };
}

// 12Go's route pages also list trips from nearby ports (the Bangsal -> Nusa Penida page shows boats from
// Gili Trawangan and Gili Air). Those must not count as departures from the page's port.
// A station is "other" only when it names a different port and not the expected one; station names we
// don't recognise ("Banjar Nyuh", "main Harbour") are kept.
const PORT_WORDS = {
  "bangsal": /bangsal/i,
  "benoa-nusa-dua": /benoa|nusa dua/i,
  "gili-air": /gili air/i,
  "gili-meno": /gili meno/i,
  "gili-trawangan": /gili trawangan|gili t\b/i,
  "nusa-lembongan": /lembongan/i,
  "nusa-penida": /penida/i,
  "padang-bai": /padang ?bai/i,
  "sanur": /sanur/i,
  "serangan": /serangan/i,
};
// Ports we don't list, which 12Go shows on nearby route pages.
const OTHER_PORTS = /teluk nare|teluk kode|senggigi|lembar|amed|tulamben|ceningan|kuta|legian|seminyak|jimbaran|ubud|lombok airport|bali airport/i;

export function stationFits(station, port) {
  if (!station) return true;
  const own = PORT_WORDS[port];
  if (own && own.test(station)) return true;
  if (OTHER_PORTS.test(station)) return false;
  return !Object.entries(PORT_WORDS).some(([p, re]) => p !== port && re.test(station));
}
