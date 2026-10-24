# Daily timetable automation

`.github/workflows/daily-timetable.yml` runs every night at 01:00 Bali (cron `0 17 * * *` UTC) in GitHub Actions. It replaced the weekly Tuesday run on 24 Oct 2026, which scanned 7 dates at once and set off 12Go's bot check.

Each night, one job:
1. Scans ONE date, 3 days ahead in Bali time (`scripts/weekly/scan_12go.mjs`, read-only, all 68 pairs in `scripts/weekly/routes.json`, 100-minute budget).
2. Puts it in that weekday's slot of the window (`scripts/weekly/window.mjs`). The window has one slot per weekday, each the latest scan of that weekday, so every weekday is always covered. A route that fails to load tonight keeps that slot's last good reading if it's at most 14 days old. The window and the weekly reference are the `scan-window` artifact of the previous run (kept 30 days), so git only changes when the published data does.
3. Once all 7 weekdays are filled: `match.py` -> `changes.mjs` -> `publish_check.py` -> `build-confirmed.mjs` -> `check-data.mjs` -> commit to main (Vercel redeploys). Until then it only collects.
4. Weekly reference: after a publish, if the reference is 7 or more days old, it emails a "Weekly timetable summary" of the week's changes and makes tonight's data the new reference. Every night's safety check also compares against it.
5. Emails (GitHub issues that @mention the owner) otherwise only when it matters: "Timetable updated" when sailings or operators were added or removed; a comment on the open "Timetable update blocked" issue when blocked or not published; a comment on "Daily timetable run failed" when the run broke before matching. Price-only changes and quiet nights send nothing.

- Confirmed = same operator + route pair + departure within 10 minutes on the operator timetable AND the 12Go booking page (operator's time, 12Go's lowest A$ price).
- Daily = seen on all 7 nights, or on 6 of 7 when the operator's own timetable says the sailing runs daily (12Go hides sold-out trips; without that statement a missing night could be a day the boat doesn't run). Confirmed daily rows feed the Fast Routes tables. 12Go-only rows feed the Trip Planner (labelled typical). Operator-only rows are never shown.
- Outputs in `data/generated/`: `confirmed-sailings.json`, `confirmed-daily-sailings.json`, `twelvego-only-sailings.json`, `scan-health.json`, `report.md`, `diff.md`. The "checked" date is the latest nightly check.
- `publish_check.py` blocks the publish (the last published data stays live) if: fewer than 120 confirmed daily sailings, any route loses more than 30% of its sailings since the last update or since the weekly reference, a route has no usable reading on more than one weekday, or a scan captured under half of a route's trips.
- 12Go's bot check: a "Human Verification" page, or any empty page that isn't 12Go's own "0 trips" timetable, is a failed load (never "no boats"). The scanner pauses 8 s between routes and 5 minutes after a check, and stops the night after 3 in a row. It doesn't disguise itself or try to get past the check. The lasting fix is 12Go's partner Timetable Service or their permission.
- Operator timetables: `data/operator-sailings.json` (613 rows), updated by hand until per-operator fetchers exist (weekly is enough: operators change timetables seasonally). The emails list boats seen on 12Go 6+ nights that aren't in it.
- Tests: `node scripts/weekly/test_parse.mjs` (card parsing), `node scripts/weekly/test_match.mjs` (daily rule and weekly-reference check; needs python3, runs in the PR check).
- Manual run: GitHub > Actions > Daily timetable refresh > Run workflow. Options: a different date, probe mode (`limit`, scan only), or a one-off seed of the window from an earlier run's scan artifacts (`seed_run_id`, optional `seed_dates`).
- Read-only: the scanner never clicks a trip, Book now or anything that adds to a cart.
