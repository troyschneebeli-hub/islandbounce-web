// Every sailing the site knows about: the operator-verified timetables plus the
// listings read from the 12Go booking page (treated as daily, labelled unconfirmed).
// Import SAILINGS from here, not from data/timetables.js directly.
import { SAILINGS as VERIFIED } from "@/data/timetables";
import { TWELVEGO_SAILINGS } from "@/data/twelvego";

// timetables.js already holds some rows copied from booking-site listings. When a
// 12Go row is the same sailing (operator, ports, departure and arrival), keep the
// timetables.js row, give it the 12Go fare, and drop the 12Go copy so the sailing
// isn't listed twice.
const key = (s) => [s.operator, s.from, s.to, s.departs, s.arrives].join("|");

const twelveGoByKey = new Map(TWELVEGO_SAILINGS.map((s) => [key(s), s]));
const matched = new Set();

const verifiedWithFares = VERIFIED.map((s) => {
  const twin = twelveGoByKey.get(key(s));
  if (!twin) return s;
  matched.add(twin);
  return s.price == null && twin.price != null ? { ...s, price: twin.price } : s;
});

export const SAILINGS = [
  ...verifiedWithFares,
  ...TWELVEGO_SAILINGS.filter((s) => !matched.has(s)),
];
