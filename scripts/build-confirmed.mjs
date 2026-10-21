#!/usr/bin/env node
// Builds data/confirmed.js from scripts/confirmed-sailings.json: sailings found on BOTH the
// operator's own timetable and the 12Go booking page during a 7-day scan. These are shown on
// the site as "Confirmed", ahead of the 12Go-only "typical" listings (merged in data/sailings.js).
//
//     node scripts/build-confirmed.mjs [scripts/confirmed-sailings.json]
//
// Nothing is invented. Values that can't be right are dropped (set to null) rather than guessed:
//   - an arrival time that gives an impossible crossing time (see PLAUSIBLE_MINS); data/sailings.js
//     then uses the arrival from the 12Go listing it replaces
//   - a check-in note that names another port's office, or points to notes we don't have
// Rows whose source says UNCONFIRMED are skipped, so those sailings stay 12Go-only "typical".
// Every dropped value and skipped row is printed, so review the output before deploying.
//
// No dependencies (Node only), like scripts/build-twelvego.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || join(HERE, "confirmed-sailings.json");
const OUT = join(HERE, "..", "data", "confirmed.js");
const PORTS_FILE = join(HERE, "..", "data", "ports.js");

const SOURCE = "Operator timetable + 12Go booking page";
const VERIFIED = "2026-10-21"; // the day the scan was run (never later than the first scanned day)
// 12Go spelling -> the name the site already uses. Keep in sync with OPS in build-twelvego.mjs,
// so a confirmed sailing carries the same operator name as the 12Go listing it replaces.
const OPS = {
  "Ekajaya Fast Ferry": "Eka Jaya Fast Boat", "BlueWater Express": "Blue Water Express",
  "Gili Gili Fastboat": "Gili Gili Fast Boat", "Gili Getaway": "Gili Getaway",
  "Dcamel Fast Ferry": "D’Camel Fast Ferry", "DStars Fast Ferry": "D’Stars Fast Ferry",
  "Sanjaya Fastboat": "Sanjaya Fast Boat", "The Angkal Fastboat": "The Angkal Fast Boat",
};
// Crossing times (minutes) we accept, by the regions of the two ports (data/ports.js).
// short: Bali/Nusa hops. near: Gilis/Lombok <-> Padang Bai (the closest Bali port). long: other Gilis/Lombok crossings.
const PLAUSIBLE_MINS = { short: [15, 120], near: [75, 420], long: [110, 420] };
const NEAR_PORTS = ["Padang Bai"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const mins = (t) => { const [h, m] = t.split(":"); return Number(h) * 60 + Number(m); };
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const isTime = (t) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t);

const data = JSON.parse(readFileSync(SRC, "utf8"));
const [scanFrom, scanTo] = data.scanned.split("..");
if (!scanFrom || !scanTo) throw new Error(`"scanned" should look like 2026-10-22..2026-10-28, got ${data.scanned}`);

const REGION = {};
for (const m of readFileSync(PORTS_FILE, "utf8").matchAll(/name: "([^"]+)", region: "([^"]+)"/g)) REGION[m[1]] = m[2];

const dayName = (i) => {
  const d = new Date(`${scanFrom}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + i);
  return WEEKDAYS[d.getUTCDay()];
};
const [, fm, fd] = scanFrom.split("-").map(Number);
const [ty, tm, td] = scanTo.split("-").map(Number);
const scanText = fm === tm ? `${fd}–${td} ${MONTHS[tm - 1]} ${ty}` : `${fd} ${MONTHS[fm - 1]} – ${td} ${MONTHS[tm - 1]} ${ty}`;
const [vy, vm, vd] = VERIFIED.split("-").map(Number);
if (VERIFIED > scanFrom) throw new Error(`VERIFIED (${VERIFIED}) is after the first scanned day (${scanFrom})`);
// "checked 21 Oct 2026 for sailings 22 to 28 Oct"
const checkedText = `checked ${vd} ${MONTHS[vm - 1]} ${vy} for sailings ${fd}${fm === tm ? "" : ` ${MONTHS[fm - 1]}`} to ${td} ${MONTHS[tm - 1]}`;

function plausibleArrival(s) {
  if (!isTime(s.arrives)) return false;
  let d = mins(s.arrives) - mins(s.departs);
  if (d < 0) d += 1440;
  const far = REGION[s.from] === "gili-lombok" || REGION[s.to] === "gili-lombok";
  const near = NEAR_PORTS.includes(s.from) || NEAR_PORTS.includes(s.to);
  const [lo, hi] = PLAUSIBLE_MINS[!far ? "short" : near ? "near" : "long"];
  return d >= lo && d <= hi;
}

function cleanCheckIn(s) {
  const c = s.checkIn;
  if (c == null || c === "") return null;
  if (/see notes/i.test(c)) return null; // we don't have the notes it points to
  const office = c.match(/\((\w+) office\)/i);
  if (office && !s.from.toLowerCase().includes(office[1].toLowerCase())) return null; // another port's office
  return c;
}

const problems = [];
const skipped = [];
const seen = new Set();
const out = [];
for (const s of data.sailings) {
  const where = `${s.operator} ${s.from} -> ${s.to} ${s.departs}`;
  for (const f of ["operator", "from", "to", "departs"]) if (!s[f]) throw new Error(`${where}: missing ${f}`);
  if (!isTime(s.departs)) throw new Error(`${where}: departs "${s.departs}" is not HH:MM`);
  if (!REGION[s.from] || !REGION[s.to]) throw new Error(`${where}: port not in data/ports.js`);
  if (typeof s.priceAUD !== "number") throw new Error(`${where}: missing priceAUD`);
  if (/UNCONFIRMED/.test(s.operatorSource || "")) {
    skipped.push(`${where} (source: ${s.operatorSource})`);
    continue;
  }

  const operator = OPS[s.twelvegoOperator] || s.twelvegoOperator || s.operator;
  const arrives = plausibleArrival(s) ? s.arrives : null;
  if (s.arrives && !arrives) problems.push(`${where}: arrival ${s.arrives} dropped (impossible crossing time)`);
  const checkIn = cleanCheckIn(s);
  if (s.checkIn && !checkIn) problems.push(`${where}: check-in "${s.checkIn}" dropped`);

  const days = [...new Set(s.daysSeen || [])].sort((a, b) => a - b);
  const daily = s.runsDaily === true || days.length === 7;
  let id = `confirmed-${slugify(operator)}-${slugify(s.from)}-${slugify(s.to)}-${s.departs.replace(":", "-")}`;
  for (let n = 2; seen.has(id); n++) id = `${id.replace(/-\d+$/, "")}-${n}`;
  seen.add(id);

  out.push({
    id,
    operator,
    from: s.from,
    to: s.to,
    checkIn,
    departs: s.departs,
    arrives,
    via: [],
    kind: "direct",
    season: daily ? "Daily" : `${days.map(dayName).join(", ")} (seen ${scanText})`,
    validFrom: scanFrom,
    validTo: scanTo,
    ongoing: true, // the 7-day scan is treated as the current timetable, not a season that ends
    source: SOURCE,
    verified: VERIFIED,
    flag: null,
    confidence: "confirmed",
    note: null,
    boat: null,
    price: s.priceAUD,
    fareAUD: s.priceAUD,
    daysSeen: days,
    runsDaily: daily,
    daysLabel: daily ? null : days.map(dayName).join(", "),
    operatorBrand: s.operator,
    twelvegoOperator: s.twelvegoOperator || null,
    twelvegoDeparts: isTime(s.twelvegoDeparts) ? s.twelvegoDeparts : null,
    operatorSource: s.operatorSource || null,
  });
}

const lines = [
  "// AUTO-GENERATED by scripts/build-confirmed.mjs from scripts/confirmed-sailings.json. Do not edit by hand.",
  `// Sailings seen on both the operator's own timetable and the 12Go booking page, ${scanText}.`,
  "// Merged ahead of the 12Go-only listings in data/sailings.js. To refresh, see \"Weekly refresh\" in CLAUDE.md.",
  `export const CONFIRMED_VERIFIED = ${JSON.stringify(VERIFIED)};`,
  `export const CONFIRMED_SCAN = ${JSON.stringify({ from: scanFrom, to: scanTo, text: scanText, checked: VERIFIED, checkedText })};`,
  "",
  "export const CONFIRMED_SAILINGS = [",
  ...out.map((s) => `  ${JSON.stringify(s).replace(/":/g, '": ').replace(/,"/g, ', "')},`),
  "];",
  "",
];
writeFileSync(OUT, lines.join("\n"));

console.log(`Wrote ${out.length} confirmed sailings to data/confirmed.js (${data.sailings.length} rows read).`);
if (skipped.length) console.log(`\nSkipped ${skipped.length} rows marked UNCONFIRMED (they stay 12Go-only):\n  ${skipped.join("\n  ")}`);
if (problems.length) console.log(`\nDropped ${problems.length} values:\n  ${problems.join("\n  ")}`);
