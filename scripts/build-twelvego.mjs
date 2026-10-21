#!/usr/bin/env node
// Builds data/twelvego.js from the 12Go capture spreadsheet (scripts/12go-master-routes.xlsx,
// sheet "Master Routes"). The listings were read from the booking page for one date and are
// treated as the SAME every day (Troy's decision). Re-capture and re-run about monthly.
//
//     node scripts/build-twelvego.mjs [scripts/12go-master-routes.xlsx]
//
// Only 'Scheduled boat' rows with a departure time are published. Transfer packages, flights,
// private charters and hotel pickup packages stay in the spreadsheet only.
// These are the only sailings the site shows (see CLAUDE.md).
//
// No dependencies: an .xlsx file is a zip of XML, read here with Node's built-in zlib.
import { readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || join(HERE, "12go-master-routes.xlsx");
const OUT = join(HERE, "..", "data", "twelvego.js");

const PORTS = {
  "sanur": "Sanur", "padang-bai": "Padang Bai", "serangan": "Serangan", "benoa-nusa-dua": "Benoa / Nusa Dua",
  "gili-trawangan": "Gili Trawangan", "gili-air": "Gili Air", "gili-meno": "Gili Meno",
  "bangsal": "Bangsal (Lombok)", "nusa-penida": "Nusa Penida", "nusa-lembongan": "Nusa Lembongan",
};
// 12Go spelling -> the name we already use for the same company (also fixes names 12Go lists
// without their apostrophe or space). Keep in sync with OPS in build-confirmed.mjs.
const OPS = {
  "Ekajaya Fast Ferry": "Eka Jaya Fast Boat", "BlueWater Express": "Blue Water Express",
  "Gili Gili Fastboat": "Gili Gili Fast Boat", "Gili Getaway": "Gili Getaway",
  "Dcamel Fast Ferry": "D’Camel Fast Ferry", "DStars Fast Ferry": "D’Stars Fast Ferry",
  "Sanjaya Fastboat": "Sanjaya Fast Boat", "The Angkal Fastboat": "The Angkal Fast Boat",
};
// 12Go listing types that are a boat plus a road transfer (a package, not a sailing).
const ROAD_TYPES = /taxi|van|bus/i;
const CAPTURED = "2026-10-15";
const SOURCE = "12Go booking page (listings for 20 Oct 2026, assumed daily)";

const mins = (t) => { const [h, m] = t.split(":"); return Number(h) * 60 + Number(m); };
const hhmm = (n) => { n = ((n % 1440) + 1440) % 1440; return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`; };
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// ---- minimal xlsx reader ----------------------------------------------------------------

function unzip(buf) {
  const files = {};
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error(`${SRC} is not a zip/xlsx file`);
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0, n = buf.readUInt16LE(eocd + 10); i < n; i++) {
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28), extraLen = buf.readUInt16LE(p + 30), commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(start, start + size);
    files[name] = (method === 8 ? inflateRawSync(raw) : raw).toString("utf8");
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const unescapeXml = (s) => s
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&amp;/g, "&");
const textOf = (xml) => unescapeXml([...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(""));
const colIndex = (ref) => [...ref.replace(/\d+/g, "")].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

function readSheet(path, sheetName) {
  const files = unzip(readFileSync(path));
  const shared = [...(files["xl/sharedStrings.xml"] || "").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textOf(m[1]));
  const sheet = [...files["xl/workbook.xml"].matchAll(/<sheet\b[^>]*>/g)].map((m) => m[0])
    .find((tag) => unescapeXml(tag.match(/name="([^"]*)"/)[1]) === sheetName);
  if (!sheet) throw new Error(`No sheet named "${sheetName}" in ${path}`);
  const rid = sheet.match(/r:id="([^"]*)"/)[1];
  const rel = [...files["xl/_rels/workbook.xml.rels"].matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0])
    .find((tag) => tag.includes(`Id="${rid}"`));
  const target = rel.match(/Target="([^"]*)"/)[1].replace(/^\/?(xl\/)?/, "");
  const xml = files[`xl/${target}`];

  const rows = [];
  for (const [, rowXml] of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const [, attrs, body = ""] of rowXml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = attrs.match(/r="([A-Z]+\d+)"/)[1];
      const type = (attrs.match(/t="([^"]*)"/) || [])[1];
      const v = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      let value = null;
      if (type === "s") value = shared[Number(v)];
      else if (type === "inlineStr") value = textOf(body);
      else if (type === "str" || type === "e") value = v == null ? null : unescapeXml(v);
      else if (type === "b") value = v === "1";
      else if (v != null) value = Number(v);
      row[colIndex(ref)] = value;
    }
    rows.push(row);
  }
  return rows;
}

// Times may be stored as text ("08:30") or as an Excel fraction of a day (0.354...).
const asTime = (v) => (typeof v === "number" ? hhmm(Math.round(v * 1440)) : v ? String(v).trim() : null);

// ---- build --------------------------------------------------------------------------------

const out = [], seen = new Set(), ids = new Set();
let skipped = 0;
for (const r of readSheet(SRC, "Master Routes").slice(1)) {
  let [frm, to, op, cls, cat, type, dep, arr, , price] = r;
  dep = asTime(dep); arr = asTime(arr);
  if (cat !== "Scheduled boat" || !dep || !arr || !op || String(op).startsWith("(")) continue;
  if (ROAD_TYPES.test(String(type || ""))) continue;
  if (mins(dep) < 5 * 60) { skipped++; continue; } // 12Go lists a few 01:30 entries that look like time-zone slips
  op = OPS[op] || op;
  const a = PORTS[frm], b = PORTS[to];
  if (!a || !b) throw new Error(`Unknown port slug in row: ${frm} -> ${to}`);
  // Listings at the same time that differ by class, arrival or fare are separate sailings; only
  // exact repeats are dropped. Later variants get "-2", "-3" ... on the id.
  price = price == null || price === "" ? null : Math.round(Number(price));
  const k = [key(op), a, b, dep, cls || "", arr, price].join("|");
  if (seen.has(k)) continue;
  seen.add(k);
  const base = `12go-${slugify(op)}-${slugify(a)}-${slugify(b)}-${dep.replace(":", "-")}`;
  let id = base;
  for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
  ids.add(id);
  out.push({
    id,
    operator: op, from: a, to: b, checkIn: hhmm(mins(dep) - 60), departs: dep, arrives: arr,
    via: [], kind: "direct", season: "Daily (assumed)", validFrom: null, validTo: null,
    source: SOURCE, verified: CAPTURED, flag: null, confidence: "unconfirmed",
    note: "From a booking-site listing", boat: cls || null, price,
  });
}
const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
out.sort((x, y) => cmp(x.from, y.from) || cmp(x.to, y.to) || cmp(x.departs, y.departs) || cmp(x.operator, y.operator));

// Same layout as the old Python output: one JSON object per line, Python-style ", " / ": " spacing.
const line = (s) => "  {" + Object.entries(s).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ") + "}";
writeFileSync(OUT,
  "// AUTO-GENERATED by scripts/build-twelvego.mjs from scripts/12go-master-routes.xlsx. Do not edit by hand.\n" +
  "// Listings read from the 12Go booking page for one date and assumed identical every day. Re-capture roughly monthly.\n" +
  `export const TWELVEGO_CAPTURED = "${CAPTURED}";\n\nexport const TWELVEGO_SAILINGS = [\n` +
  out.map(line).join(",\n") + "\n];\n");

const operators = [...new Set(out.map((s) => s.operator))].sort();
console.log(`${out.length} sailings written; ${skipped} skipped (before 05:00)`);
console.log(`${operators.length} operators: ${operators.join(", ")}`);
