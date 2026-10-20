import { COLORS } from "@/lib/theme";
import { durationMins, fmtDuration, seasonLabel, shortPort } from "@/lib/timetable";
import { RowBookButton } from "@/components/RouteBooking";

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

// One plain table per from -> to pair, rendered on the server so search engines
// see every row. Only the Book buttons are client components: they read the date
// and travellers from the booking box, so this must sit inside RouteBookingProvider.
export default function RouteTimetable({ groups }) {
  return (
    <div>
      {groups.map((g) => {
        const durs = g.sailings.map((s) => durationMins(s.departs, s.arrives));
        // "Fastest" only goes to operators we've confirmed with (invisible to visitors), so an
        // odd listing can't take the highlight; no confirmed rows means no highlight.
        const isConf = g.sailings.map((s) => s.confidence !== "unconfirmed");
        const confDurs = durs.filter((_, i) => isConf[i]);
        const fastest = confDurs.length ? Math.min(...confDurs) : null;
        const highlight = new Set(confDurs).size > 1; // only call out "fastest" when there's a real difference
        return (
          <div key={`${g.from}|${g.to}`} style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 6 }}>
              {shortPort(g.from)} → {shortPort(g.to)}
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
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
                <tbody>
                  {g.sailings.map((s, i) => {
                    const isFastest = highlight && isConf[i] && durs[i] === fastest;
                    const notes = [];
                    if (s.boat && /van|bus|shuttle/i.test(s.boat)) notes.push(`Includes a road transfer (${s.boat})`);
                    if (s.via.length) notes.push(`Also stops at ${s.via.map(shortPort).join(", ")}`);
                    const label = seasonLabel(s);
                    if (label) notes.push(`Runs ${label}`);
                    if (s.flag) notes.push(s.flag);
                    return (
                      <tr key={s.id}>
                        <td style={{ ...td, fontWeight: 600 }}>{s.operator}</td>
                        <td style={td}>{s.checkIn || "—"}</td>
                        <td style={{ ...td, fontWeight: 700 }}>{s.departs}</td>
                        <td style={td}>{s.arrives}</td>
                        <td style={{ ...td, fontWeight: isFastest ? 700 : 400, color: isFastest ? COLORS.coralDeep : COLORS.ink }}>
                          {fmtDuration(durs[i])}
                        </td>
                        <td style={td}>{s.price ? `A$${s.price}` : "—"}</td>
                        <td style={{ ...td, fontSize: 12, opacity: 0.75 }}>{notes.join(" · ")}</td>
                        <td style={{ ...td, ...bookCol, textAlign: "right", verticalAlign: "middle" }}>
                          <RowBookButton from={s.from} to={s.to} time={s.departs} operator={s.operator} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
