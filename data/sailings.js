// Every sailing the site shows. Only 12Go-sourced sailings (data/twelvego.js) may appear
// on the site; data/timetables.js is kept in the repo for reference but is not used.
// Import SAILINGS from here, not from data/twelvego.js directly.
import { TWELVEGO_SAILINGS, TWELVEGO_CAPTURED } from "@/data/twelvego";

export const SAILINGS = TWELVEGO_SAILINGS;
export const SAILINGS_UPDATED = TWELVEGO_CAPTURED;
