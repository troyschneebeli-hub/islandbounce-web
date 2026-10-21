#!/usr/bin/env node
// Sanity checks on the sailings the site shows. Run after rebuilding data/confirmed.js or data/twelvego.js:
//
//     node scripts/check-data.mjs
//
// Loads the real data modules (resolving the "@/" import alias), so it checks exactly what the site
// imports. Prints counts per route page and exits non-zero if any check fails. Needs Node 22.15+.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      const base = join(ROOT, specifier.slice(2));
      const file = existsSync(base) ? base : `${base}.js`;
      return { url: pathToFileURL(file).href, format: "module", shortCircuit: true }; // the site's .js files are ES modules
    }
    return next(specifier, context);
  },
});

const { SAILINGS, REPLACED_BY_CONFIRMED } = await import("@/data/sailings");
const { CONFIRMED_SAILINGS, CONFIRMED_SCAN } = await import("@/data/confirmed");
const { TWELVEGO_SAILINGS } = await import("@/data/twelvego");
const { BALI_PORTS, ISLAND_PORTS } = await import("@/data/ports");
const { ROUTE_PAGES, ROUTE_SLUGS } = await import("@/data/routePages");
const { selectSailings, routeContext } = await import("@/lib/timetable");

const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

// 1. No duplicate ids.
const ids = new Map();
for (const s of SAILINGS) ids.set(s.id, (ids.get(s.id) || 0) + 1);
for (const [id, n] of ids) check(n === 1, `duplicate id ${id} (${n} times)`);

// 2. Every from/to is a port in data/ports.js.
const PORTS = new Set([...BALI_PORTS, ...ISLAND_PORTS].map((p) => p.name));
for (const s of SAILINGS) {
  check(PORTS.has(s.from), `${s.id}: from "${s.from}" is not in data/ports.js`);
  check(PORTS.has(s.to), `${s.id}: to "${s.to}" is not in data/ports.js`);
}

// 3. Every confirmed row has operator, departs and fareAUD; every confirmed row is shown.
const shown = SAILINGS.filter((s) => s.confidence === "confirmed");
for (const s of shown) {
  check(Boolean(s.operator), `${s.id}: no operator`);
  check(/^\d{2}:\d{2}$/.test(s.departs || ""), `${s.id}: departs "${s.departs}" is not HH:MM`);
  check(typeof s.fareAUD === "number" && s.fareAUD > 0, `${s.id}: no fareAUD`);
}
const shownIds = new Set(SAILINGS.map((s) => s.id));
for (const c of CONFIRMED_SAILINGS) check(shownIds.has(c.id), `confirmed sailing ${c.id} is not shown`);

// 4. Merging: each confirmed sailing replaces at most one 12Go listing, and every 12Go listing that
//    isn't shown was replaced by a confirmed one (nothing else is dropped).
const replacers = [...REPLACED_BY_CONFIRMED.values()];
check(new Set(replacers).size === replacers.length, "a confirmed sailing replaced more than one 12Go listing");
for (const t of TWELVEGO_SAILINGS) check(shownIds.has(t.id) || REPLACED_BY_CONFIRMED.has(t.id), `12Go listing ${t.id} was dropped without a confirmed replacement`);

// 5. Dates: the scan was run before the days it covers, and no row claims a later check.
check(CONFIRMED_SCAN.checked < CONFIRMED_SCAN.from, `scan date ${CONFIRMED_SCAN.checked} is not before the first scanned day ${CONFIRMED_SCAN.from}`);
for (const s of SAILINGS) check(!s.verified || s.verified <= CONFIRMED_SCAN.checked, `${s.id}: verified ${s.verified} is later than the scan date ${CONFIRMED_SCAN.checked}`);

// 6. Every route page: has a confirmed row, shows every confirmed sailing for its port pairs,
//    shown >= confirmed, and its copy renders without prices or blanks.
const today = new Date().toISOString().slice(0, 10);
const inRoute = (route) => (s) => route.fromPorts.includes(s.from) && route.toPorts.includes(s.to);
console.log(`${"route page".padEnd(34)} ${"confirmed".padStart(9)} ${"12Go-only".padStart(9)} ${"shown".padStart(6)}   (source files: confirmed / 12Go)`);
for (const slug of ROUTE_SLUGS) {
  const route = ROUTE_PAGES[slug];
  const { active } = selectSailings(SAILINGS, route, today);
  const confirmed = active.filter((s) => s.confidence === "confirmed");
  const fileConfirmed = CONFIRMED_SAILINGS.filter(inRoute(route));
  const file12go = TWELVEGO_SAILINGS.filter(inRoute(route));
  check(confirmed.length > 0, `route page ${slug}: no confirmed sailings`);
  check(active.length >= confirmed.length, `route page ${slug}: shown (${active.length}) < confirmed (${confirmed.length})`);
  const onPage = new Set(active.map((s) => s.id));
  for (const c of fileConfirmed) check(onPage.has(c.id), `route page ${slug}: confirmed sailing ${c.id} is missing`);
  check(active.length === file12go.length + fileConfirmed.length - file12go.filter((t) => REPLACED_BY_CONFIRMED.has(t.id)).length,
    `route page ${slug}: shown count doesn't add up`);
  for (const rel of route.related) check(Boolean(ROUTE_PAGES[rel]), `route page ${slug}: related slug "${rel}" does not exist`);
  if (active.length) {
    const ctx = routeContext(route, active, CONFIRMED_SCAN.checkedText);
    const text = [route.lead(ctx), ...route.faqs(ctx).flatMap((f) => [f.q, f.a])].join(" ");
    check(!/undefined|null|NaN|Infinity/.test(text), `route page ${slug}: copy contains undefined/null/NaN`);
    check(!/A\$\s?\d/.test(text), `route page ${slug}: copy mentions a price`);
  }
  console.log(`${slug.padEnd(34)} ${String(confirmed.length).padStart(9)} ${String(active.length - confirmed.length).padStart(9)} ${String(active.length).padStart(6)}   (${fileConfirmed.length} / ${file12go.length})`);
}

console.log(`\n${SAILINGS.length} sailings shown: ${shown.length} confirmed, ${SAILINGS.length - shown.length} 12Go-only typical (${REPLACED_BY_CONFIRMED.size} 12Go listings replaced by confirmed ones, one each).`);
console.log(`${shown.filter((s) => !s.arrives).length} confirmed sailings have no arrival time.`);
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("All checks passed.");
