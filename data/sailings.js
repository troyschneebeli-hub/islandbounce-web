// The sailings the site shows. Import from here, not from the generated files.
//
//   SAILINGS          confirmed DAILY sailings only: on the operator's own timetable AND bookable on the
//                     12Go booking page on every scanned day. The Fast Routes tables, route pages, hub
//                     counts and sitemap use these.
//   PLANNER_SAILINGS  SAILINGS first, then sailings labelled typical: confirmed but not daily, and 12Go-only
//                     listings. The Trip Planner, port cards and ports map use these.
// Operator-only sailings (not on 12Go) are never shown. data/twelvego.js, data/timetables.js and the
// spreadsheets are research files: nothing in app/ or components/ may import them.
// All of it is generated weekly from data/generated/ (see WEEKLY_AUTOMATION.md and CLAUDE.md).
import { CONFIRMED_DAILY, CONFIRMED_NOT_DAILY, CONFIRMED_SCAN } from "@/data/confirmed";
import { TYPICAL_SAILINGS } from "@/data/typical";

export const SAILINGS = CONFIRMED_DAILY;
export const PLANNER_SAILINGS = [...CONFIRMED_DAILY, ...CONFIRMED_NOT_DAILY, ...TYPICAL_SAILINGS];
// The real check date (never a scanned day), and the wording for it.
export const SAILINGS_UPDATED = CONFIRMED_SCAN.checked;
export const SAILINGS_CHECKED_TEXT = CONFIRMED_SCAN.checkedText;
