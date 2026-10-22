// Weekly check of the live site's pages and booking links.
// Usage: node scripts/weekly/check_links.mjs [out.md]      (SITE_URL overrides https://islandbouncetravel.com)
// 1. Every page in the sitemap loads, and route pages still show their timetable rows.
// 2. Every booking link on those pages carries our affiliate ID (z) and sub_id.
// 3. Each distinct booking route opens a real 12Go route page with the affiliate ID kept (in the URL or a cookie).
// Read-only: it only opens pages and reads them. It NEVER clicks a trip, "Book now" or anything that adds to a cart.
import { chromium } from "playwright";
import fs from "node:fs";

const SITE = (process.env.SITE_URL || "https://islandbouncetravel.com").replace(/\/$/, "");
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
    warnings.push(`Route page shows no sailings: ${url}`);
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

// 3: open one link per booking route in a real browser (12Go builds its pages with JavaScript).
const byRoute = new Map();
for (const [link, page] of links) {
  const u = new URL(link);
  if (!/^\/en\/travel\/[^/]+\/[^/]+/.test(u.pathname)) continue; // home page / search links: checked for z above only
  const k = u.host + u.pathname;
  if (!byRoute.has(k) || u.searchParams.has("people")) byRoute.set(k, { link, page }); // prefer a link with travellers
}
const browser = await chromium.launch();
let opened = 0;
for (const { link, page } of byRoute.values()) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } }); // fresh cookies per link
  const tab = await ctx.newPage();
  try {
    const res = await tab.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
    const status = res ? res.status() : 0;
    await tab.waitForSelector(".trip-cta, .trips-container", { timeout: 25000 }).catch(() => {});
    const final = new URL(tab.url());
    const cookies = await ctx.cookies();
    const zKept = final.searchParams.get("z") === Z || cookies.some((c) => c.value.includes(Z));
    const route = final.pathname.match(/^\/en\/travel\/([^/]+)\/([^/]+)/);
    const asked = new URL(link);
    const trips = await tab.locator(".trip-card").count();
    opened++;
    if (status >= 400) problems.push(`Booking page returns HTTP ${status}: ${link} (from ${page})`);
    else if (!route) problems.push(`Booking link doesn't open a route page (lands on ${final.href}): ${link} (from ${page})`);
    else {
      if (!zKept) problems.push(`Affiliate ID lost after opening ${link}: lands on ${final.href} with no z=${Z} in the URL or cookies`);
      if (final.pathname !== asked.pathname) {
        const lost = ["people", "adults", "date", "date2"].filter((p) => asked.searchParams.has(p) && !final.searchParams.has(p));
        notes.push(`${asked.pathname} redirects to ${final.pathname}${lost.length ? ` and drops ${lost.join(", ")}` : ""}`);
      }
      if (!trips) warnings.push(`Booking page shows no trips: ${link} (from ${page})`);
    }
  } catch (e) {
    problems.push(`Booking page didn't load: ${link} (${shortError(e)})`);
  }
  await ctx.close();
}
await browser.close();

const section = (title, rows) => (rows.length ? ["", `### ${title} (${rows.length})`, ...rows.map((r) => `- ${r}`)] : []);
const report = [
  `## Booking link check: ${problems.length ? `${problems.length} problem(s)` : "all good"}`,
  "",
  `Checked ${pages.length} pages on ${SITE}, ${links.size} booking links, and opened ${opened} of ${byRoute.size} booking routes.`,
  ...section("Problems (fix these: they cost bookings or commission)", problems),
  ...section("Warnings", warnings),
  ...section("Redirects (work, but worth pointing straight at the final address)", notes),
  "",
].join("\n");
console.log(report);
if (outPath) fs.writeFileSync(outPath, report);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
process.exit(problems.length ? 1 : 0);
