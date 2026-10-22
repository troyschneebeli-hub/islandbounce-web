// Checks parseRaw against trip cards copied from the live booking page.
//     node scripts/weekly/test_parse.mjs
import { readFileSync } from "node:fs";
import { parseRaw, to24h } from "./parse_card.mjs";

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

// Layout B, as GitHub's runner got it (prices in US$ there, so no price is kept).
const linesB = readFileSync(new URL("./fixtures/cards-layout-b-bangsal-2026-10-28.txt", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean);
const expectedB = [
  null, null, null, // "Fast Ferry + Van" to Kuta / Legian / Jimbaran
  { dep: "13:00", arr: "15:20", op: "Dcamel Fast Ferry", ty: "Ferry", cls: "Aluminium Fast Ferry", price: null, currency: "USD?" },
  { dep: "12:30", arr: "15:20", op: "Dcamel Fast Ferry", ty: "Ferry" },
  { dep: "13:30", arr: "15:20", op: "Dcamel Fast Ferry", ty: "Ferry", dur: "1h 50m" },
  { dep: "13:30", arr: "15:30", op: "Wahana Virendra", ty: "Ferry", cls: "Fast Ferry" },
  { dep: "13:30", arr: "15:30", op: "Nusa Nadhi Fast Ferry", ty: "Ferry", cls: "Fast Boat" },
  { dep: "08:30", arr: "11:30", op: "Marina Group", ty: "Ferry", dur: "3h" },
];
linesB.forEach((line, i) => {
  const got = parseRaw(line);
  const want = expectedB[i];
  const ok = want === null ? got === null : got && Object.entries(want).every(([k, v]) => got[k] === v);
  if (!ok) { failed++; console.log(`FAIL layout B card ${i + 1}: want ${JSON.stringify(want)} got ${JSON.stringify(got)}`); }
});
if (linesB.length !== expectedB.length) { failed++; console.log(`expected ${expectedB.length} layout B cards, fixture has ${linesB.length}`); }
const b = parseRaw(linesB[6].replace("|$28|", "|A$37|")); // same card with curr=AUD
if (!b || b.price !== 37 || b.currency !== "A$") { failed++; console.log(`FAIL layout B in A$: got ${JSON.stringify(b)}`); }

// 12-hour times (in case 12Go shows them that way to some visitors) parse to the same sailing.
const pm = parseRaw("Instant confirmation|1:30 PM|3:30 PM|2h|Bangsal, Lombok|Nusa Penida|Fast Boat | Ferry|Nusa Nadhi Fast Ferry|4.2|A$28|per adult|Book now");
if (!pm || pm.dep !== "13:30" || pm.arr !== "15:30" || pm.op !== "Nusa Nadhi Fast Ferry") { failed++; console.log(`FAIL 12-hour card: got ${JSON.stringify(pm)}`); }
for (const [x, want] of [["8:05am", "08:05"], ["12:15 AM", "00:15"], ["12:15 PM", "12:15"], ["--:--", null]]) {
  if (to24h(x) !== want) { failed++; console.log(`FAIL to24h("${x}"): want ${want} got ${to24h(x)}`); }
}
console.log(failed ? `${failed} failed` : `all ${lines.length} layout A and ${linesB.length} layout B cards parsed as expected`);
process.exit(failed ? 1 : 0);
