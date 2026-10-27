// Weekly check of the live site's pages and booking links.
// Usage: node scripts/weekly/check_links.mjs [out.md]      (SITE_URL overrides https://www.islandbouncetravel.com)
// 1. Every page in the sitemap loads, and route pages still show their timetable rows (or the "Check live times" box).
// 2. Every booking link on those pages carries our affiliate ID (z) and sub_id, and has the shape the booking site
//    expects: our booking host, /en/travel/<from>/<to> with known port slugs, and sane date / travellers values.
// It only reads OUR site. It doesn't open the booking site (12Go): their terms (12go.asia/en/terms §9.3c) don't
// allow automated access without written approval (decided 27 Oct 2026).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE = (process.env.SITE_URL || "https://www.islandbouncetravel.com").replace(/\/$/, "");
const Z = "17069158", SUB_ID = "islandbounce-web";
const outPath = process.argv[2];
const problems = [], warnings = [], notes = [];
const shortError = (e) => String((e && e.message) || e).split("\n")[0].slice(0, 200);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

// 1 + 2: site pages (plain HTTP, as a search engine sees them).
const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (!pages.length) problems.push(`${SITE}/sitemap.xml lists no pages`);
const links = new Map(); // booking URL -> first page it was seen on
for (const url of pages) {
  let res, html;
  try { res = await fetch(url, { redirect: "follow" }); html = await res.text(); }
  catch (e) { problems.push(`Page didn't load: ${url} (${shortError(e)})`); continue; }
  if (!res.ok) { problems.push(`Page returns HTTP ${res.status}: ${url}`); continue; }
  if (/\/indonesia\/routes\/[^/]+$/.test(new URL(url).pathname) && !html.includes("data-sailing-id=")) {
    // No confirmed daily sailings this week is allowed: the page then shows a "Check live times" box instead.
    if (html.includes(">Check live times<")) notes.push(`Route page shows "Check live times" this week (no confirmed daily sailings): ${url}`);
    else problems.push(`Route page shows neither sailings nor the "Check live times" box: ${url}`);
  }
  for (const m of html.matchAll(/href="(https:\/\/(?:booking\.islandbouncetravel\.com|(?:www\.)?12go\.asia)[^"]*)"/g)) {
    const link = decode(m[1]);
    if (!links.has(link)) links.set(link, url);
  }
}
for (const [link, page] of links) {
  const q = new URL(link).searchParams;
  if (q.get("z") !== Z) problems.push(`Booking link without our affiliate ID (z=${Z}): ${link} on ${page}`);
  else if (q.get("sub_id") !== SUB_ID) warnings.push(`Booking link without sub_id=${SUB_ID}: ${link} on ${page}`);
}

// 3: link shape, checked on our side only. The port slugs come from data/ports.js through the same slug() the site uses.
const root = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const { BALI_PORTS, ISLAND_PORTS } = await import(pathToFileURL(path.join(root, "data", "ports.js")).href);
const { slug } = await import(pathToFileURL(path.join(root, "lib", "affiliateLinks.js")).href);
const SLUGS = new Set([...BALI_PORTS, ...ISLAND_PORTS].map((p) => slug(p.name)));
const routes = new Set();
for (const [link, page] of links) {
  const u = new URL(link);
  if (u.host !== "booking.islandbouncetravel.com") warnings.push(`Booking link goes to ${u.host}, not our booking site: ${link} on ${page}`);
  const m = u.pathname.match(/^\/en\/travel\/([^/]+)\/([^/]+)\/?$/);
  if (!m) { if (u.pathname !== "/" && u.pathname !== "") warnings.push(`Booking link isn't a route link (/en/travel/<from>/<to>): ${link} on ${page}`); continue; }
  routes.add(`${m[1]}>${m[2]}`);
  for (const s of [m[1], m[2]]) if (!SLUGS.has(s)) problems.push(`Booking link uses an unknown port "${s}": ${link} on ${page}`);
  if (m[1] === m[2]) problems.push(`Booking link goes from a port to itself: ${link} on ${page}`);
  const q = u.searchParams;
  for (const d of ["date", "date2"]) if (q.has(d) && !/^\d{4}-\d\d-\d\d$/.test(q.get(d))) problems.push(`Booking link has a bad ${d} "${q.get(d)}": ${link} on ${page}`);
  if (q.has("date2") && q.has("date") && q.get("date2") < q.get("date")) problems.push(`Booking link returns before it departs: ${link} on ${page}`);
  if (q.has("people") || q.has("adults")) {
    const p = +q.get("people"), a = +q.get("adults");
    if (!(p >= 1 && p <= 20) || p !== a) problems.push(`Booking link has travellers people=${q.get("people")} adults=${q.get("adults")}: ${link} on ${page}`);
  }
}
// Known redirect on the booking site (checked by hand 22 Oct 2026): benoa-nusa-dua -> tanjung-benoa-nusa-dua, which
// keeps z and the date but drops the travellers.
if ([...routes].some((r) => r.includes("benoa-nusa-dua"))) notes.push("Links to benoa-nusa-dua redirect to 12Go's tanjung-benoa-nusa-dua, which drops the travellers (known, checked by hand 22 Oct 2026)");

const section = (title, rows) => (rows.length ? ["", `### ${title} (${rows.length})`, ...rows.map((r) => `- ${r}`)] : []);
const report = [
  `## Booking link check: ${problems.length ? `${problems.length} problem(s)` : "all good"}`,
  "",
  `Checked ${pages.length} pages on ${SITE} and ${links.size} booking links (${routes.size} routes). The booking site itself isn't opened.`,
  ...section("Problems (fix these: they cost bookings or commission)", problems),
  ...section("Warnings", warnings),
  ...section("Notes", notes),
  "",
].join("\n");
console.log(report);
if (outPath) fs.writeFileSync(outPath, report);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
process.exit(problems.length ? 1 : 0);
