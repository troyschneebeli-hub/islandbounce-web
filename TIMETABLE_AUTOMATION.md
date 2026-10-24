# Weekly timetable automation

Runs every Tuesday 09:00 Perth/Bali (cron `0 1 * * 2` UTC) in GitHub Actions. Scans the 7 days from the coming Thursday.

Pipeline: `scan` (7 parallel jobs, one per date, `scripts/weekly/scan_12go.mjs`) -> `compile` (`match.py`, `publish_check.py`, `node scripts/build-confirmed.mjs` to make the site's data modules, `node scripts/check-data.mjs`, commit to main, Vercel redeploys) -> `notify` (opens a GitHub issue if blocked or failed).
- Trip cards are parsed by `scripts/weekly/parse_card.mjs`; `node scripts/weekly/test_parse.mjs` checks it against real cards in `scripts/weekly/fixtures/`.

- Confirmed = same operator + route pair + departure within 10 minutes on the operator timetable AND the 12Go booking page (operator's time, 12Go's lowest A$ price).
- Daily = seen on all 7 scanned days. Confirmed daily rows feed the Fast Routes tables. 12Go-only rows feed the Trip Planner (labelled typical). Operator-only rows are never shown.
- Outputs in `data/generated/`: `confirmed-sailings.json`, `confirmed-daily-sailings.json`, `twelvego-only-sailings.json`, `scan-health.json`, `report.md`, `diff.md`.
- `publish_check.py` blocks the publish (last week's data stays live) if: fewer than 120 confirmed daily sailings, any route loses more than 30% of its sailings, a day failed to load, or a scan captured under half of a route's trips.
- Operator timetables: `data/operator-sailings.json` (613 rows, from the operator workbook). Refresh the key operators weekly and the rest monthly (see the operator fetchers task); until those exist, update this file by hand when an operator publishes a new schedule.
- Manual run: GitHub > Actions > Weekly timetable refresh > Run workflow (optional start date).
- Read-only: the scanner never clicks a trip, Book now or anything that adds to a cart.
