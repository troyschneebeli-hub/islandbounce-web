# Island Bounce Travel (islandbouncetravel.com): project notes

Next.js 14 (app router) ferry-comparison affiliate site on Vercel. Owner: Troy (ClankINC partner). Earns via 12Go affiliate.

## Money and links
- 12Go affiliate ID `17069158` (param `z`), `sub_id=islandbounce-web`. White label: `https://booking.islandbouncetravel.com`.
- Links are built in `lib/affiliateLinks.js` / `lib/bookingLink.js`: `/en/travel/<from>/<to>?date=&date2=&people=&adults=`. Slug quirk: our `benoa-nusa-dua` redirects to 12Go's `tanjung-benoa-nusa-dua`; confirm `z` survives the redirect.
- 12Go has no open API. Never call 12Go's internal endpoints (e.g. `/api/nuxt/.../tripsV2/search`). Official option (12Go support, 19 Oct 2026): the partner **Timetable Service**, a PHP library `timetable.php` (dashboard > Timetable > Integration, downloadable only when logged in), `get12GoTimetable(country, from, dest, class, noreturn, lesslinks, lang, curr)` returning HTML. We run Next.js on Vercel (no PHP); Troy is asking 12Go for the endpoint/parameters or the file. Route/operator URL parameters are NOT supported; dashboard > Links makes verified route deep links.
- Per-sailing deep links are NOT possible: "Book now" is an add-to-cart button, checkout URLs are cart IDs. Time chips link to the route page with date/travellers prefilled. Ask 12Go about trip-level links.
- Never click Book now / add to cart on the live booking site to test.

## Timetable data (decided 22 Oct 2026)
- **Fast Routes tables / route pages: confirmed DAILY sailings only.** Confirmed = same operator + route + departure within 10 min on the operator's own timetable AND the 12Go booking page. Daily = seen on all 7 scanned days. Shown with the operator's time and 12Go's lowest A$ fare (1 adult). One open table, no drop-downs, no "typical" block. Pairs with none get a "Check live times" box, never invented times. Only pairs with at least one daily confirmed sailing get a route page.
- **Trip Planner / port cards / ports map:** confirmed daily first, tagged "Confirmed", then the rest labelled "Typical, check live times" (confirmed but not daily: shown only on the weekdays seen; and 12Go-only listings). Operator-only sailings are never shown.
- Source of truth: `data/generated/` (the weekly matcher's output): `confirmed-sailings.json`, `confirmed-daily-sailings.json`, `twelvego-only-sailings.json` (+ `scan-health.json`, `report.md`, `diff.md` after a weekly run). Seeded 22 Oct 2026 from the manual 22-28 Oct scan and the 20 Oct 12Go capture (D'Camel and Rocky left out of the seed).
- `node scripts/build-confirmed.mjs` turns `data/generated/*.json` into `data/confirmed.js` (CONFIRMED_DAILY, CONFIRMED_NOT_DAILY, CONFIRMED_SCAN) and `data/typical.js` (TYPICAL_SAILINGS), both AUTO-GENERATED. It drops impossible arrivals (falls back to 12Go's arrival), check-in notes naming another port's office, and confirmed rows whose source says UNCONFIRMED (reseller), and prints all of it. `INCLUDE_SIX_OF_SEVEN` (default false) would also list sailings seen on 6 of 7 days. Node only: Python isn't installed on Troy's laptop (the GitHub Action has it for match.py).
- `data/sailings.js`: `SAILINGS` = confirmed daily (route pages, hub, sitemap); `PLANNER_SAILINGS` = planner set. Import from there only. `data/twelvego.js`, `data/timetables.js` and the xlsx files are research files: nothing in `app/` or `components/` may import them.
- `node scripts/check-data.mjs` (after `npm run build` it also reads the built route pages): every listed row is in the daily file, no duplicate ids, ports exist, rows have operator/departs/price, dates not later than the check date, each page renders exactly its daily rows and count, no collapsed/typical block.
- Dates on the site: "checked <generatedAt date> for sailings <scan window>", computed from the data. No "every week"/"monthly" claims until the weekly job has run live.
- `data/planner.js` BOAT_ROUTES decides which port/destination pairs the Trip Planner offers. Only list pairs that have sailings.

## Weekly automation (code in repo, NOT yet run live)
- `.github/workflows/weekly-timetable.yml`, Tuesdays 01:00 UTC (09:00 Bali). See WEEKLY_AUTOMATION.md. `scan` (7 jobs, one per date, `scripts/weekly/scan_12go.mjs`, Playwright, read-only) -> `compile` (`match.py` -> `publish_check.py` safety gate -> `build-confirmed.mjs` -> `check-data.mjs` -> commit + push to main) -> `notify` (GitHub issue if blocked/failed).
- Card parsing lives in `scripts/weekly/parse_card.mjs`; `node scripts/weekly/test_parse.mjs` tests it against real cards. 12Go serves two layouts: A (seen in a normal browser) `dep | arr | duration | from station | to station | [seats] | class | Ferry | operator | rating | A$price`; B (what GitHub's runner gets) `dep | from station | duration | operator | Ferry | class | arr | to station | rating | price`. Multi-leg trips are dropped ("Van+Ferry" type, or a class like "Fast Ferry + Van"). The scanner adds `curr=AUD` (without it the US runner gets US$); a non-A$ price is stored as null, never misread. When a route has cards but 0 ferries, the scan log prints 3 raw cards: re-capture fixtures from there if 12Go changes the layout.
- `data/operator-sailings.json` (613 operator timetable rows) is updated by hand until per-operator fetchers exist.
- The safety gate blocks the publish if a route loses >30% of its daily sailings, so a big operator disappearing from 12Go (seen 22 Oct: Wijaya Buyuk, Tanis not listed) will block every run until someone reviews and runs it with the drop accepted.

## Planner UI
- `components/FindPortMap.js`: port cards with `DepartureList` (Confirmed groups first, then "Typical, check live times"; chips link to booking page). `lib/portDepartures.js` groups sailings per operator and kind.
- `components/RouteTimetable.js`: route page table (Departs, Operator, From (1 adult), Arrives (duration), Book; rows carry `data-sailing-id`).

## Status / open items
- The full 7-day manual scan (22-28 Oct) finished 22 Oct 2026. Prefer the 12Go Timetable Service once its endpoint is known.
- 12Go lists ~50-55 trips per route page at most (Sanur -> Nusa Penida shows ~135), so the confirmed set can miss real sailings. Don't claim lists are complete.
- A scraper mis-click once added a trip to a cart on the booking site. Never click trip cards or Book now when capturing.
- The repo lives in OneDrive, which breaks `next dev` (EINVAL readlink on `.next`). Use `npm run build` then `npm start` locally.
- The in-app browser can't load Google Maps on localhost, so check the planner's port cards on a Vercel preview.
- Troy-side: resubmit sitemap with full URL, follow-up email to 12Go about deep links and slugs, add `www` to Google Maps key referrers, Vercel Pro.
