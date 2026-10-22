// Scans the 12Go white-label booking pages for ONE date across all route pairs.
// Usage: node scripts/weekly/scan_12go.mjs 2026-10-29 out/scan-2026-10-29.json   (LIMIT=2 scans only the first 2 routes)
// Read-only: it only scrolls and reads trip cards. It NEVER clicks a trip, "Book now" or anything that adds to a cart.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { parseRaw } from './parse_card.mjs';

const [date, outPath] = process.argv.slice(2);
if (!/^\d{4}-\d\d-\d\d$/.test(date || '') || !outPath) { console.error('usage: scan_12go.mjs YYYY-MM-DD out.json'); process.exit(2); }
const BASE = process.env.BOOKING_BASE || 'https://booking.islandbouncetravel.com';
const allRoutes = JSON.parse(fs.readFileSync(new URL('./routes.json', import.meta.url)));
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : allRoutes.length; // probe mode: LIMIT=2
const routes = allRoutes.slice(0, LIMIT);
const sl = x => (x === 'benoa-nusa-dua' ? 'tanjung-benoa-nusa-dua' : x); // our slug -> 12Go slug
const outDir = outPath.replace(/[^/]+$/, '') || '.';

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

// 12Go navigates again after the first load (redirect / re-render), which destroys the page's script context
// mid-scrape ("Execution context was destroyed"). Wait for the page to settle, and scrape again if it moves.
async function scrapeRobust(page, budgetMs) {
  for (let i = 1; i <= 4; i++) {
    try {
      await page.waitForLoadState('load', { timeout: 45000 }).catch(() => {});
      await page.waitForSelector('.trip-cta', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);
      return await scrapePage(page, budgetMs);
    } catch (e) {
      if (!/Execution context was destroyed|navigation/i.test(e.message) || i === 4) throw e;
      await page.waitForTimeout(3000);
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shortError = (e) => String(e && e.message || e).split('\n')[0].slice(0, 200);

// The browser and page are replaced after any error: once a page has crashed or closed, every later
// goto on it fails instantly, which can make a whole day's scan fail in a minute.
let browser = null, page = null;
async function freshPage() {
  try { if (browser) await browser.close(); } catch {}
  browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 }, locale: 'en-AU', timezoneId: 'Asia/Makassar',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });
  page = await ctx.newPage();
}

// For a failed or empty route: where the page ended up, its title and first text, plus a screenshot (uploaded with the scan).
async function diagnose(tag) {
  try {
    const info = { url: page.url(), title: await page.title(), text: (await page.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\s+/g, ' ') };
    fs.mkdirSync(outDir, { recursive: true });
    await page.screenshot({ path: `${outDir}/debug-${tag}.png`, fullPage: false });
    return info;
  } catch (e) { return { error: shortError(e) }; }
}

async function scanRoute(a, b) {
  // curr=AUD: without it GitHub's (US) runner gets US$ prices. 12Go keeps it in a cookie and drops it from the URL.
  const url = `${BASE}/en/travel/${sl(a)}/${sl(b)}?date=${date}&people=1&adults=1&curr=AUD`;
  let best = null, error = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (!page || page.isClosed()) await freshPage();
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (resp && resp.status() >= 400) throw new Error(`HTTP ${resp.status()} for ${url}`);
      const r = await scrapeRobust(page, 120000);
      if (!best || r.trips.length > best.trips.length) best = r;
      const enough = r.empty || r.header <= 12 || r.trips.length >= 0.5 * r.header || r.header > 100; // >100 = known lazy-load cap (Sanur->Nusa Penida)
      if (enough) break;
    } catch (e) {
      error = shortError(e);
      console.error(`${a}>${b} ${date} attempt ${attempt}: ${error}`);
      if (attempt === 3) break; // keep this page for diagnose()
      await sleep(5000 * attempt);
      await freshPage().catch((e2) => console.error(`browser restart failed: ${shortError(e2)}`));
    }
  }
  best = best || { empty: true, trips: [], header: 0, failed: true };
  let diag;
  if (best.failed || best.empty) { diag = await diagnose(`${date}-${a}-${b}`); console.error('DIAG', JSON.stringify(diag)); }
  return { best, error: best.failed ? error : null, diag };
}

function record(a, b, { best, error, diag }) {
  const sailings = [];
  for (const raw of best.trips) {
    const p = parseRaw(raw); if (!p || p.ty !== 'Ferry') continue;
    if (/Van|Bus|Taxi|Shuttle|Transfer|Minibus/i.test(p.cls || '') && !/Speedboat|Fast/i.test(p.cls || '')) continue;
    sailings.push(p);
  }
  // A few raw cards, kept so a change in 12Go's card layout can be seen in the scan file and the log.
  const samples = best.trips.slice(0, 3);
  result.routes[`${a}>${b}`] = { header: best.header, captured: best.trips.length, empty: !!best.empty, failed: !!best.failed, error, diag, samples, sailings };
  console.log(`${date} ${a}>${b}: ${sailings.length} ferries (${best.trips.length}/${best.header} cards)${error ? ` FAILED: ${error}` : ''}`);
  if (best.trips.length && !sailings.length) samples.forEach((s, i) => console.log(`  card ${i + 1}: ${s}`));
}

const result = { date, scannedAt: new Date().toISOString(), routes: {} };
await freshPage();
// 4 failures in a row: pause and start a new browser. 8 in a row: the site is refusing us today, so the rest are
// recorded as failed without spending hours on them. The day then counts as one that failed to load (match.py
// --max-missing), instead of failing the job, which would stop the whole week from publishing.
let failedInARow = 0, gaveUp = false;
for (const [a, b] of routes) {
  if (gaveUp) { record(a, b, { best: { empty: true, trips: [], header: 0, failed: true }, error: 'skipped: 8 routes in a row failed' }); continue; }
  const r = await scanRoute(a, b);
  record(a, b, r);
  failedInARow = r.best.failed ? failedInARow + 1 : 0;
  if (failedInARow === 4) { console.error('4 routes failed in a row: pausing 2 minutes and restarting the browser'); await sleep(120000); await freshPage().catch(() => {}); }
  if (failedInARow >= 8) { console.error('8 routes failed in a row: skipping the rest of this day'); gaveUp = true; }
}

// Second pass: routes that failed or came back empty get another go after a pause, in a new browser.
const again = gaveUp ? [] : routes.filter(([a, b]) => { const r = result.routes[`${a}>${b}`]; return r.failed || (r.empty && !r.header); });
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
  const lines = [`### Scan ${date}: ${all.length - failed.length} of ${all.length} routes loaded${LIMIT < allRoutes.length ? ` (probe: first ${LIMIT})` : ''}`, ''];
  if (failed.length) lines.push('| Route | Error | Page it ended on |', '|---|---|---|', ...failed.map(([k, r]) =>
    `| ${k} | ${(r.error || 'no trips found').replace(/\|/g, '/')} | ${r.diag ? `${r.diag.title || ''} ${r.diag.url || r.diag.error || ''}`.replace(/\|/g, '/') : ''} |`));
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result));
