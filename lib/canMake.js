// "Can I make this boat?" — given when someone sets off, how long the drive
// is, and a boat's departure (and check-in time where the operator publishes
// one), say whether they'll get to the port in time.
//
//   ok     — arrives at the port with at least TIGHT_MARGIN_MIN to spare
//   tight  — makes it, but with less than that to spare
//   missed — would arrive after check-in closes
//
// If an operator publishes a check-in time we use it; otherwise we assume the
// standard buffer before departure (CHECKIN_BUFFER_MIN in data/planner.js).

export const TIGHT_MARGIN_MIN = 20;

export function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function classifyDeparture({ leaveAt, driveMin, departs, checkIn, bufferMin }) {
  const leave = toMinutes(leaveAt), dep = toMinutes(departs);
  if (leave === null || dep === null || !Number.isFinite(driveMin)) return null;
  const ci = toMinutes(checkIn);
  const mustBeThereBy = ci !== null ? ci : dep - bufferMin;
  const slack = mustBeThereBy - (leave + driveMin);
  if (slack < 0) return "missed";
  return slack < TIGHT_MARGIN_MIN ? "tight" : "ok";
}

// groups: portDepartures(...).groups. Returns every departure with its status
// (sorted by time) and the first one still catchable.
export function annotateDepartures(groups, { leaveAt, driveMin, bufferMin }) {
  const items = [];
  for (const g of groups) {
    for (const d of g.details) {
      items.push({ operator: g.operator, time: d.time, status: classifyDeparture({ leaveAt, driveMin, departs: d.time, checkIn: d.checkIn, bufferMin }) });
    }
  }
  items.sort((a, b) => a.time.localeCompare(b.time) || a.operator.localeCompare(b.operator));
  return { items, next: items.find((i) => i.status && i.status !== "missed") || null };
}
