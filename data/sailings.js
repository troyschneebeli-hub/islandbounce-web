// The sailings the site shows. Import from here, not from the generated files.
//
//   SAILINGS          every DAILY sailing you can book: listed on the 12Go booking page on at least 6 of the 7
//                     nights checked. confidence "confirmed" = also on the operator's own timetable (tagged
//                     Confirmed); "listed" = 12Go only. The route pages, hub counts and sitemap use these.
//   PLANNER_SAILINGS  SAILINGS first, then sailings labelled typical: confirmed but not daily, and 12Go-only
//                     listings that aren't daily. The Trip Planner, port cards and ports map use these.
// Operator-only sailings (not on 12Go) are never shown. data/twelvego.js, data/timetables.js and the
// spreadsheets are research files: nothing in app/ or components/ may import them.
// All of it is generated from data/generated/ by the daily timetable run (see TIMETABLE_AUTOMATION.md and CLAUDE.md).
import { CONFIRMED_DAILY, LISTED_DAILY, CONFIRMED_NOT_DAILY, CONFIRMED_SCAN } from "@/data/confirmed";
import { TYPICAL_SAILINGS } from "@/data/typical";

export const SAILINGS = [...CONFIRMED_DAILY, ...LISTED_DAILY];
export const PLANNER_SAILINGS = [...SAILINGS, ...CONFIRMED_NOT_DAILY, ...TYPICAL_SAILINGS];
// The real check date (never a scanned day), and the wording for it.
export const SAILINGS_UPDATED = CONFIRMED_SCAN.checked;
export const SAILINGS_CHECKED_TEXT = CONFIRMED_SCAN.checkedText;
