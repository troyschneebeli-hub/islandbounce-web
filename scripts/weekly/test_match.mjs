// Tests the "daily" rule in match.py and the weekly-reference check in publish_check.py on a made-up 7-night window.
//     node scripts/weekly/test_match.mjs      (needs python3; the PR check has it, Troy's laptop doesn't, so it skips there)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const py = ["python3", "python"].find((p) => { try { execFileSync(p, ["--version"], { stdio: "ignore" }); return true; } catch { return false; } });
if (!py) { console.log("python not found: skipping match.py test (it runs in the PR check)"); process.exit(0); }

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "match-"));
const dir = (n) => { const d = path.join(tmp, n); fs.mkdirSync(d, { recursive: true }); return d; };
const scans = dir("window"), out = dir("new"), old = dir("old"), base = dir("base");

// Operators: A says daily, B doesn't say, C says daily (its route fails to load one night), D says daily (seen 5 nights).
const ops = [
  { operator: "Alpha Fast Boat", from: "sanur", to: "nusa-penida", dep: "08:00", arr: "08:45", days: "Daily per page" },
  { operator: "Bravo Fast Boat", from: "sanur", to: "nusa-penida", dep: "09:00", arr: "09:45", days: "Not stated" },
  { operator: "Charlie Fast Boat", from: "padang-bai", to: "gili-trawangan", dep: "10:00", arr: "11:30", days: "Daily" },
  { operator: "Delta Fast Boat", from: "sanur", to: "nusa-penida", dep: "10:00", arr: "10:45", days: "Daily" },
  { operator: "Echo Fast Boat", from: "sanur", to: "nusa-penida", dep: "11:00", arr: "11:45", days: "Not stated" },
];
fs.writeFileSync(path.join(tmp, "ops.json"), JSON.stringify(ops));
const dates = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"];
const sail = (op, dep, arr) => ({ dep, arr, op, ty: "Ferry", price: 20 });
dates.forEach((d, i) => {
  const sn = [];
  if (i !== 3) sn.push(sail("Alpha Fast Boat", "08:00", "08:45"));       // 6 of 7, operator says daily  -> daily
  if (i !== 3) sn.push(sail("Bravo Fast Boat", "09:00", "09:45"));       // 6 of 7, not stated            -> not daily
  if (i > 1) sn.push(sail("Delta Fast Boat", "10:00", "10:45"));         // 5 of 7, operator says daily  -> not daily
  sn.push(sail("Echo Fast Boat", "11:00", "11:45"));                     // 7 of 7, not stated            -> daily
  const pb = i === 5 ? { header: 0, captured: 0, empty: true, failed: true, error: "blocked", sailings: [] } // failed night
    : { header: 1, captured: 1, empty: false, failed: false, error: null, sailings: [sail("Charlie Fast Boat", "10:00", "11:30")] };
  const scannedAt = new Date(Date.parse(`${d}T17:00:00Z`) - 3 * 86400000).toISOString(); // scanned 3 days ahead
  fs.writeFileSync(path.join(scans, `scan-${d}.json`), JSON.stringify({ date: d, scannedAt, routes: {
    "sanur>nusa-penida": { header: sn.length, captured: sn.length, empty: false, failed: false, error: null, sailings: sn },
    "padang-bai>gili-trawangan": pb,
  } }));
});

execFileSync(py, [path.join(here, "match.py"), "--scans", scans, "--operators", path.join(tmp, "ops.json"), "--out", out], { stdio: "pipe" });
const conf = JSON.parse(fs.readFileSync(path.join(out, "confirmed-sailings.json"), "utf8"));
const daily = Object.fromEntries(conf.sailings.map((s) => [s.operator, s.runsDaily]));
const want = { "Alpha Fast Boat": true, "Bravo Fast Boat": false, "Charlie Fast Boat": true, "Delta Fast Boat": false, "Echo Fast Boat": true };
let failed = 0;
for (const [op, w] of Object.entries(want)) if (daily[op] !== w) { failed++; console.log(`FAIL ${op}: runsDaily ${daily[op]}, want ${w}`); }
if (conf.generatedAt !== "2026-11-05T17:00:00.000Z") { failed++; console.log(`FAIL generatedAt ${conf.generatedAt}, want the latest scan 2026-11-05T17:00:00.000Z`); }
if (JSON.stringify(conf.scannedDates) !== JSON.stringify(dates)) { failed++; console.log(`FAIL scannedDates ${conf.scannedDates}`); }

// publish_check: the weekly reference had 10 Sanur > Nusa Penida daily sailings; now 2 -> blocked "since the weekly reference".
const row = (i) => ({ from: "sanur", to: "nusa-penida", operator: `Ref ${i}`, departs: `0${i}:00` });
fs.writeFileSync(path.join(base, "confirmed-daily-sailings.json"), JSON.stringify({ referenceDate: "2026-10-28", sailings: Array.from({ length: 10 }, (_, i) => row(i)) }));
fs.copyFileSync(path.join(out, "confirmed-daily-sailings.json"), path.join(old, "confirmed-daily-sailings.json"));
let blockedText = "";
try { execFileSync(py, [path.join(here, "publish_check.py"), "--new", out, "--old", old, "--baseline", base, "--min-total", "1"], { stdio: "pipe" }); }
catch (e) { blockedText = String(e.stdout); }
if (!/fell from 10 to \d+ since the weekly reference \(2026-10-28\)/.test(blockedText)) { failed++; console.log(`FAIL publish_check didn't block on the weekly reference:\n${blockedText}`); }

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `${failed} failed` : "match.py daily rule and publish_check weekly reference: all as expected");
process.exit(failed ? 1 : 0);
