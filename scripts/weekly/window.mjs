// Keeps the window of nightly scans that the daily workflow matches: ONE slot per weekday (Mon..Sun), each the latest
// scan of that weekday, so every weekday is always covered even when a night is missed.
// Per-route memory: when a route fails to load tonight (12Go's bot check, an error), the slot keeps that route's last
// good reading if it's at most --max-age days old, instead of losing it. Older readings are dropped (failed).
//
// Usage: node scripts/weekly/window.mjs --dir window --add out/scan-2026-10-28.json [--seed seedDir --seed-dates a,b] [--max-age 14]
// - --seed adds scan-*.json files from an earlier run's downloaded artifacts first (only --seed-dates if given).
// - Files are slimmed to what match.py reads and named scan-<date of the slot's latest scan>.json.
// Prints the window and, in GitHub Actions, writes nights=<slots filled> to $GITHUB_OUTPUT (publishing needs 7).
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, "")] = argv[i + 1];
if (!args.dir) { console.error("usage: window.mjs --dir DIR [--add FILE] [--seed DIR --seed-dates a,b] [--max-age 14]"); process.exit(2); }
const maxAgeDays = +(args["max-age"] || 14);
fs.mkdirSync(args.dir, { recursive: true });

const DAY = 86400000;
const t = (iso) => Date.parse(`${iso}T00:00:00Z`);
const weekday = (iso) => new Date(t(iso)).getUTCDay();
const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const isScanFile = (f) => /^scan-\d{4}-\d\d-\d\d\.json$/.test(path.basename(f));
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

// The slots on disk: weekday -> { file, scan }.
const slots = new Map();
for (const f of fs.readdirSync(args.dir).filter(isScanFile)) {
  const scan = read(path.join(args.dir, f));
  const w = weekday(scan.date), have = slots.get(w);
  if (!have || have.scan.date < scan.date) { if (have) fs.rmSync(have.file); slots.set(w, { file: path.join(args.dir, f), scan }); }
  else fs.rmSync(path.join(args.dir, f)); // an older scan of the same weekday
}

const ok = (r) => r && !r.failed;
function add(file) {
  const scan = read(file);
  if (!/^\d{4}-\d\d-\d\d$/.test(scan.date || "") || !scan.routes) throw new Error(`${file} is not a scan file`);
  const w = weekday(scan.date), old = slots.get(w);
  if (old && old.scan.date > scan.date) { console.log(`skip ${scan.date}: the ${NAMES[w]} slot already has ${old.scan.date}`); return; }
  const routes = {}, kept = [];
  for (const k of new Set([...Object.keys(scan.routes), ...Object.keys(old ? old.scan.routes : {})])) {
    const r = scan.routes[k], prev = old && old.scan.routes[k];
    const prevDate = prev && (prev.date || old.scan.date);
    if (ok(r) || !ok(prev) || t(scan.date) - t(prevDate) > maxAgeDays * DAY) {
      routes[k] = r ? { header: r.header, captured: r.captured, empty: r.empty, failed: r.failed, error: r.error || null, sailings: r.sailings, date: scan.date }
        : { header: 0, captured: 0, empty: true, failed: true, error: "not scanned", sailings: [], date: scan.date };
    } else { routes[k] = { ...prev, date: prevDate }; kept.push(`${k} (${prevDate})`); }
  }
  if (old) fs.rmSync(old.file);
  const out = path.join(args.dir, `scan-${scan.date}.json`);
  const merged = { date: scan.date, scannedAt: scan.scannedAt, routes };
  fs.writeFileSync(out, JSON.stringify(merged));
  slots.set(w, { file: out, scan: merged });
  console.log(`${NAMES[w]} slot <- ${scan.date}${kept.length ? `; kept the last good reading for ${kept.length} route(s) that failed tonight: ${kept.slice(0, 5).join(", ")}${kept.length > 5 ? ", ..." : ""}` : ""}`);
}

if (args.seed) {
  const want = args["seed-dates"] ? new Set(args["seed-dates"].split(",").map((s) => s.trim())) : null;
  const files = fs.readdirSync(args.seed, { recursive: true }).map(String).filter(isScanFile).sort((x, y) => path.basename(x).localeCompare(path.basename(y)));
  for (const f of files) {
    const date = path.basename(f).slice(5, 15);
    if (want && !want.has(date)) { console.log(`seed: skipping ${date}`); continue; }
    add(path.join(args.seed, f));
  }
}
if (args.add) add(args.add);

// A slot more than --max-age days older than the newest one is stale: drop it (the window then waits for that weekday).
const newest = Math.max(...[...slots.values()].map((s) => t(s.scan.date)), 0);
for (const [w, s] of slots) if (newest - t(s.scan.date) > maxAgeDays * DAY) { fs.rmSync(s.file); slots.delete(w); console.log(`dropped stale ${NAMES[w]} slot ${s.scan.date}`); }

const filled = [...slots.entries()].sort((x, y) => x[1].scan.date.localeCompare(y[1].scan.date));
console.log(`window: ${slots.size} of 7 weekdays: ${filled.map(([w, s]) => `${NAMES[w]} ${s.scan.date}`).join(", ")}${slots.size < 7 ? ` (waiting for ${NAMES.filter((_, i) => !slots.has(i)).join(", ")})` : ""}`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `nights=${slots.size}\n`);
