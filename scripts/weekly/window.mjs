// Keeps the rolling window of nightly scans that the daily workflow matches: the newest N scan dates.
// Usage: node scripts/weekly/window.mjs --dir window --add out/scan-2026-10-28.json [--seed seedDir --seed-dates 2026-10-25,2026-10-26] [--keep 7]
// - --seed copies scan-*.json files from an earlier run's downloaded artifacts (only --seed-dates if given).
// - --add puts tonight's scan in, replacing any earlier scan of the same date.
// - Files are slimmed to what match.py reads (no sample cards or debug info) and only the newest --keep dates stay.
// Prints the window and, in GitHub Actions, writes nights=<count> to $GITHUB_OUTPUT.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, "")] = argv[i + 1];
if (!args.dir) { console.error("usage: window.mjs --dir DIR [--add FILE] [--seed DIR --seed-dates a,b] [--keep 7]"); process.exit(2); }
const keep = +(args.keep || 7);
fs.mkdirSync(args.dir, { recursive: true });

const slim = (scan) => ({
  date: scan.date, scannedAt: scan.scannedAt,
  routes: Object.fromEntries(Object.entries(scan.routes).map(([k, r]) => [k, {
    header: r.header, captured: r.captured, empty: r.empty, failed: r.failed, error: r.error || null, sailings: r.sailings,
  }])),
});
const put = (file) => {
  const scan = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!/^\d{4}-\d\d-\d\d$/.test(scan.date || "") || !scan.routes) throw new Error(`${file} is not a scan file`);
  fs.writeFileSync(path.join(args.dir, `scan-${scan.date}.json`), JSON.stringify(slim(scan)));
  return scan.date;
};

if (args.seed) {
  const want = args["seed-dates"] ? new Set(args["seed-dates"].split(",").map((s) => s.trim())) : null;
  const files = fs.readdirSync(args.seed, { recursive: true }).map(String).filter((f) => /scan-\d{4}-\d\d-\d\d\.json$/.test(f));
  for (const f of files) {
    const date = f.match(/scan-(\d{4}-\d\d-\d\d)\.json$/)[1];
    if (want && !want.has(date)) { console.log(`seed: skipping ${date}`); continue; }
    console.log(`seed: ${put(path.join(args.seed, f))}`);
  }
}
if (args.add) console.log(`added: ${put(args.add)}`);

const all = fs.readdirSync(args.dir).filter((f) => /^scan-\d{4}-\d\d-\d\d\.json$/.test(f)).sort();
for (const f of all.slice(0, Math.max(0, all.length - keep))) { fs.rmSync(path.join(args.dir, f)); console.log(`dropped: ${f}`); }
const left = all.slice(-keep);
console.log(`window: ${left.length} of ${keep} nights: ${left.map((f) => f.slice(5, 15)).join(", ")}`);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `nights=${left.length}\n`);
