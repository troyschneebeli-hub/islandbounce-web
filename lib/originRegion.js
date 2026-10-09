import { ISLAND_PORTS } from "@/data/ports";

// Works out which kind of start point an address is, so the planner can use the
// right harbours: "bali" (drive to a Bali port), "nusa" (drive to a Nusa
// harbour) or "gili" (walk to that island's harbour; the Gilis are car free).

const GILIS = ["Gili Trawangan", "Gili Air", "Gili Meno"];
const BANGSAL = "Bangsal (Lombok)";
const MAX_GILI_KM = 3;

function km(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// The Gili port an address belongs to, or null. Bangsal is included in the
// comparison so a Lombok address near the harbour isn't mistaken for Gili Air.
export function giliPortFor(o) {
  if (!o) return null;
  const candidates = ISLAND_PORTS.filter((p) => GILIS.includes(p.name) || p.name === BANGSAL);
  let best = null;
  for (const p of candidates) {
    const d = km(o, p);
    if (!best || d < best.d) best = { p, d };
  }
  return best && GILIS.includes(best.p.name) && best.d <= MAX_GILI_KM ? best.p : null;
}

export function isOnNusa(o) {
  return !!o && o.lat < -8.64 && o.lat > -8.83 && o.lng > 115.38 && o.lng < 115.66;
}

export function originRegion(o) {
  if (!o) return "bali";
  if (isOnNusa(o)) return "nusa";
  return giliPortFor(o) ? "gili" : "bali";
}
