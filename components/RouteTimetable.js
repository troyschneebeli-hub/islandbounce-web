import { COLORS } from "@/lib/theme";
import { durationMins, fmtDuration, knownDurations, seasonLabel, shortPort } from "@/lib/timetable";
import { RowBookButton, TimeChip } from "@/components/RouteBooking";

const th = {
  textAlign: "left",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: COLORS.sea,
  padding: "8px 10px",
  borderBottom: `2px solid ${COLORS.foamLine}`,
  whiteSpace: "nowrap",
};
const td = { padding: "10px", fontSize: 13.5, color: COLORS.ink, borderBottom: `1px solid ${COLORS.foamLine}`, verticalAlign: "top" };
// The Book column stays pinned to the right edge while a phone scrolls the table sideways.
const bookCol = { position: "sticky", right: 0, background: "white", boxShadow: "-6px 0 8px -6px rgba(0,0,0,0.12)" };
const COLS = 8;
const badge = (bg, fg) => ({ display: "inline-block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", background: bg, color: fg, borderRadius: 999, padding: "2px 8px", marginRight: 8 });

const isConfirmed = (s) => s.confidence === "confirmed";

function notesFor(s) {
  const notes = [];
  if (s.boat && /van|bus|shuttle/i.test(s.boat)) notes.push(`Includes a road transfer (${s.boat})`);
  if (s.via.length) notes.push(`Also stops at ${s.via.map(shortPort).join(", ")}`);
  const label = seasonLabel(s);
  if (label) notes.push(`Runs ${label}`);
  if (s.daysLabel) notes.push(`Not daily: seen ${s.daysLabel}`);
  if (s.twelvegoDeparts && s.twelvegoDeparts !== s.departs) notes.push(`Listed at ${s.twelvegoDeparts} on the booking page`);
  if (s.arrivesFrom) notes.push("Arrival time from the booking site");
  if (s.flag) notes.push(s.flag);
  return notes.join(" · ");
}

// One plain table per from -> to pair, rendered on the server so search engines
// see every row. Confirmed sailings (operator timetable + booking site) come first,
// then the booking-site-only "typical" ones. Only the time chips and Book buttons
// are client components: they read the date and travellers from the booking box,
// so this must sit inside RouteBookingProvider.
export default function RouteTimetable({ groups, scanText }) {
  return (
    <div>
      {groups.map((g) => {
        const confirmed = g.sailings.filter(isConfirmed);
        const typical = g.sailings.filter((s) => !isConfirmed(s));
        // "Fastest" only goes to confirmed sailings, so an odd listing can't take the highlight.
        const confDurs = knownDurations(confirmed);
        const fastest = confDurs.length ? Math.min(...confDurs) : null;
        const highlight = new Set(confDurs).size > 1; // only call out "fastest" when there's a real difference
        const sections = [
          {
            key: "confirmed",
            rows: confirmed,
            head: (
              <>
                <span style={badge(COLORS.sea, "white")}>Confirmed</span>
                On the operator&apos;s own timetable and the booking site{scanText ? `, checked ${scanText}` : ""}
              </>
            ),
          },
          {
            key: "typical",
            rows: typical,
            head: (
              <>
                <span style={badge(COLORS.foam, COLORS.sea)}>Typical departures</span>
                Listed on the booking site, not yet checked against the operator&apos;s timetable
              </>
            ),
          },
        ].filter((sec) => sec.rows.length);

        return (
          <div key={`${g.from}|${g.to}`} style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 6 }}>
              {shortPort(g.from)} → {shortPort(g.to)}
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <caption className="sr-only">
                  Fast boat departures from {shortPort(g.from)} to {shortPort(g.to)}
                </caption>
                <thead>
                  <tr>
                    <th style={th}>Operator</th>
                    <th style={th}>Check-in</th>
                    <th style={th}>Departs</th>
                    <th style={th}>Arrives</th>
                    <th style={th}>Duration</th>
                    <th style={th}>From (adult)</th>
                    <th style={th}>Notes</th>
                    <th style={{ ...th, ...bookCol }}><span className="sr-only">Book</span></th>
                  </tr>
                </thead>
                {sections.map((sec) => (
                  <tbody key={sec.key}>
                    <tr>
                      <th colSpan={COLS} scope="rowgroup" style={{ ...td, textAlign: "left", fontSize: 12, fontWeight: 400, color: COLORS.ink, opacity: 0.85, background: COLORS.foam, padding: "8px 10px" }}>
                        {sec.head}
                      </th>
                    </tr>
                    {sec.rows.map((s) => {
                      const dur = durationMins(s.departs, s.arrives);
                      const isFastest = highlight && isConfirmed(s) && dur === fastest;
                      const fare = s.fareAUD ?? s.price;
                      return (
                        <tr key={s.id}>
                          <td style={{ ...td, fontWeight: 600 }}>{s.operator}</td>
                          <td style={td}>{s.checkIn || "—"}</td>
                          <td style={td}>
                            <TimeChip from={s.from} to={s.to} time={s.departs} operator={s.operator} listedAt={s.twelvegoDeparts} />
                          </td>
                          <td style={td}>{s.arrives || "—"}</td>
                          <td style={{ ...td, fontWeight: isFastest ? 700 : 400, color: isFastest ? COLORS.coralDeep : COLORS.ink }}>{fmtDuration(dur)}</td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>{fare ? `From A$${fare}` : "—"}</td>
                          <td style={{ ...td, fontSize: 12, opacity: 0.75 }}>{notesFor(s)}</td>
                          <td style={{ ...td, ...bookCol, textAlign: "right", verticalAlign: "middle" }}>
                            <RowBookButton from={s.from} to={s.to} time={s.departs} operator={s.operator} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
