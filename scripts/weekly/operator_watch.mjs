// Weekly check of the operators' own timetable pages (scripts/weekly/operator-pages.json).
// Usage: node scripts/weekly/operator_watch.mjs --prev prevDir --out outDir [--report report.md] [--flags flags.json]
// For each page: one GET (honest user agent, robots.txt respected), pull out every time on it, and report
//   1. what changed since last week's snapshot (times added / removed): the reliable "this timetable changed" signal;
//   2. times in data/operator-sailings.json for that operator that are no longer anywhere on the page (likely
//      removed or moved), reported when they first appear so the same gap isn't repeated every week.
// It doesn't edit data/operator-sailings.json: pages are laid out differently per operator, so a person (or Claude,
// asked to) updates the rows from the report. Read-only on every site.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2), args = {};
for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, "")] = argv[i + 1];
if (!args.out) { console.error("usage: operator_watch.mjs --out DIR [--prev DIR] [--report FILE] [--flags FILE]"); process.exit(2); }
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const config = JSON.parse(fs.readFileSync(path.join(here, "operator-pages.json"), "utf8"));
const ops = JSON.parse(fs.readFileSync(path.join(here, "..", "..", "data", "operator-sailings.json"), "utf8"));
const UA = "IslandBounceTimetableCheck/1.0 (+https://www.islandbouncetravel.com/about; once a week, one request per page)";
const prevFile = args.prev && path.join(args.prev, "operator-snapshot.json");
const prev = prevFile && fs.existsSync(prevFile) ? JSON.parse(fs.readFileSync(prevFile, "utf8")) : { pages: {} };

const visible = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ");
// "8.30", "08:30", "1:30 PM" -> "HH:MM". Boats don't leave between 00:00 and 05:59, so 1:00-5:59 without am/pm is
// read as afternoon (pages often write 1.30 for 13:30). A 24-hour time with a stray am/pm ("13:00 AM" on Scoot's page)
// keeps its hour.
export function timesOn(text) {
  const norm = (h, m, ap) => {
    h = +h;
    if (h >= 13) {} // already 24-hour
    else if (ap) h = (h % 12) + (/p/i.test(ap) ? 12 : 0);
    else if (h >= 1 && h <= 5) h += 12;
    return `${String(h).padStart(2, "0")}:${m}`;
  };
  return [...new Set([...text.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\s*([ap]\.?m\.?)?/gi)].map((m) => norm(m[1], m[2], m[3])))].sort();
}
// Only the "*" group matters for us. Rules match from the start of path+query; "*" is any characters and a trailing
// "$" anchors the end. Longest matching rule wins; Allow beats Disallow on a tie.
export function robotsAllows(robots, pathAndQuery) {
  const group = (robots.split(/^\s*user-agent:\s*\*\s*$/im)[1] || "").split(/^\s*user-agent:/im)[0];
  const matches = (rule) => new RegExp("^" + rule.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$|\$$/, "$")).test(pathAndQuery);
  let best = { len: -1, allow: true };
  for (const m of group.matchAll(/^\s*(allow|disallow):\s*(\S*)/gim)) {
    const rule = m[2]; if (!rule || !matches(rule)) continue;
    const allow = m[1].toLowerCase() === "allow";
    if (rule.length > best.len || (rule.length === best.len && allow)) best = { len: rule.length, allow };
  }
  return best.allow;
}

// One retry: a site can be slow, or turn away requests from cloud servers like GitHub's (Angkal, El Rey and Caspla did on
// 27 Oct 2026 while answering a normal connection). We don't try to get round that; those pages are listed to check
// by hand, and only a site that starts failing this week counts as news.
async function get(url) {
  try { return await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25000) }); }
  catch { await new Promise((r) => setTimeout(r, 10000)); return fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(40000) }); }
}

const now = new Date().toISOString();
const snapshot = { checkedAt: now, pages: {}, unreadable: {} };
const changed = [], newlyMissing = [], failed = [], quiet = [];
for (const page of config.pages) {
  const key = page.operators[0];
  const before = prev.pages[key];
  const u = new URL(page.url);
  try {
    let robots = "";
    try { const r = await fetch(`${u.origin}/robots.txt`, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(15000) }); if (r.ok) robots = await r.text(); } catch {}
    if (!robotsAllows(robots, u.pathname + u.search)) throw new Error("robots.txt asks automated readers not to fetch this page");
    const res = await get(page.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const times = timesOn(visible(await res.text()));
    if (!times.length) throw new Error("no times found on the page (layout change, or the timetable moved)");
    const ours = page.checkOurs ? [...new Set(ops.filter((r) => page.operators.includes(r.operator)).map((r) => r.dep))].sort() : [];
    const missing = ours.filter((t) => !times.includes(t));
    snapshot.pages[key] = { url: page.url, times, missing };
    if (before && before.times) {
      const added = times.filter((t) => !before.times.includes(t)), removed = before.times.filter((t) => !times.includes(t));
      if (added.length || removed.length) changed.push({ key, url: page.url, added, removed });
      else quiet.push(key);
    } else quiet.push(key);
    const fresh = missing.filter((t) => !(before && (before.missing || []).includes(t)));
    if (fresh.length) newlyMissing.push({ key, url: page.url, times: fresh });
  } catch (e) {
    const error = String(e.message || e).slice(0, 160);
    // New = it read fine last time. Snapshots from before 27 Oct 2026 have no `unreadable` list: there, a page missing
    // from last week's readings was already failing.
    const known = prev.unreadable ? key in prev.unreadable : Object.keys(prev.pages).length > 0 && !prev.pages[key];
    failed.push({ key, url: page.url, error, isNew: !known });
    snapshot.unreadable[key] = error;
    if (before) snapshot.pages[key] = before; // keep the last reading so a later week compares against something real
  }
  await new Promise((r) => setTimeout(r, 2000)); // a pause between sites
}

fs.mkdirSync(args.out, { recursive: true });
fs.writeFileSync(path.join(args.out, "operator-snapshot.json"), JSON.stringify(snapshot, null, 1));
const firstRun = !Object.keys(prev.pages).length;
const lines = [
  `## Operator timetable check, ${now.slice(0, 10)}`,
  "",
  `Read ${config.pages.length - failed.length} of ${config.pages.length} operator timetable pages.${firstRun ? " First run: this is the starting point, so changes are reported from next week." : ""}`,
  "",
  `### Timetable pages that changed since last week (${changed.length})`,
  ...(changed.length ? changed.map((c) => `- **${c.key}** (${c.url}): ${c.added.length ? `new times ${c.added.join(", ")}` : ""}${c.added.length && c.removed.length ? "; " : ""}${c.removed.length ? `gone ${c.removed.join(", ")}` : ""}`) : ["- none"]),
  "",
  `### Times in our operator list that aren't on the operator's page any more (${newlyMissing.length} operator(s), new this week)`,
  "Check the page: the sailing may have moved or stopped. Update data/operator-sailings.json (or ask Claude to).",
  ...(newlyMissing.length ? newlyMissing.map((m) => `- **${m.key}** (${m.url}): ${m.times.join(", ")}`) : ["- none"]),
  "",
  `### Pages that couldn't be read (${failed.length}${failed.length ? `, ${failed.filter((f) => f.isNew).length} new this week` : ""})`,
  "Some operator sites turn away requests from cloud servers like GitHub's. Open these yourself now and then.",
  ...(failed.length ? failed.map((f) => `- ${f.key} (${f.url}): ${f.error}${f.isNew ? " (new this week)" : ""}`) : ["- none"]),
  "",
  "### Not checked automatically",
  ...config.manual.map((m) => `- ${m.operators.join(", ")}: ${m.why}. Check these by hand now and then.`),
  "",
].join("\n");
if (args.report) fs.writeFileSync(args.report, lines);
const newlyFailed = failed.filter((f) => f.isNew).length;
if (args.flags) fs.writeFileSync(args.flags, JSON.stringify({ changed: changed.length, newlyMissing: newlyMissing.length, failed: failed.length, newlyFailed, firstRun, notable: changed.length + newlyMissing.length + newlyFailed > 0 }));
console.log(lines);
