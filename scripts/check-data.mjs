#!/usr/bin/env node
// Sanity checks on the sailings the site shows. Run after scripts/build-timetable.mjs, and again after
// `npm run build` to check the rendered route pages too:
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

const { SAILINGS, PLANNER_SAILINGS, SAILINGS_UPDATED, SAILINGS_CHECKED_TEXT } = await import("@/data/sailings");
const { BALI_PORTS, ISLAND_PORTS } = await import("@/data/ports");
const { ROUTE_PAGES, ROUTE_SLUGS } = await import("@/data/routePages");
const { selectSailings, routeContext, countDepartures } = await import("@/lib/timetable");
const readJson = (name) => JSON.parse(readFileSync(join(ROOT, "data", name), "utf8"));
const operatorRows = readJson("operator-sailings.json");
const { checked } = readJson("operator-sailings-checked.json");
const bookable = new Set(readJson("bookable-pairs.json").pairs);
// Site port name -> the slug data/operator-sailings.json uses.
const PORT_SLUG = {
  Sanur: "sanur", "Padang Bai": "padang-bai", Serangan: "serangan", Kusamba: "kusamba", "Benoa / Nusa Dua": "benoa-nusa-dua",
  "Gili Trawangan": "gili-trawangan", "Gili Air": "gili-air", "Gili Meno": "gili-meno", "Nusa Penida": "nusa-penida",
  "Nusa Lembongan": "nusa-lembongan", "Bangsal (Lombok)": "bangsal",
};

const failures = [], warnings = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const warn = (ok, message) => { if (!ok) warnings.push(message); };

// 1. Every row shown is on an operator's timetable (same operator, route and departure) and on a bookable route, and
//    every route-page row is daily.
const operatorKeys = new Set(operatorRows.map((r) => `${r.operator}|${r.from}|${r.to}|${r.dep}`));
for (const s of PLANNER_SAILINGS) {
  const from = PORT_SLUG[s.from], to = PORT_SLUG[s.to];
  check(operatorKeys.has(`${s.operatorBrand}|${from}|${to}|${s.departs}`), `${s.id}: not in data/operator-sailings.json`);
  check(bookable.has(`${s.operatorBrand}|${from}|${to}`), `${s.id}: route not in data/bookable-pairs.json`);
}
for (const s of SAILINGS) check(s.confidence === "operator" && s.runsDaily === true, `${s.id}: on the route pages but not daily`);
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

// 4. Every row has operator and departs, and no fare (12Go's fares may not be reused; the booking page has live ones).
for (const s of PLANNER_SAILINGS) {
  check(Boolean(s.operator), `${s.id}: no operator`);
  check(/^\d{2}:\d{2}$/.test(s.departs || ""), `${s.id}: departs "${s.departs}" is not HH:MM`);
  check(s.fareAUD == null && s.price == null, `${s.id}: has a fare`);
}

// 5. Dates: the check date is real (not in the future) and every row carries it. data/timetable.js is rebuilt from it.
check(checked <= new Date().toISOString().slice(0, 10), `check date ${checked} is in the future`);
check(SAILINGS_UPDATED === checked, `SAILINGS_UPDATED ${SAILINGS_UPDATED} is not the check date ${checked} (run node scripts/build-timetable.mjs)`);
for (const s of PLANNER_SAILINGS) check(s.verified === checked, `${s.id}: verified ${s.verified} is not the check date ${checked}`);

// 6. Route pages: its copy renders without prices or blanks; and, if the site has been built, the rendered page
//    shows exactly its daily rows and that count. A page with no daily sailings is a warning, not a failure: it stays
//    up with the "Check live times" box (no table).
const today = new Date().toISOString().slice(0, 10);
const listedIds = new Set(SAILINGS.map((s) => s.id));
const htmlDir = join(ROOT, ".next", "server", "app", "indonesia", "routes");
const haveHtml = existsSync(htmlDir);
console.log(`${"route page".padEnd(34)} ${"daily".padStart(5)} ${"rendered".padStart(8)}`);
for (const slug of ROUTE_SLUGS) {
  const route = ROUTE_PAGES[slug];
  const { active } = selectSailings(SAILINGS, route, today);
  warn(active.length > 0, `route page ${slug}: no daily sailings, so it shows "Check live times" instead of a table`);
  for (const rel of route.related) check(Boolean(ROUTE_PAGES[rel]), `route page ${slug}: related slug "${rel}" does not exist`);
  if (active.length) {
    const ctx = routeContext(route, active, SAILINGS_CHECKED_TEXT);
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
    for (const id of rows) check(listedIds.has(id), `route page ${slug}: renders ${id}, which is not a daily sailing`);
    check(!/A\$\s?\d|>Confirmed</.test(html), `route page ${slug}: still shows a fare or a Confirmed tag`);
    if (active.length) {
      // The summary counts real departures (a boat calling at several destinations once), not table rows.
      const n = countDepartures(active);
      check(new RegExp(`>${n}<!-- --> ?</div><div[^>]*>daily departures?<`).test(html) || html.includes(`>${n}</div><div`),
        `route page ${slug}: summary count doesn't show ${n}`);
    } else {
      check(html.includes(">Check live times<"), `route page ${slug}: has no daily sailings but no "Check live times" box`);
    }
    check(!/Typical departures|See departure times|<details/.test(html), `route page ${slug}: still has a typical/collapsed block`);
  }
  console.log(`${slug.padEnd(34)} ${String(active.length).padStart(5)} ${String(rendered).padStart(8)}`);
}
if (!haveHtml) console.log("(no .next build found: rendered pages not checked; run npm run build, then this again)");
// One or two quiet routes is a normal week; many empty pages means the data went wrong, so don't publish it.
// (15% of route pages, at least 5: more one-port-to-one-port pages means one missing operator can empty several.)
const MAX_EMPTY_PAGES = Math.max(5, Math.ceil(ROUTE_SLUGS.length * 0.15));
const emptyPages = ROUTE_SLUGS.filter((slug) => !selectSailings(SAILINGS, ROUTE_PAGES[slug], today).active.length);
check(emptyPages.length <= MAX_EMPTY_PAGES, `${emptyPages.length} route pages have no daily sailings (more than ${MAX_EMPTY_PAGES}): ${emptyPages.join(", ")}`);

const typical = PLANNER_SAILINGS.length - SAILINGS.length;
console.log(`\n${SAILINGS.length} daily sailings on the route pages (${countDepartures(SAILINGS)} real departures), ${SAILINGS_CHECKED_TEXT}; ${typical} more in the Trip Planner, labelled typical.`);
console.log(`${SAILINGS.filter((s) => !s.arrives).length} daily sailings have no arrival time.`);
if (warnings.length) console.log(`\n${warnings.map((w) => `WARNING: ${w}`).join("\n")}`);
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("All checks passed.");
