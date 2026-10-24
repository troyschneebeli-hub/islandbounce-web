#!/usr/bin/env node
// Sanity checks on the sailings the site shows. Run after scripts/build-confirmed.mjs (the weekly Action
// runs it before publishing), and again after `npm run build` to check the rendered route pages too:
//
//     node scripts/check-data.mjs
//
// Loads the real data modules (resolving the "@/" import alias), so it checks exactly what the site
// imports. Prints counts per route page and exits non-zero if any check fails. Needs Node 22.15+.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
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

const { SAILINGS, PLANNER_SAILINGS, SAILINGS_UPDATED } = await import("@/data/sailings");
const { CONFIRMED_SCAN } = await import("@/data/confirmed");
const { BALI_PORTS, ISLAND_PORTS } = await import("@/data/ports");
const { ROUTE_PAGES, ROUTE_SLUGS } = await import("@/data/routePages");
const { selectSailings, routeContext } = await import("@/lib/timetable");
// daily-sailings.json (every bookable daily boat, from 24 Oct 2026); older data only has the confirmed daily file.
const dailyFile = existsSync(join(ROOT, "data", "generated", "daily-sailings.json")) ? "daily-sailings.json" : "confirmed-daily-sailings.json";
const daily = JSON.parse(readFileSync(join(ROOT, "data", "generated", dailyFile), "utf8"));

const failures = [], warnings = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const warn = (ok, message) => { if (!ok) warnings.push(message); };

// 1. Every listed row is in the daily file (same operator, route and departure).
const dailyKeys = new Set(daily.sailings.map((s) => `${s.operator}|${s.fromName}|${s.toName}|${s.departs}`));
for (const s of SAILINGS) {
  check(dailyKeys.has(`${s.operatorBrand}|${s.from}|${s.to}|${s.departs}`), `${s.id}: not in data/generated/${dailyFile}`);
  check(["confirmed", "listed"].includes(s.confidence) && s.runsDaily === true, `${s.id}: on the route pages but not daily`);
}
// 2. No duplicate ids (route-page rows and planner rows).
for (const [name, list] of [["SAILINGS", SAILINGS], ["PLANNER_SAILINGS", PLANNER_SAILINGS]]) {
  const ids = new Map();
  for (const s of list) ids.set(s.id, (ids.get(s.id) || 0) + 1);
  for (const [id, n] of ids) check(n === 1, `${name}: duplicate id ${id} (${n} times)`);
}

// 3. Every from/to is a port in data/ports.js.
const PORTS = new Set([...BALI_PORTS, ...ISLAND_PORTS].map((p) => p.name));
for (const s of PLANNER_SAILINGS) {
  check(PORTS.has(s.from), `${s.id}: from "${s.from}" is not in data/ports.js`);
  check(PORTS.has(s.to), `${s.id}: to "${s.to}" is not in data/ports.js`);
}

// 4. Every listed row has operator, departs and a price.
for (const s of SAILINGS) {
  check(Boolean(s.operator), `${s.id}: no operator`);
  check(/^\d{2}:\d{2}$/.test(s.departs || ""), `${s.id}: departs "${s.departs}" is not HH:MM`);
  check(typeof s.fareAUD === "number" && s.fareAUD > 0, `${s.id}: no priceAUD`);
}

// 5. Dates: the check was run before the days it covers, and nothing claims a later check.
// The nightly run checks dates up to 3 days ahead, so the latest check is before the last scanned day, and never in the future.
check(CONFIRMED_SCAN.checked <= CONFIRMED_SCAN.to, `check date ${CONFIRMED_SCAN.checked} is after the last scanned day ${CONFIRMED_SCAN.to}`);
check(CONFIRMED_SCAN.checked <= new Date().toISOString().slice(0, 10), `check date ${CONFIRMED_SCAN.checked} is in the future`);
check(SAILINGS_UPDATED === CONFIRMED_SCAN.checked, `SAILINGS_UPDATED ${SAILINGS_UPDATED} is not the check date ${CONFIRMED_SCAN.checked}`);
for (const s of PLANNER_SAILINGS) check(!s.verified || s.verified <= CONFIRMED_SCAN.checked, `${s.id}: verified ${s.verified} is later than the check date`);

// 6. Route pages: its copy renders without prices or blanks; and, if the site has been built, the rendered page
//    shows exactly its confirmed daily rows and that count. A page with no confirmed daily sailings this week is a
//    warning, not a failure: it stays up with the "Check live times" box (no table), and the weekly report lists it.
const today = new Date().toISOString().slice(0, 10);
const listedIds = new Set(SAILINGS.map((s) => s.id));
const htmlDir = join(ROOT, ".next", "server", "app", "indonesia", "routes");
const haveHtml = existsSync(htmlDir);
console.log(`${"route page".padEnd(34)} ${"daily".padStart(5)} ${"rendered".padStart(8)}`);
for (const slug of ROUTE_SLUGS) {
  const route = ROUTE_PAGES[slug];
  const { active } = selectSailings(SAILINGS, route, today);
  warn(active.length > 0, `route page ${slug}: no confirmed daily sailings this week, so it shows "Check live times" instead of a table`);
  for (const rel of route.related) check(Boolean(ROUTE_PAGES[rel]), `route page ${slug}: related slug "${rel}" does not exist`);
  if (active.length) {
    const ctx = routeContext(route, active, CONFIRMED_SCAN.checkedText);
    const text = [route.lead(ctx), ...route.faqs(ctx).flatMap((f) => [f.q, f.a])].join(" ");
    check(!/undefined|null|NaN|Infinity/.test(text), `route page ${slug}: copy contains undefined/null/NaN`);
    check(!/A\$\s?\d/.test(text), `route page ${slug}: copy mentions a price`);
  }
  let rendered = "-";
  if (haveHtml) {
    const file = join(htmlDir, `${slug}.html`);
    if (!existsSync(file)) { check(false, `route page ${slug}: no built HTML (run npm run build)`); continue; }
    const html = readFileSync(file, "utf8");
    const rows = [...html.matchAll(/data-sailing-id="([^"]+)"/g)].map((m) => m[1]);
    rendered = rows.length;
    check(rows.length === active.length, `route page ${slug}: renders ${rows.length} rows, expected ${active.length}`);
    for (const id of rows) check(listedIds.has(id), `route page ${slug}: renders ${id}, which is not a confirmed daily sailing`);
    if (active.length) {
      check(new RegExp(`>${active.length}<!-- --> ?</div><div[^>]*>daily departures?<`).test(html) || html.includes(`>${active.length}</div><div`),
        `route page ${slug}: summary count doesn't show ${active.length}`);
    } else {
      check(html.includes(">Check live times<"), `route page ${slug}: has no daily sailings but no "Check live times" box`);
    }
    check(!/Typical departures|See departure times|<details/.test(html), `route page ${slug}: still has a typical/collapsed block`);
  }
  console.log(`${slug.padEnd(34)} ${String(active.length).padStart(5)} ${String(rendered).padStart(8)}`);
}
if (!haveHtml) console.log("(no .next build found: rendered pages not checked; run npm run build, then this again)");
// One or two quiet routes is a normal week; many empty pages means the data went wrong, so don't publish it.
const MAX_EMPTY_PAGES = 5;
const emptyPages = ROUTE_SLUGS.filter((slug) => !selectSailings(SAILINGS, ROUTE_PAGES[slug], today).active.length);
check(emptyPages.length <= MAX_EMPTY_PAGES, `${emptyPages.length} route pages have no confirmed daily sailings (more than ${MAX_EMPTY_PAGES}): ${emptyPages.join(", ")}`);

const typical = PLANNER_SAILINGS.length - SAILINGS.length;
console.log(`\n${SAILINGS.length} daily sailings on the route pages (${SAILINGS.filter((s) => s.confidence === "confirmed").length} confirmed with the operator); ${typical} more in the Trip Planner, labelled typical.`);
console.log(`${SAILINGS.filter((s) => !s.arrives).length} daily sailings have no arrival time.`);
// "WARNING:" lines are copied into the weekly report email.
if (warnings.length) console.log(`\n${warnings.map((w) => `WARNING: ${w}`).join("\n")}`);
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("All checks passed.");
