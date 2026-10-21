#!/usr/bin/env node
// Sanity checks on the sailings the site shows. Run after rebuilding data/confirmed.js or data/twelvego.js:
//
//     node scripts/check-data.mjs
//
// Loads the real data modules (resolving the "@/" import alias), so it checks exactly what the site
// imports. Exits non-zero if any check fails. Needs Node 22.15+ (module.registerHooks).
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

const { SAILINGS } = await import("@/data/sailings");
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

// 3. Every confirmed row has operator, departs and fareAUD.
const shown = SAILINGS.filter((s) => s.confidence === "confirmed");
for (const s of shown) {
  check(Boolean(s.operator), `${s.id}: no operator`);
  check(/^\d{2}:\d{2}$/.test(s.departs || ""), `${s.id}: departs "${s.departs}" is not HH:MM`);
  check(typeof s.fareAUD === "number" && s.fareAUD > 0, `${s.id}: no fareAUD`);
}
check(shown.length === CONFIRMED_SAILINGS.length, `${CONFIRMED_SAILINGS.length - shown.length} confirmed sailings were merged away as duplicates of other confirmed sailings`);

// 4. Every route page has at least one confirmed row, and its copy renders.
const today = new Date().toISOString().slice(0, 10);
for (const slug of ROUTE_SLUGS) {
  const route = ROUTE_PAGES[slug];
  const { active } = selectSailings(SAILINGS, route, today);
  const confirmed = active.filter((s) => s.confidence === "confirmed").length;
  check(confirmed > 0, `route page ${slug}: no confirmed sailings`);
  for (const rel of route.related) check(Boolean(ROUTE_PAGES[rel]), `route page ${slug}: related slug "${rel}" does not exist`);
  if (!active.length) continue;
  const ctx = routeContext(route, active, CONFIRMED_SCAN.text);
  const text = [route.lead(ctx), ...route.faqs(ctx).flatMap((f) => [f.q, f.a])].join(" ");
  check(!/undefined|null|NaN|Infinity/.test(text), `route page ${slug}: copy contains undefined/null/NaN`);
  check(!/A\$\s?\d/.test(text), `route page ${slug}: copy mentions a price`);
  console.log(`${slug.padEnd(34)} ${String(confirmed).padStart(3)} confirmed, ${String(active.length - confirmed).padStart(3)} typical`);
}

const replaced = TWELVEGO_SAILINGS.length - SAILINGS.filter((s) => s.confidence === "unconfirmed").length;
console.log(`\n${SAILINGS.length} sailings shown: ${shown.length} confirmed, ${SAILINGS.length - shown.length} 12Go-only typical (${replaced} 12Go listings replaced by confirmed ones).`);
console.log(`${shown.filter((s) => !s.arrives).length} confirmed sailings have no arrival time.`);
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("All checks passed.");
