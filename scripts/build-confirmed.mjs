#!/usr/bin/env node
// Builds the timetable modules the site imports from the weekly matcher's output (data/generated/):
//   data/confirmed.js  CONFIRMED_DAILY (Fast Routes tables), CONFIRMED_NOT_DAILY (Trip Planner, typical), CONFIRMED_SCAN
//   data/typical.js    TYPICAL_SAILINGS: 12Go-only listings (Trip Planner, labelled typical)
//
//     node scripts/build-confirmed.mjs [data/generated]
//
// Runs in the weekly GitHub Action after scripts/weekly/match.py, and by hand after editing data/generated/.
// Nothing is invented. Values that can't be right are dropped (null) rather than guessed:
//   - an operator arrival time that gives an impossible crossing (PLAUSIBLE_MINS); 12Go's arrival is used if that one fits
//   - a check-in note that names another port's office, or points to notes we don't have
// Confirmed rows whose operator source says UNCONFIRMED (a reseller page) are not shown as confirmed.
// Everything dropped is printed; read it before publishing.
//
// No dependencies (Node only).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GEN = process.argv[2] || join(HERE, "..", "data", "generated");
const DATA = join(HERE, "..", "data");

// Sailings seen on 6 of 7 days are probably daily (sold out or gone on the missing day) but that's
// unverified, so they are left off the Fast Routes tables unless this is switched on (Troy decides).
const INCLUDE_SIX_OF_SEVEN = false;

const SOURCE = "Operator timetable + 12Go booking page";
// 12Go spelling -> the name the site shows (also fixes names 12Go lists without an apostrophe or space).
const OPS = {
  "Ekajaya Fast Ferry": "Eka Jaya Fast Boat", "BlueWater Express": "Blue Water Express",
  "Gili Gili Fastboat": "Gili Gili Fast Boat", "Gili Getaway": "Gili Getaway",
  "Dcamel Fast Ferry": "D’Camel Fast Ferry", "DStars Fast Ferry": "D’Stars Fast Ferry",
  "Sanjaya Fastboat": "Sanjaya Fast Boat", "The Angkal Fastboat": "The Angkal Fast Boat",
};
const displayName = (n) => OPS[n] || n;
// Crossing times (minutes) we accept. short: Bali/Nusa hops. near: Gilis/Lombok <-> Padang Bai. long: other Gilis/Lombok crossings.
const PLAUSIBLE_MINS = { short: [15, 120], near: [75, 420], long: [110, 420] };
const NEAR_PORTS = ["Padang Bai"];
const FAR_PORTS = ["Gili Trawangan", "Gili Air", "Gili Meno", "Bangsal (Lombok)"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const mins = (t) => { const [h, m] = t.split(":"); return Number(h) * 60 + Number(m); };
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const isTime = (t) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t);
const day = (iso) => new Date(`${iso}T00:00:00Z`);
const load = (name) => JSON.parse(readFileSync(join(GEN, name), "utf8"));

function plausible(from, to, dep, arr) {
  if (!isTime(dep) || !isTime(arr)) return false;
  let d = mins(arr) - mins(dep);
  if (d < 0) d += 1440;
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

// "checked 21 Oct 2026 for sailings 22 to 28 Oct"
function checkedText(checked, dates) {
  const c = day(checked), a = day(dates[0]), b = day(dates[dates.length - 1]);
  const dm = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  const range = dates.length === 1 ? dm(a)
    : a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} to ${dm(b)}` : `${dm(a)} to ${dm(b)}`;
  return `checked ${dm(c)} ${c.getUTCFullYear()} for sailings ${range}`;
}

function uniqueId(base, seen) {
  let id = base;
  for (let n = 2; seen.has(id); n++) id = `${base}-${n}`;
  seen.add(id);
  return id;
}

const problems = [];
const ids = new Set();

// ---- confirmed ----------------------------------------------------------------------------------
const conf = load("confirmed-sailings.json");
const dates = conf.scannedDates;
const checked = conf.generatedAt.slice(0, 10);
if (checked > dates[0]) throw new Error(`generatedAt (${checked}) is after the first scanned day (${dates[0]})`);
const weekdayOf = (i) => day(dates[i]).getUTCDay();
const minDaily = INCLUDE_SIX_OF_SEVEN ? dates.length - 1 : dates.length;

const daily = [], notDaily = [], skipped = [];
for (const s of conf.sailings) {
  const from = s.fromName, to = s.toName;
  const where = `${s.operator} ${from} -> ${to} ${s.departs}`;
  for (const f of ["operator", "fromName", "toName", "departs"]) if (!s[f]) throw new Error(`${where}: missing ${f}`);
  if (!isTime(s.departs)) throw new Error(`${where}: departs "${s.departs}" is not HH:MM`);
  if (/UNCONFIRMED/.test(s.operatorSource || "")) { skipped.push(`${where} (source: ${s.operatorSource})`); continue; }

  let arrives = null, arrivesFrom = null;
  if (plausible(from, to, s.departs, s.arrives)) arrives = s.arrives;
  else if (plausible(from, to, s.twelvegoDeparts || s.departs, s.twelvegoArrives)) { arrives = s.twelvegoArrives; arrivesFrom = "12Go listing"; }
  if (s.arrives && !arrives) problems.push(`${where}: arrival ${s.arrives} dropped (impossible crossing time)`);
  const checkIn = cleanCheckIn(s.checkIn, from);
  if (s.checkIn && !checkIn) problems.push(`${where}: check-in "${s.checkIn}" dropped`);

  const seen = [...new Set(s.daysSeen || [])].sort((a, b) => a - b);
  // match.py's runsDaily decides (it leaves out a day the route failed to load); the day count is the fallback.
  const isDaily = (typeof s.runsDaily === "boolean" ? s.runsDaily : seen.length >= dates.length) || (INCLUDE_SIX_OF_SEVEN && seen.length >= minDaily);
  const weekdays = [...new Set(seen.map(weekdayOf))].sort();
  const operator = displayName(s.twelvegoOperator || s.operator);
  const row = {
    id: uniqueId(`confirmed-${slugify(operator)}-${slugify(from)}-${slugify(to)}-${s.departs.replace(":", "-")}`, ids),
    operator, from, to, checkIn, departs: s.departs, arrives, arrivesFrom,
    via: [], kind: "direct", season: isDaily ? "Daily" : weekdays.map((d) => WEEKDAYS[d]).join(", "),
    validFrom: null, validTo: null, source: SOURCE, verified: checked, flag: null,
    confidence: isDaily ? "confirmed" : "unconfirmed", note: isDaily ? null : "Not daily", boat: null,
    price: s.priceAUD ?? null, fareAUD: s.priceAUD ?? null, daysSeen: seen, runsDaily: isDaily,
    weekdays: isDaily ? null : weekdays, operatorBrand: s.operator, twelvegoOperator: s.twelvegoOperator || null,
    twelvegoDeparts: isTime(s.twelvegoDeparts) ? s.twelvegoDeparts : null, operatorSource: s.operatorSource || null,
  };
  (isDaily ? daily : notDaily).push(row);
}

// ---- 12Go-only (typical) -----------------------------------------------------------------------
const g = load("twelvego-only-sailings.json");
const gDates = g.scannedDates;
// A single-day capture can't say which days a listing runs; it's treated as daily (labelled typical anyway).
const gWeekday = (i) => day(gDates[i]).getUTCDay();
const typical = g.sailings.map((s) => {
  const from = s.fromName, to = s.toName;
  const operator = displayName(s.operator);
  const seen = [...new Set(s.daysSeen || [])].sort((a, b) => a - b);
  const weekdays = gDates.length > 1 && seen.length < gDates.length ? [...new Set(seen.map(gWeekday))].sort() : null;
  const arrives = plausible(from, to, s.departs, s.arrives) ? s.arrives : null;
  if (s.arrives && !arrives) problems.push(`12Go ${operator} ${from} -> ${to} ${s.departs}: arrival ${s.arrives} dropped (impossible crossing time)`);
  return {
    id: uniqueId(`12go-${slugify(operator)}-${slugify(from)}-${slugify(to)}-${s.departs.replace(":", "-")}`, ids),
    operator, from, to, checkIn: null, departs: s.departs, arrives,
    via: [], kind: "direct", season: weekdays ? weekdays.map((d) => WEEKDAYS[d]).join(", ") : "Typical",
    validFrom: null, validTo: null, source: "12Go booking page", verified: g.generatedAt.slice(0, 10), flag: null,
    confidence: "unconfirmed", note: "Typical, check live times", boat: null, price: s.priceAUD ?? null, weekdays,
  };
});

// ---- write --------------------------------------------------------------------------------------
const row = (s) => `  ${JSON.stringify(s).replace(/":/g, '": ').replace(/,"/g, ', "')},`;
const scan = { from: dates[0], to: dates[dates.length - 1], checked, checkedText: checkedText(checked, dates), dailyRule: `seen on ${minDaily} of ${dates.length} days` };
writeFileSync(join(DATA, "confirmed.js"), [
  "// AUTO-GENERATED by scripts/build-confirmed.mjs from data/generated/confirmed-sailings.json. Do not edit by hand.",
  "// Sailings on both the operator's own timetable and the 12Go booking page. CONFIRMED_DAILY ran on every scanned",
  "// day and fills the Fast Routes tables; CONFIRMED_NOT_DAILY only shows in the Trip Planner, labelled typical.",
  `export const CONFIRMED_SCAN = ${JSON.stringify(scan)};`,
  "",
  "export const CONFIRMED_DAILY = [", ...daily.map(row), "];",
  "",
  "export const CONFIRMED_NOT_DAILY = [", ...notDaily.map(row), "];",
  "",
].join("\n"));
writeFileSync(join(DATA, "typical.js"), [
  "// AUTO-GENERATED by scripts/build-confirmed.mjs from data/generated/twelvego-only-sailings.json. Do not edit by hand.",
  "// 12Go listings with no match on an operator timetable. Trip Planner only, labelled \"Typical, check live times\".",
  `export const TYPICAL_CAPTURE = ${JSON.stringify({ dates: gDates, checked: g.generatedAt.slice(0, 10), rule: g.dailyRule })};`,
  "",
  "export const TYPICAL_SAILINGS = [", ...typical.map(row), "];",
  "",
].join("\n"));

console.log(`Wrote ${daily.length} confirmed daily + ${notDaily.length} not daily to data/confirmed.js, ${typical.length} typical to data/typical.js.`);
console.log(`Daily rule: ${scan.dailyRule}${INCLUDE_SIX_OF_SEVEN ? " (6-of-7 flag ON)" : ""}. ${scan.checkedText}.`);
if (skipped.length) console.log(`\nNot shown as confirmed, source marked UNCONFIRMED (${skipped.length}):\n  ${skipped.join("\n  ")}`);
if (problems.length) console.log(`\nDropped ${problems.length} values:\n  ${problems.join("\n  ")}`);
