// Checks parseRaw against trip cards copied from the live booking page.
//     node scripts/weekly/test_parse.mjs
import { readFileSync } from "node:fs";
import { parseRaw } from "./parse_card.mjs";

const lines = readFileSync(new URL("./fixtures/cards-padang-bai-gili-trawangan-2026-10-29.txt", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean);
const expected = [
  { dep: "13:15", op: "Wahana Virendra", ty: "Ferry", price: 36 },
  { dep: "10:30", op: "Dcamel Fast Ferry", ty: "Ferry", price: 31 },
  { dep: "10:00", op: "Gili Gili Fastboat", ty: "Ferry", price: 40 },
  { dep: "13:45", op: "Wijaya Tramena", ty: "Ferry", price: 31 },
  { dep: "08:45", op: "Karunia Luxury Fast Boat", ty: "Ferry", price: 21 },
  { dep: "09:30", op: "Ostina Fast Boat", ty: "Ferry", price: 37 },
  null, // "--:--" choose-a-time package
  null, // flight
  { dep: "09:30", op: "Golden Queen Fast Ferry", ty: "Ferry", price: 31 },
  { dep: "12:15", op: "BlueWater Express", ty: "Ferry", price: 58 },
  { dep: "13:20", op: "Semaya One", ty: "Ferry", price: 39 },
  { dep: "13:45", op: "WaterJet", ty: "Ferry", price: 39 },
  null, // extra-class sub-card with no times
  null, // "--:--" van package
  { dep: "09:15", op: "Express Bali Travel", ty: "Ferry", price: 35 },
  { dep: "08:30", op: "Bali Tour", ty: "Van", price: 35 },
];

let failed = 0;
lines.forEach((line, i) => {
  const got = parseRaw(line);
  const want = expected[i];
  const ok = want === null ? got === null : got && Object.entries(want).every(([k, v]) => got[k] === v);
  if (!ok) { failed++; console.log(`FAIL card ${i + 1}: want ${JSON.stringify(want)} got ${JSON.stringify(got)}`); }
});
if (lines.length !== expected.length) { failed++; console.log(`expected ${expected.length} cards, fixture has ${lines.length}`); }
console.log(failed ? `${failed} failed` : `all ${lines.length} cards parsed as expected`);
process.exit(failed ? 1 : 0);
