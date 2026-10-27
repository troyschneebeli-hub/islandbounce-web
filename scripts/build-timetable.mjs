#!/usr/bin/env node
// Builds data/timetable.js, the sailings the site shows, from the operators' own published timetables:
//
//     node scripts/build-timetable.mjs
//
// Inputs (both edited by hand):
//   data/operator-sailings.json         every operator timetable row (the weekly operator check says what changed)
//   data/operator-sailings-checked.json the date someone last went through those rows against the operators' pages
//   data/bookable-pairs.json            which operator + port pairs can be booked on our 12Go booking site (frozen from
//                                       the Oct 2026 scan; add a pair by hand once you've seen it there)
//
// A row is shown on the route pages (DAILY_SAILINGS) when its operator + pair is bookable and the operator's timetable
// says it runs daily, or doesn't name days and the time was on the booking site every day in Oct 2026. Other rows on
// bookable pairs go to the Trip Planner only, labelled typical (OTHER_SAILINGS). Rows the operator doesn't publish
// itself (a reseller's page, "assumed") are never shown as daily. No 12Go times or prices are used: fares are left out.
// Nothing is invented: an arrival that gives an impossible crossing, or a check-in note naming another port's office,
// is dropped (null) and printed.
//
// No dependencies (Node only).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const load = (name) => JSON.parse(readFileSync(join(DATA, name), "utf8"));

// data/operator-sailings.json name -> the name the site shows (keeps the operator pages' addresses unchanged).
const NAMES = {
  "BlueWater Express": "Blue Water Express", "Tanis ModernDream": "The Tanis Fast Cruise",
  "Marina Group (Miko Natalia)": "Marina Group", "Scoot Cruise": "Scoot Fast Cruises",
  "Axestone Fast Cruise": "Axe Stone Fast Cruise", "The Angkal Fast Cruise": "The Angkal Fast Boat",
  "Angel Billabong Fast Cruises": "Angel Billabong Fast Cruise", "Arjuna Cruise": "Arjuna Fast Boat",
  "Caspla Bali Fast Boat": "Caspla Bali Fast Cruise",
};
const PORTS = {
  sanur: "Sanur", "padang-bai": "Padang Bai", serangan: "Serangan", kusamba: "Kusamba", "benoa-nusa-dua": "Benoa / Nusa Dua",
  "gili-trawangan": "Gili Trawangan", "gili-air": "Gili Air", "gili-meno": "Gili Meno", "nusa-penida": "Nusa Penida",
  "nusa-lembongan": "Nusa Lembongan", bangsal: "Bangsal (Lombok)",
};
// Seasons an operator's page names ("Oct '26", "Nov '26 to Apr '27"), read from the row's days note.
const SEASONS = [
  { match: /Nov '26 to Apr '27/, validFrom: "2026-11-01", validTo: "2027-04-30" },
  { match: /labels it Oct '26/, validFrom: null, validTo: "2026-10-31" },
];
// Crossing times (minutes) we accept. short: Bali/Nusa hops. near: Gilis/Lombok <-> Padang Bai. long: other Gilis/Lombok crossings.
const PLAUSIBLE_MINS = { short: [15, 120], near: [75, 420], long: [90, 420] };
const NEAR_PORTS = ["Padang Bai"];
const FAR_PORTS = ["Gili Trawangan", "Gili Air", "Gili Meno", "Bangsal (Lombok)"];
// Hops inside the Gilis/Lombok (Gili T -> Gili Air, Gili Air -> Bangsal) are a few minutes.
const LOCAL = (a, b) => FAR_PORTS.includes(a) && FAR_PORTS.includes(b);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const mins = (t) => { const [h, m] = t.split(":"); return Number(h) * 60 + Number(m); };
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const isTime = (t) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t);

function plausible(from, to, dep, arr) {
  if (!isTime(dep) || !isTime(arr)) return false;
  let d = mins(arr) - mins(dep);
  if (d < 0) d += 1440;
  if (LOCAL(from, to)) return d >= 5 && d <= 90;
  const far = FAR_PORTS.includes(from) || FAR_PORTS.includes(to);
  const near = NEAR_PORTS.includes(from) || NEAR_PORTS.includes(to);
  const [lo, hi] = PLAUSIBLE_MINS[!far ? "short" : near ? "near" : "long"];
  return d >= lo && d <= hi;
}

function cleanCheckIn(c, from) {
  if (c == null || c === "") return null;
  if (/see notes/i.test(c)) return null; // we don't have the notes it points to
  const office = c.match(/\((\w+) office\)/i);
  if (office && !from.toLowerCase().includes(office[1].toLowerCase())) return null; // another port's office
  return c;
}

const rows = load("operator-sailings.json");
const { checked } = load("operator-sailings-checked.json");
const bookable = load("bookable-pairs.json");
if (!/^\d{4}-\d{2}-\d{2}$/.test(checked || "")) throw new Error("data/operator-sailings-checked.json: checked must be YYYY-MM-DD");
const pairs = new Set(bookable.pairs);
const seenDaily = new Set(bookable.seenDaily);
const c = new Date(`${checked}T00:00:00Z`);
const check = { checked, checkedText: `checked ${c.getUTCDate()} ${MONTHS[c.getUTCMonth()]} ${c.getUTCFullYear()}` };

const daily = [], other = [], problems = [], notBookable = new Map(), seen = new Set(), ids = new Set();
for (const r of rows) {
  const where = `${r.operator} ${r.from} -> ${r.to} ${r.dep}`;
  for (const f of ["operator", "from", "to", "dep", "days", "source"]) if (!r[f]) throw new Error(`${where}: missing ${f}`);
  if (!isTime(r.dep)) throw new Error(`${where}: dep "${r.dep}" is not HH:MM`);
  const from = PORTS[r.from], to = PORTS[r.to];
  if (!from || !to) throw new Error(`${where}: unknown port slug (add it to PORTS)`);
  const key = `${r.operator}|${r.from}|${r.to}|${r.dep}`;
  if (seen.has(key)) continue; // the same boat listed twice (two pages of one operator)
  seen.add(key);
  if (!pairs.has(`${r.operator}|${r.from}|${r.to}`)) { notBookable.set(r.operator, (notBookable.get(r.operator) || 0) + 1); continue; }

  const secondHand = /reseller|assumed|unconfirmed/i.test(r.days) || /UNCONFIRMED/.test(r.source);
  const isDaily = !secondHand && (/^Daily/i.test(r.days) || seenDaily.has(key));
  const arrives = plausible(from, to, r.dep, r.arr) ? r.arr : null;
  if (r.arr && !arrives) problems.push(`${where}: arrival ${r.arr} dropped (impossible crossing time)`);
  const checkIn = cleanCheckIn(r.checkIn, from);
  if (r.checkIn && !checkIn) problems.push(`${where}: check-in "${r.checkIn}" dropped`);
  const season = SEASONS.find((s) => s.match.test(r.days)) || { validFrom: null, validTo: null };
  const operator = NAMES[r.operator] || r.operator;
  let id = `op-${slugify(operator)}-${slugify(from)}-${slugify(to)}-${r.dep.replace(":", "-")}`;
  for (let n = 2; ids.has(id); n++) id = `op-${slugify(operator)}-${slugify(from)}-${slugify(to)}-${r.dep.replace(":", "-")}-${n}`;
  ids.add(id);
  (isDaily ? daily : other).push({
    id, operator, from, to, checkIn, departs: r.dep, arrives,
    via: [], kind: "direct", season: isDaily ? "Daily" : "Typical", validFrom: season.validFrom, validTo: season.validTo,
    source: r.source, verified: checked, flag: null, confidence: "operator", note: isDaily ? null : "Typical, check live times",
    boat: null, price: null, fareAUD: null, runsDaily: isDaily, weekdays: null, operatorBrand: r.operator,
  });
}

const row = (s) => `  ${JSON.stringify(s).replace(/":/g, '": ').replace(/,"/g, ', "')},`;
writeFileSync(join(DATA, "timetable.js"), [
  "// AUTO-GENERATED by scripts/build-timetable.mjs from data/operator-sailings.json. Do not edit by hand.",
  "// DAILY_SAILINGS: daily boats on the operators' own timetables that can be booked on our booking site (route pages).",
  "// OTHER_SAILINGS: the rest on bookable routes, Trip Planner only, labelled typical.",
  `export const TIMETABLE_CHECK = ${JSON.stringify(check)};`,
  "",
  "export const DAILY_SAILINGS = [", ...daily.map(row), "];",
  "",
  "export const OTHER_SAILINGS = [", ...other.map(row), "];",
  "",
].join("\n"));

console.log(`Wrote ${daily.length} daily + ${other.length} other sailings to data/timetable.js (${check.checkedText}).`);
console.log(`Left out (not bookable on our booking site): ${[...notBookable].map(([o, n]) => `${o} ${n}`).join(", ") || "none"}.`);
if (problems.length) console.log(`\nDropped ${problems.length} values:\n  ${problems.join("\n  ")}`);
