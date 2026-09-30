// Pure helpers for the route pages — no framework imports, so the logic can be
// tested on its own. Times are 24h "HH:MM" strings; dates are ISO "YYYY-MM-DD".

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function toMins(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function durationMins(dep, arr) {
  let d = toMins(arr) - toMins(dep);
  if (d < 0) d += 24 * 60; // crossed midnight
  return d;
}

export function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function rangeText(min, max) {
  return min === max ? fmtDuration(min) : `${fmtDuration(min)}–${fmtDuration(max)}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// "Bangsal (Lombok)" -> "Bangsal" — for prose, where the bracket just adds noise.
export function shortPort(name) {
  return name.replace(/ \((SW )?Lombok\)$/, "");
}

// "1 Jul – 31 Oct 2026" / "1 Nov 2026 – 31 Mar 2027"; empty when the sailing is undated.
export function seasonLabel(s) {
  if (!s.validFrom || !s.validTo) return "";
  const [fy, fm, fd] = s.validFrom.split("-").map(Number);
  const [ty] = s.validTo.split("-").map(Number);
  const from = fy === ty ? `${fd} ${MONTHS[fm - 1]}` : formatDate(s.validFrom);
  return `${from} – ${formatDate(s.validTo)}`;
}

export function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// "active" = running today, "upcoming" = a future season, "past" = ended.
export function seasonStatus(s, today) {
  if (s.validTo && s.validTo < today) return "past";
  if (s.validFrom && s.validFrom > today) return "upcoming";
  return "active";
}

const byDeparture = (a, b) => toMins(a.departs) - toMins(b.departs) || a.operator.localeCompare(b.operator);

export function selectSailings(all, route, today) {
  const pool = all.filter((s) => route.fromPorts.includes(s.from) && route.toPorts.includes(s.to));
  return {
    active: pool.filter((s) => seasonStatus(s, today) === "active").sort(byDeparture),
    upcoming: pool
      .filter((s) => seasonStatus(s, today) === "upcoming")
      .sort((a, b) => (a.validFrom || "").localeCompare(b.validFrom || "") || byDeparture(a, b)),
  };
}

// One group per from -> to pair, biggest first.
export function groupByPair(list) {
  const map = new Map();
  for (const s of list) {
    const key = `${s.from}|${s.to}`;
    if (!map.has(key)) map.set(key, { from: s.from, to: s.to, sailings: [] });
    map.get(key).sailings.push(s);
  }
  const shortest = (g) => Math.min(...g.sailings.map((s) => durationMins(s.departs, s.arrives)));
  return [...map.values()].sort(
    (a, b) =>
      b.sailings.length - a.sailings.length ||
      shortest(a) - shortest(b) ||
      `${a.from}${a.to}`.localeCompare(`${b.from}${b.to}`)
  );
}

const uniq = (arr) => [...new Set(arr)];

export function summarize(list) {
  if (list.length === 0) {
    return { count: 0, operators: [], earliest: null, latest: null, pairs: [], fromList: [], toList: [], fromNames: [], toNames: [] };
  }
  const times = list.map((s) => s.departs).sort();
  const groups = groupByPair(list);
  return {
    count: list.length,
    operators: uniq(list.map((s) => s.operator)),
    earliest: times[0],
    latest: times[times.length - 1],
    pairs: groups.map((g) => {
      const durs = g.sailings.map((s) => durationMins(s.departs, s.arrives));
      return { from: g.from, to: g.to, count: g.sailings.length, min: Math.min(...durs), max: Math.max(...durs) };
    }),
    fromList: uniq(groups.map((g) => g.from)),
    toList: uniq(groups.map((g) => g.to)),
    fromNames: uniq(groups.map((g) => shortPort(g.from))),
    toNames: uniq(groups.map((g) => shortPort(g.to))),
  };
}

// One-side-varies routes:  "Padang Bai (1h 30m–2h) and Benoa / Nusa Dua (2h 30m–4h 55m)"
// Both-sides-vary routes:  "Padang Bai to Bangsal: 2h 30m; Benoa / Nusa Dua to Senggigi: 2h–3h"
export function describeDurations(summary, route) {
  const oneSide = route.fromPorts.length === 1 || route.toPorts.length === 1;
  if (oneSide) {
    const label = (p) => shortPort(route.fromPorts.length === 1 ? p.to : p.from);
    return joinList(summary.pairs.map((p) => `${label(p)} (${rangeText(p.min, p.max)})`));
  }
  return summary.pairs.map((p) => `${shortPort(p.from)} to ${shortPort(p.to)}: ${rangeText(p.min, p.max)}`).join("; ");
}

export function lastChecked(list) {
  const dates = list.map((s) => s.verified).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}
