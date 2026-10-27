// The sailings the site shows. Import from here, not from the generated file.
//
//   SAILINGS          daily boats on the operators' own published timetables, on routes you can book on our booking
//                     site. The route pages, port and operator pages, hub counts and sitemap use these.
//   PLANNER_SAILINGS  SAILINGS first, then the other timetable rows on those routes, labelled typical. The Trip
//                     Planner, port cards and ports map use these.
// Built by scripts/build-timetable.mjs from data/operator-sailings.json (see CLAUDE.md). No 12Go times or fares are
// shown: 12Go's terms don't allow reusing them. data/confirmed.js, data/typical.js, data/twelvego.js,
// data/timetables.js and the spreadsheets are old research files: nothing in app/ or components/ may import them.
import { DAILY_SAILINGS, OTHER_SAILINGS, TIMETABLE_CHECK } from "@/data/timetable";

export const SAILINGS = DAILY_SAILINGS;
export const PLANNER_SAILINGS = [...SAILINGS, ...OTHER_SAILINGS];
// The date the operator timetables were last checked, and the wording for it ("checked 27 Oct 2026").
export const SAILINGS_UPDATED = TIMETABLE_CHECK.checked;
export const SAILINGS_CHECKED_TEXT = TIMETABLE_CHECK.checkedText;
