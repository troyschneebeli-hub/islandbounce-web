# Daily timetable automation

`.github/workflows/daily-timetable.yml` runs every night at 01:00 Bali (cron `0 17 * * *` UTC) in GitHub Actions. It replaced the weekly Tuesday run on 24 Oct 2026, which scanned 7 dates at once and set off 12Go's bot check.

Each night, one job:
1. Scans ONE date, 3 days ahead in Bali time (`scripts/weekly/scan_12go.mjs`, read-only, all 68 pairs in `scripts/weekly/routes.json`, 100-minute budget).
2. Adds it to the rolling window of the newest 7 nightly scans (`scripts/weekly/window.mjs`). The window is the `scan-window` artifact of the previous run (kept 30 days), so git only changes when the published data does.
3. Once the window has 7 nights: `match.py` -> `changes.mjs` -> `publish_check.py` -> `build-confirmed.mjs` -> `check-data.mjs` -> commit to main (Vercel redeploys). Until then it only collects.
4. Emails (a GitHub issue that @mentions the owner) only when it matters: a new "Timetable updated" issue when sailings or operators were added or removed; a comment on the open "Timetable update blocked" issue when blocked or not published; a comment on "Daily timetable run failed" when the run broke before matching. Price-only changes and quiet nights send nothing.

- Confirmed = same operator + route pair + departure within 10 minutes on the operator timetable AND the 12Go booking page (operator's time, 12Go's lowest A$ price).
- Daily = seen on all 7 nights in the window (one night that failed to load is left out, `match.py --max-missing 1`). Confirmed daily rows feed the Fast Routes tables. 12Go-only rows feed the Trip Planner (labelled typical). Operator-only rows are never shown.
- Outputs in `data/generated/`: `confirmed-sailings.json`, `confirmed-daily-sailings.json`, `twelvego-only-sailings.json`, `scan-health.json`, `report.md`, `diff.md`.
- `publish_check.py` blocks the publish (the last published data stays live) if: fewer than 120 confirmed daily sailings, any route loses more than 30% of its sailings, a route failed to load on more than one night, or a scan captured under half of a route's trips.
- 12Go's bot check: a "Human Verification" page, or any empty page that isn't 12Go's own "0 trips" timetable, is a failed load (never "no boats"). The scanner pauses 8 s between routes and 5 minutes after a check, and stops the night after 3 in a row. It doesn't disguise itself or try to get past the check.
- Operator timetables: `data/operator-sailings.json` (613 rows, from the operator workbook), updated by hand until per-operator fetchers exist (weekly is enough: operators change timetables seasonally).
- Manual run: GitHub > Actions > Daily timetable refresh > Run workflow. Options: a different date, probe mode (`limit`, scan only), or a one-off seed of the window from an earlier run's scan artifacts (`seed_run_id`, optional `seed_dates`).
- Read-only: the scanner never clicks a trip, Book now or anything that adds to a cart.
