import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { durationMins, fmtDuration, knownDurations, shortPort } from "@/lib/timetable";
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
const td = { padding: "10px", fontSize: 13.5, color: COLORS.ink, borderBottom: `1px solid ${COLORS.foamLine}`, verticalAlign: "middle" };
// The Book column stays pinned to the right edge while a phone scrolls the table sideways.
const bookCol = { position: "sticky", right: 0, background: "white", boxShadow: "-6px 0 8px -6px rgba(0,0,0,0.12)" };

// One open table per from -> to pair: every daily sailing you can book, rendered on the server so
// search engines see every row. Only the time chips and Book buttons are client components: they
// read the date and travellers from the booking box, so this must sit inside RouteBookingProvider.
// `hrefFor(from, to)` (optional) turns each pair's heading into a link, e.g. to its route page from an operator page.
export default function RouteTimetable({ groups, hrefFor }) {
  return (
    <div>
      {groups.map((g) => {
        const durs = knownDurations(g.sailings);
        const fastest = durs.length ? Math.min(...durs) : null;
        const highlight = new Set(durs).size > 1; // only call out "fastest" when there's a real difference
        const href = hrefFor ? hrefFor(g.from, g.to) : null;
        const title = `${shortPort(g.from)} → ${shortPort(g.to)}`;
        return (
          <div key={`${g.from}|${g.to}`} style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 6 }}>
              {href ? (
                <Link href={href} style={{ color: "inherit", textDecoration: "none", borderBottom: `1px solid ${COLORS.sea}55` }}>{title}</Link>
              ) : (
                title
              )}
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <caption className="sr-only">
                  Daily fast boat departures from {shortPort(g.from)} to {shortPort(g.to)}
                </caption>
                <thead>
                  <tr>
                    <th style={th}>Departs</th>
                    <th style={th}>Operator</th>
                    <th style={th}>Arrives</th>
                    <th style={{ ...th, ...bookCol }}><span className="sr-only">Book</span></th>
                  </tr>
                </thead>
                <tbody>
                  {g.sailings.map((s) => {
                    const dur = durationMins(s.departs, s.arrives);
                    const isFastest = highlight && dur === fastest;
                    return (
                      <tr key={s.id} data-sailing-id={s.id}>
                        <td style={td}>
                          <TimeChip from={s.from} to={s.to} time={s.departs} operator={s.operator} />
                        </td>
                        <td style={{ ...td, fontWeight: 600 }}>{s.operator}</td>
                        <td style={{ ...td, whiteSpace: "nowrap" }}>
                          {s.arrives ? (
                            <>
                              {s.arrives}{" "}
                              <span style={{ fontWeight: isFastest ? 700 : 400, color: isFastest ? COLORS.coralDeep : COLORS.ink, opacity: isFastest ? 1 : 0.65 }}>
                                ({fmtDuration(dur)})
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={{ ...td, ...bookCol, textAlign: "right" }}>
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
