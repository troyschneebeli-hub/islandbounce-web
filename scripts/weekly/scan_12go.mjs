// Scans the 12Go white-label booking pages for ONE date across all route pairs.
// Usage: node scripts/weekly/scan_12go.mjs 2026-10-29 out/scan-2026-10-29.json
// Read-only: it only scrolls and reads trip cards. It NEVER clicks a trip, "Book now" or anything that adds to a cart.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { parseRaw } from './parse_card.mjs';

const [date, outPath] = process.argv.slice(2);
if (!/^\d{4}-\d\d-\d\d$/.test(date || '') || !outPath) { console.error('usage: scan_12go.mjs YYYY-MM-DD out.json'); process.exit(2); }
const BASE = process.env.BOOKING_BASE || 'https://booking.islandbouncetravel.com';
const routes = JSON.parse(fs.readFileSync(new URL('./routes.json', import.meta.url)));
const sl = x => (x === 'benoa-nusa-dua' ? 'tanjung-benoa-nusa-dua' : x); // our slug -> 12Go slug

// Runs inside the page: scroll the lazy-loaded list and collect trip cards (text only).
async function scrapePage(page, budgetMs) {
  return page.evaluate(async (budget) => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const t0 = Date.now();
    for (let i = 0; i < 25 && !document.querySelector('.trip-cta'); i++) await sleep(1000);
    const c = document.querySelector('.trips-container');
    if (!c || !document.querySelector('.trip-cta')) return { empty: true, trips: [], header: 0 };
    const hm = document.querySelector('.trips-head-title') && document.querySelector('.trips-head-title').parentElement.innerText.match(/(\d+) trips/);
    const header = hm ? +hm[1] : 0;
    const drop = ['Instant confirmation', 'Recommended', 'Bestseller', 'Fastest', 'Cheapest', 'SOLO FAVORITES'];
    const seen = new Map();
    const grab = () => document.querySelectorAll('.trip-card').forEach(e => {
      if (!e.querySelector('.trip-cta')) return;
      const arr = e.innerText.split('\n').map(s => s.trim()).filter(Boolean);
      seen.set(arr.filter(x => !drop.includes(x)).join('|'), arr.join('|'));
    });
    window.scrollTo(0, c.getBoundingClientRect().top + scrollY); await sleep(1200); grab();
    let last = seen.size, stall = 0, done = false;
    while (Date.now() - t0 < budget && !done) {
      window.scrollBy(0, 300); await sleep(600); grab();
      if (seen.size === last) stall++; else { stall = 0; last = seen.size; }
      if (stall >= 8 || c.getBoundingClientRect().bottom < innerHeight * 0.6) done = true;
    }
    return { empty: false, trips: [...seen.values()], header, done };
  }, budgetMs);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shortError = (e) => String(e && e.message || e).split('\n')[0].slice(0, 200);

// The browser and page are replaced after any error: once a page has crashed or closed, every later
// goto on it fails instantly, which can make a whole day's scan fail in a minute.
let browser = null, page = null;
async function freshPage() {
  try { if (browser) await browser.close(); } catch {}
  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  page = await ctx.newPage();
}

async function scanRoute(a, b) {
  const url = `${BASE}/en/travel/${sl(a)}/${sl(b)}?date=${date}&people=1&adults=1`;
  let best = null, error = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (!page || page.isClosed()) await freshPage();
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (resp && resp.status() >= 400) throw new Error(`HTTP ${resp.status()} for ${url}`);
      const r = await scrapePage(page, 120000);
      if (!best || r.trips.length > best.trips.length) best = r;
      const enough = r.empty || r.header <= 12 || r.trips.length >= 0.5 * r.header || r.header > 100; // >100 = known lazy-load cap (Sanur->Nusa Penida)
      if (enough) break;
    } catch (e) {
      error = shortError(e);
      console.error(`${a}>${b} ${date} attempt ${attempt}: ${error}`);
      await sleep(5000 * attempt);
      await freshPage().catch((e2) => console.error(`browser restart failed: ${shortError(e2)}`));
    }
  }
  return { best: best || { empty: true, trips: [], header: 0, failed: true }, error: best ? null : error };
}

function record(a, b, { best, error }) {
  const sailings = [];
  for (const raw of best.trips) {
    const p = parseRaw(raw); if (!p || p.ty !== 'Ferry') continue;
    if (/Van|Bus|Taxi|Shuttle|Transfer|Minibus/i.test(p.cls || '') && !/Speedboat|Fast/i.test(p.cls || '')) continue;
    sailings.push(p);
  }
  result.routes[`${a}>${b}`] = { header: best.header, captured: best.trips.length, empty: !!best.empty, failed: !!best.failed, error, sailings };
  console.log(`${date} ${a}>${b}: ${sailings.length} ferries (${best.trips.length}/${best.header} cards)${error ? ` FAILED: ${error}` : ''}`);
}

const result = { date, scannedAt: new Date().toISOString(), routes: {} };
await freshPage();
for (const [a, b] of routes) record(a, b, await scanRoute(a, b));

// Second pass: routes that failed or came back empty get another go after a pause, in a new browser.
const again = routes.filter(([a, b]) => { const r = result.routes[`${a}>${b}`]; return r.failed || (r.empty && !r.header); });
if (again.length) {
  console.log(`Retrying ${again.length} route(s) after a 2 minute pause`);
  await sleep(120000);
  await freshPage().catch((e) => console.error(`browser restart failed: ${shortError(e)}`));
  for (const [a, b] of again) {
    const r = await scanRoute(a, b);
    if (!r.best.failed || result.routes[`${a}>${b}`].failed) record(a, b, r);
  }
}
try { await browser.close(); } catch {}

const all = Object.entries(result.routes);
const failed = all.filter(([, r]) => r.failed);
console.log(`${date}: ${all.length - failed.length}/${all.length} routes loaded, ${failed.length} failed`);
// Shown on the run's summary page, so a failed day says why without digging through logs.
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [`### Scan ${date}: ${all.length - failed.length} of ${all.length} routes loaded`, ''];
  if (failed.length) lines.push('| Route | Error |', '|---|---|', ...failed.map(([k, r]) => `| ${k} | ${(r.error || 'no trips found').replace(/\|/g, '/')} |`));
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}
fs.mkdirSync(outPath.replace(/[^/]+$/, '') || '.', { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result));
