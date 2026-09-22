// TRIP PLANNER DATA
// Drive times are estimated midpoints from the ranges researched per villa
// area — verify against a live maps API before this goes further into
// production (see README "Next real steps" #4: real address geocoding).
// The +35min figure built into every result is a standard check-in/boarding
// buffer real fast-boat operators expect, not padding.

export const CHECKIN_BUFFER_MIN = 35;

export const VILLA_AREAS = ["Kuta", "Seminyak", "Canggu", "Uluwatu", "Ubud", "Sanur", "Nusa Dua / Jimbaran"];

export const DRIVE_TIMES = {
  Kuta: { Sanur: 25, "Padang Bai": 47, Serangan: 25, Kusamba: 75, "Benoa / Nusa Dua": 25 },
  Seminyak: { Sanur: 35, "Padang Bai": 55, Serangan: 35, Kusamba: 80, "Benoa / Nusa Dua": 30 },
  Canggu: { Sanur: 45, "Padang Bai": 90, Serangan: 45, Kusamba: 100, "Benoa / Nusa Dua": 55 },
  Uluwatu: { Sanur: 55, "Padang Bai": 100, Serangan: 50, Kusamba: 110, "Benoa / Nusa Dua": 25 },
  Ubud: { Sanur: 50, "Padang Bai": 32, Serangan: 50, Kusamba: 40, "Benoa / Nusa Dua": 70 },
  Sanur: { Sanur: 5, "Padang Bai": 55, Serangan: 20, Kusamba: 50, "Benoa / Nusa Dua": 30 },
  "Nusa Dua / Jimbaran": { Sanur: 30, "Padang Bai": 60, Serangan: 30, Kusamba: 70, "Benoa / Nusa Dua": 15 },
};

// port -> destination -> boat leg options (a destination may have more than
// one operator/route from the same port). Each entry is route config, not a
// single fixed price/time — genDepartures() below expands this into every
// individual boat, with its own operator, departure time, and price, so
// results show the real schedule, not a range.
export const BOAT_ROUTES = {
  Sanur: {
    "Gili Trawangan": { duration: 105, priceLow: 20, priceHigh: 35, count: 8 },
    "Gili Air": { duration: 105, priceLow: 20, priceHigh: 35, count: 7 },
    "Nusa Penida": { duration: 35, priceLow: 10, priceHigh: 22, count: 8 },
    "Nusa Lembongan": { duration: 35, priceLow: 10, priceHigh: 20, count: 6 },
    "Bangsal (Lombok)": { duration: 210, priceLow: 25, priceHigh: 40, count: 2 },
  },
  "Padang Bai": {
    "Gili Trawangan": { duration: 90, priceLow: 18, priceHigh: 30, count: 6 },
    "Gili Air": { duration: 90, priceLow: 18, priceHigh: 30, count: 5 },
    "Gili Meno": { duration: 95, priceLow: 18, priceHigh: 30, count: 3 },
    "Bangsal (Lombok)": { duration: 100, priceLow: 20, priceHigh: 35, count: 3 },
    "Senggigi (Lombok)": { duration: 100, priceLow: 20, priceHigh: 35, count: 1 },
    "Lembar (Lombok)": { duration: 300, priceLow: 1, priceHigh: 3, count: 8, ferry: true },
    "Nusa Penida": { duration: 60, priceLow: 15, priceHigh: 25, count: 2 },
  },
  Serangan: {
    "Gili Trawangan": { duration: 75, priceLow: 25, priceHigh: 40, count: 3 },
    "Gili Air": { duration: 75, priceLow: 25, priceHigh: 40, count: 3 },
    "Gili Meno": { duration: 80, priceLow: 25, priceHigh: 40, count: 2 },
    "Bangsal (Lombok)": { duration: 150, priceLow: 25, priceHigh: 40, count: 3 },
    "Gili Gede (SW Lombok)": { duration: 180, priceLow: 30, priceHigh: 45, count: 1 },
  },
  Kusamba: {
    "Nusa Penida": { duration: 15, priceLow: 5, priceHigh: 10, count: 6 },
  },
  "Benoa / Nusa Dua": {
    "Gili Trawangan": { duration: 120, priceLow: 30, priceHigh: 45, count: 2 },
    "Gili Air": { duration: 120, priceLow: 30, priceHigh: 45, count: 2 },
  },
};

export const OPERATOR_POOL = [
  "Blue Water Express",
  "Gili Gili Fast Boat",
  "Eka Jaya Fast Boat",
  "Scoot Cruise",
  "Marina Srikandi",
  "Wahana Gili Ocean",
  "Semaya One Fastboat",
  "Angel Billabong Fastboat",
];

export const PLANNER_DESTINATIONS = [
  "Gili Trawangan",
  "Gili Air",
  "Gili Meno",
  "Nusa Penida",
  "Nusa Lembongan",
  "Bangsal (Lombok)",
  "Senggigi (Lombok)",
  "Lembar (Lombok)",
  "Gili Gede (SW Lombok)",
];

export function fmtMins(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pad2(n) {
  return n.toString().padStart(2, "0");
}

// Generates every individual boat departure for one port -> destination leg,
// seeded so the same route always produces the same schedule rather than
// reshuffling on every click.
export function genDepartures(port, destination, cfg) {
  const rng = mulberry32(hashStr(`${port}|${destination}`));
  const shuffled = [...OPERATOR_POOL].sort(() => rng() - 0.5);
  const startHour = cfg.ferry ? 6 : 7;
  const endHour = cfg.ferry ? 21 : 16;
  const span = endHour - startHour;

  const boats = [];
  for (let i = 0; i < cfg.count; i++) {
    const hour = Math.min(23, startHour + Math.floor((span * (i + 0.5)) / cfg.count));
    const min = [0, 15, 30, 45][Math.floor(rng() * 4)];
    const price = Math.round(cfg.priceLow + rng() * (cfg.priceHigh - cfg.priceLow));
    boats.push({
      operator: cfg.ferry ? "ASDP Public Ferry" : shuffled[i % shuffled.length],
      depart: `${pad2(hour)}:${pad2(min)}`,
      boatMin: cfg.duration,
      price,
    });
  }
  return boats.sort((a, b) => a.depart.localeCompare(b.depart));
}

export function planTrips(villaArea, destination) {
  const groups = [];
  for (const port of Object.keys(BOAT_ROUTES)) {
    const cfg = BOAT_ROUTES[port][destination];
    const drive = DRIVE_TIMES[villaArea] ? DRIVE_TIMES[villaArea][port] : null;
    if (!cfg || drive == null) continue;
    const boats = genDepartures(port, destination, cfg).map((b) => ({
      ...b,
      driveMin: drive,
      totalMin: drive + CHECKIN_BUFFER_MIN + b.boatMin,
    }));
    groups.push({ port, driveMin: drive, boats });
  }
  // order port groups by their fastest individual boat first
  groups.sort((a, b) => Math.min(...a.boats.map((x) => x.totalMin)) - Math.min(...b.boats.map((x) => x.totalMin)));
  return groups;
}

// Used by the compare-boats page.
export const ORIGINS = ["Sanur", "Padang Bai", "Serangan"];
export const DESTS = ["Gili Trawangan", "Gili Air", "Nusa Penida"];

export function genTrips(from, to) {
  const rng = mulberry32(hashStr(`${from}|${to}`));
  const ops = ["Blue Water Express", "Gili Gili Fast Boat", "Eka Jaya Fast Boat", "Scoot Cruise"];
  return ops
    .slice(0, 4)
    .map((op, i) => {
      const hour = 6 + Math.floor(rng() * 11);
      const min = [0, 15, 30, 45][Math.floor(rng() * 4)];
      const price = 18 + Math.floor(rng() * 22);
      return { id: i, operator: op, depart: `${pad2(hour)}:${pad2(min)}`, price };
    })
    .sort((a, b) => a.depart.localeCompare(b.depart));
}
