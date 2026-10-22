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

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const result = { date, scannedAt: new Date().toISOString(), routes: {} };
for (const [a, b] of routes) {
  const url = `${BASE}/en/travel/${sl(a)}/${sl(b)}?date=${date}&people=1&adults=1`;
  let best = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const r = await scrapePage(page, 120000);
      if (!best || r.trips.length > best.trips.length) best = r;
      const enough = r.empty || r.header <= 12 || r.trips.length >= 0.5 * r.header || r.header > 100; // >100 = known lazy-load cap (Sanur->Nusa Penida)
      if (enough) break;
    } catch (e) { console.error(`${a}>${b} ${date} attempt ${attempt}: ${e.message}`); }
  }
  best = best || { empty: true, trips: [], header: 0, failed: true };
  const sailings = [];
  for (const raw of best.trips) {
    const p = parseRaw(raw); if (!p || p.ty !== 'Ferry') continue;
    if (/Van|Bus|Taxi|Shuttle|Transfer|Minibus/i.test(p.cls || '') && !/Speedboat|Fast/i.test(p.cls || '')) continue;
    sailings.push(p);
  }
  result.routes[`${a}>${b}`] = { header: best.header, captured: best.trips.length, empty: !!best.empty, failed: !!best.failed, sailings };
  console.log(`${date} ${a}>${b}: ${sailings.length} ferries (${best.trips.length}/${best.header} cards)`);
}
await browser.close();
fs.mkdirSync(outPath.replace(/[^/]+$/, '') || '.', { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result));
