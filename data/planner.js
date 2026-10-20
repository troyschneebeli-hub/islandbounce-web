// TRIP PLANNER DATA
// Drive times are estimated midpoints from the ranges researched per villa
// area — verify against a live maps API before this goes further into
// production (see README "Next real steps" #4: real address geocoding).
// The +35min figure built into every result is a standard check-in/boarding
// buffer real fast-boat operators expect, not padding.

export const CHECKIN_BUFFER_MIN = 35;

export const VILLA_AREAS = ["Kuta", "Seminyak", "Canggu", "Uluwatu", "Ubud", "Sanur", "Nusa Dua / Jimbaran"];

export const DRIVE_TIMES = {
  Kuta: { Sanur: 25, "Padang Bai": 47, Serangan: 25, "Benoa / Nusa Dua": 25 },
  Seminyak: { Sanur: 35, "Padang Bai": 55, Serangan: 35, "Benoa / Nusa Dua": 30 },
  Canggu: { Sanur: 45, "Padang Bai": 90, Serangan: 45, "Benoa / Nusa Dua": 55 },
  Uluwatu: { Sanur: 55, "Padang Bai": 100, Serangan: 50, "Benoa / Nusa Dua": 25 },
  Ubud: { Sanur: 50, "Padang Bai": 32, Serangan: 50, "Benoa / Nusa Dua": 70 },
  Sanur: { Sanur: 5, "Padang Bai": 55, Serangan: 20, "Benoa / Nusa Dua": 30 },
  "Nusa Dua / Jimbaran": { Sanur: 30, "Padang Bai": 60, Serangan: 30, "Benoa / Nusa Dua": 15 },
};

// port -> destination pairs the Trip Planner offers. Only list pairs that have
// sailings in data/twelvego.js: the site shows 12Go sailings only, so a pair
// without them would just show an empty card. The departures themselves come
// from data/sailings.js (via lib/portDepartures.js); `duration` here is only a
// fallback crossing time.
export const BOAT_ROUTES = {
  // Departing from a Gili (timetable crossing times, which include any stops).
  "Gili Trawangan": {
    "Padang Bai": { duration: 90, priceLow: 18, priceHigh: 30, count: 1 },
    "Sanur": { duration: 225, priceLow: 25, priceHigh: 40, count: 1 },
    "Benoa / Nusa Dua": { duration: 135, priceLow: 30, priceHigh: 45, count: 1 },
    "Nusa Penida": { duration: 235, priceLow: 30, priceHigh: 45, count: 1 },
    "Nusa Lembongan": { duration: 165, priceLow: 30, priceHigh: 45, count: 1 },
  },
  "Gili Air": {
    "Padang Bai": { duration: 100, priceLow: 18, priceHigh: 30, count: 1 },
    "Sanur": { duration: 195, priceLow: 25, priceHigh: 40, count: 1 },
    "Benoa / Nusa Dua": { duration: 220, priceLow: 30, priceHigh: 45, count: 1 },
    "Nusa Penida": { duration: 160, priceLow: 30, priceHigh: 45, count: 1 },
    "Nusa Lembongan": { duration: 135, priceLow: 30, priceHigh: 45, count: 1 },
  },
  "Gili Meno": {
    "Padang Bai": { duration: 120, priceLow: 18, priceHigh: 30, count: 1 },
    "Nusa Penida": { duration: 180, priceLow: 30, priceHigh: 45, count: 1 },
    "Nusa Lembongan": { duration: 175, priceLow: 30, priceHigh: 45, count: 1 },
  },
  // Departing from the Nusa islands (timetable crossing times, which include any stops).
  "Nusa Penida": {
    "Gili Trawangan": { duration: 155, priceLow: 30, priceHigh: 45, count: 1 },
    "Gili Air": { duration: 230, priceLow: 30, priceHigh: 45, count: 1 },
    "Gili Meno": { duration: 190, priceLow: 30, priceHigh: 45, count: 1 },
    "Bangsal (Lombok)": { duration: 260, priceLow: 30, priceHigh: 45, count: 1 },
  },
  "Nusa Lembongan": {
    "Gili Trawangan": { duration: 125, priceLow: 30, priceHigh: 45, count: 1 },
    "Gili Air": { duration: 200, priceLow: 30, priceHigh: 45, count: 1 },
    "Gili Meno": { duration: 170, priceLow: 30, priceHigh: 45, count: 1 },
    "Bangsal (Lombok)": { duration: 230, priceLow: 30, priceHigh: 45, count: 1 },
  },
  Sanur: {
    "Gili Trawangan": { duration: 105, priceLow: 20, priceHigh: 35, count: 8 },
    "Gili Air": { duration: 105, priceLow: 20, priceHigh: 35, count: 7 },
    "Nusa Penida": { duration: 35, priceLow: 10, priceHigh: 22, count: 8 },
    "Nusa Lembongan": { duration: 35, priceLow: 10, priceHigh: 20, count: 6 },
    "Gili Meno": { duration: 225, priceLow: 49, priceHigh: 60, count: 6 },
    "Bangsal (Lombok)": { duration: 210, priceLow: 25, priceHigh: 40, count: 2 },
  },
  "Padang Bai": {
    "Gili Trawangan": { duration: 90, priceLow: 18, priceHigh: 30, count: 6 },
    "Gili Air": { duration: 90, priceLow: 18, priceHigh: 30, count: 5 },
    "Gili Meno": { duration: 95, priceLow: 18, priceHigh: 30, count: 3 },
    "Bangsal (Lombok)": { duration: 100, priceLow: 20, priceHigh: 35, count: 3 },
    "Nusa Penida": { duration: 60, priceLow: 15, priceHigh: 25, count: 2 },
    "Nusa Lembongan": { duration: 40, priceLow: 20, priceHigh: 27, count: 4 },
  },
  Serangan: {
    "Gili Trawangan": { duration: 75, priceLow: 25, priceHigh: 40, count: 3 },
    "Gili Air": { duration: 75, priceLow: 25, priceHigh: 40, count: 3 },
    "Bangsal (Lombok)": { duration: 150, priceLow: 25, priceHigh: 40, count: 3 },
    "Nusa Penida": { duration: 60, priceLow: 12, priceHigh: 21, count: 6 },
  },
  "Benoa / Nusa Dua": {
    "Gili Trawangan": { duration: 120, priceLow: 30, priceHigh: 45, count: 2 },
    "Gili Air": { duration: 120, priceLow: 30, priceHigh: 45, count: 2 },
    // Added from the 12Go booking-page listings (see data/twelvego.js).
    "Gili Meno": { duration: 260, priceLow: 60, priceHigh: 90, count: 2 },
    "Bangsal (Lombok)": { duration: 245, priceLow: 44, priceHigh: 60, count: 5 },
    "Nusa Penida": { duration: 45, priceLow: 13, priceHigh: 30, count: 3 },
    "Nusa Lembongan": { duration: 75, priceLow: 20, priceHigh: 40, count: 2 },
  },
};

export const PLANNER_DESTINATIONS = [
  "Gili Trawangan",
  "Gili Air",
  "Gili Meno",
  "Nusa Penida",
  "Nusa Lembongan",
  "Bangsal (Lombok)",
];

// Where you can head to depending on where you start. Starting on a Gili, the
// boats go back to Bali or over to the Nusas.
export const GILI_START_DESTINATIONS = ["Padang Bai", "Sanur", "Benoa / Nusa Dua", "Nusa Penida", "Nusa Lembongan"];

export function destinationsFor(region) {
  if (region === "gili") return GILI_START_DESTINATIONS;
  // No boats between the Nusas in our data, so don't offer them from a Nusa start.
  if (region === "nusa") return PLANNER_DESTINATIONS.filter((d) => !d.startsWith("Nusa "));
  return PLANNER_DESTINATIONS;
}

export function fmtMins(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
