// Every sailing the site knows about: the operator-verified timetables plus the
// listings read from the 12Go booking page (treated as daily, labelled unconfirmed).
// Import SAILINGS from here, not from data/timetables.js directly.
import { SAILINGS as VERIFIED } from "@/data/timetables";
import { TWELVEGO_SAILINGS } from "@/data/twelvego";

export const SAILINGS = [...VERIFIED, ...TWELVEGO_SAILINGS];
