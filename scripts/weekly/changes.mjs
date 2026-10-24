// Writes the weekly "what changed" report: this week's matcher output against last week's.
// Usage: node scripts/weekly/changes.mjs --new data/generated-new --old data/generated --out changes.md [--status "Published"] [--flags flags.json]
// The weekly workflow posts it as a GitHub issue, which emails the repo owner.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, "")] = argv[i + 1];
if (!args.new || !args.old || !args.out) { console.error("usage: changes.mjs --new DIR --old DIR --out FILE [--status TEXT]"); process.exit(2); }

const load = (dir, name) => {
  const f = path.join(dir, `${name}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { sailings: [] };
};
const now = { daily: load(args.new, "confirmed-daily-sailings"), all: load(args.new, "confirmed-sailings"), only: load(args.new, "twelvego-only-sailings") };
const before = { daily: load(args.old, "confirmed-daily-sailings"), all: load(args.old, "confirmed-sailings"), only: load(args.old, "twelvego-only-sailings") };

const MAX = 40; // lines per list, so the issue stays readable
const fmtDay = (d) => (d ? new Date(`${d}T00:00:00Z`).toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" }) : "?");
const win = (j) => (j.scannedDates && j.scannedDates.length ? `${fmtDay(j.scannedDates[0])} to ${fmtDay(j.scannedDates.at(-1))}` : "unknown");
const route = (s) => `${s.fromName || s.from} → ${s.toName || s.to}`;
const key = (s) => `${s.from}|${s.to}|${s.operator}|${s.departs}`;
const line = (s) => `${route(s)} ${s.departs} ${s.operator}${s.priceAUD != null ? ` (A$${s.priceAUD})` : ""}`;
const list = (rows) => (rows.length ? [...rows.slice(0, MAX).map((r) => `- ${r}`), ...(rows.length > MAX ? [`- …and ${rows.length - MAX} more`] : [])] : ["- none"]);
const byKey = (rows) => new Map(rows.map((s) => [key(s), s]));
const sortRows = (rows) => rows.sort((a, b) => route(a).localeCompare(route(b)) || a.departs.localeCompare(b.departs));

// Fast Routes (confirmed daily) sailings added, removed and re-priced.
const oldDaily = byKey(before.daily.sailings), newDaily = byKey(now.daily.sailings);
const removed = sortRows([...oldDaily.values()].filter((s) => !newDaily.has(key(s))));
const added = sortRows([...newDaily.values()].filter((s) => !oldDaily.has(key(s))));
const priced = [...newDaily.values()]
  .map((s) => ({ s, was: oldDaily.get(key(s)) }))
  .filter(({ s, was }) => was && was.priceAUD != null && s.priceAUD != null && was.priceAUD !== s.priceAUD)
  .sort((a, b) => Math.abs(b.s.priceAUD - b.was.priceAUD) - Math.abs(a.s.priceAUD - a.was.priceAUD))
  .map(({ s, was }) => `${route(s)} ${s.departs} ${s.operator}: A$${was.priceAUD} → A$${s.priceAUD}`);

// Operators, by the name 12Go shows them under (stable week to week, unlike timetable names).
const twelveGoNames = (d) => new Set([...d.all.sailings.map((s) => s.twelvegoOperator || s.operator), ...d.only.sailings.map((s) => s.operator)]);
const opsBefore = twelveGoNames(before), opsNow = twelveGoNames(now);
const goneFrom12Go = [...opsBefore].filter((o) => !opsNow.has(o)).sort();
const newOn12Go = [...opsNow].filter((o) => !opsBefore.has(o)).sort();
const dailyOps = (d) => new Set(d.daily.sailings.map((s) => s.operator));
const goneFromFastRoutes = [...dailyOps(before)].filter((o) => !dailyOps(now).has(o)).sort();

// Boats on 12Go (nearly) every night that aren't in data/operator-sailings.json: probably a new or changed operator
// timetable. They can't be confirmed until someone adds them to the operator list.
const nights = (now.only.scannedDates || []).length;
const unlisted = sortRows(nights >= 7 ? now.only.sailings.filter((s) => (s.daysSeen || []).length >= nights - 1) : [])
  .map((s) => `${route(s)} ${s.departs} ${s.operator} (seen ${(s.daysSeen || []).length} of ${nights} nights)`);

// Routes whose daily count changed.
const countBy = (rows) => rows.reduce((m, s) => m.set(route(s), (m.get(route(s)) || 0) + 1), new Map());
const cOld = countBy(before.daily.sailings), cNew = countBy(now.daily.sailings);
const routeChanges = [...new Set([...cOld.keys(), ...cNew.keys()])].sort()
  .filter((r) => (cOld.get(r) || 0) !== (cNew.get(r) || 0))
  .map((r) => `${r}: ${cOld.get(r) || 0} → ${cNew.get(r) || 0}`);

const n = (a, b) => `${a} → ${b}${b > a ? ` (+${b - a})` : b < a ? ` (${b - a})` : ""}`;
const out = [
  `## Timetable update for sailings ${win(now.daily)}`,
  ...(args.status ? ["", `**${args.status}**`] : []),
  "",
  `Compared with last run (sailings ${win(before.daily)}).`,
  "",
  "| | Last run | This run |",
  "|---|---|---|",
  `| Confirmed daily (Fast Routes) | ${before.daily.sailings.length} | ${now.daily.sailings.length} |`,
  `| Confirmed, all | ${before.all.sailings.length} | ${now.all.sailings.length} |`,
  `| 12Go only (Trip Planner, typical) | ${before.only.sailings.length} | ${now.only.sailings.length} |`,
  "",
  `### Operators no longer listed on 12Go (${goneFrom12Go.length})`, ...list(goneFrom12Go),
  "", `### Operators new on 12Go (${newOn12Go.length})`, ...list(newOn12Go),
  "", `### Operators dropped from Fast Routes (${goneFromFastRoutes.length})`, ...list(goneFromFastRoutes),
  "", `### Fast Routes counts that changed (${routeChanges.length})`, ...list(routeChanges),
  "", `### Sailings removed from Fast Routes (${removed.length})`, ...list(removed.map(line)),
  "", `### Sailings added to Fast Routes (${added.length})`, ...list(added.map(line)),
  "", `### Price changes on Fast Routes (${priced.length}, biggest first)`, ...list(priced),
  "", `### On 12Go every night but not in the operator timetables (${unlisted.length})`,
  "Add these to data/operator-sailings.json if the operator's own site lists them, so they can be confirmed.",
  ...list(unlisted),
  "",
];
fs.writeFileSync(args.out, out.join("\n"));
// --flags FILE: the counts the daily workflow uses to decide whether a published update is worth an email
// (sailings or operators changed) or not (only prices moved).
if (args.flags) {
  const flags = { added: added.length, removed: removed.length, priceChanges: priced.length, operatorsGone: goneFrom12Go.length, operatorsNew: newOn12Go.length,
    dailyBefore: before.daily.sailings.length, dailyNow: now.daily.sailings.length, window: win(now.daily) };
  flags.notable = flags.added + flags.removed + flags.operatorsGone + flags.operatorsNew > 0;
  fs.writeFileSync(args.flags, JSON.stringify(flags));
}
console.log(`Fast Routes daily: ${n(before.daily.sailings.length, now.daily.sailings.length)}; ${removed.length} removed, ${added.length} added, ${priced.length} price changes; ${goneFrom12Go.length} operator(s) gone from 12Go`);
