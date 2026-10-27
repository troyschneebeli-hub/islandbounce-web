import { COLORS } from "@/lib/theme";
import { PARTNER_IDS, buildStayLink } from "@/lib/affiliateLinks";
import { shortPort } from "@/lib/timetable";
import { STAYS } from "@/data/stays";

const BALI = ["Sanur", "Padang Bai"];
const button = {
  display: "inline-block", border: `1.5px solid ${COLORS.sea}`, color: COLORS.sea, fontWeight: 700, fontSize: 13,
  padding: "7px 14px", borderRadius: 999, textDecoration: "none",
};

// "Where to stay" for one or more places (data/stays.js): area tips, our own picks once we have them, and search
// buttons for the booking sites. A link carrying our affiliate ID is marked sponsored; plain searches are nofollow.
export default function WhereToStay({ places, title }) {
  const list = places.filter((p) => STAYS[p]);
  if (!list.length) return null;
  const earns = Boolean(PARTNER_IDS.booking) || list.some((p) => Object.values(STAYS[p].links).some(Boolean));
  const relFor = (paid) => (paid ? "sponsored noopener noreferrer" : "nofollow noopener noreferrer");
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.sea, marginBottom: 8 }}>
        {title || `Where to stay ${BALI.includes(list[0]) ? "in" : "on"} ${shortPort(list[0])}`}
      </h2>
      {list.map((place) => {
        const s = STAYS[place];
        return (
          <div key={place} style={{ marginBottom: 18 }}>
            {list.length > 1 && <h3 style={{ fontWeight: 700, fontSize: 16, color: COLORS.sea, marginBottom: 4 }}>{shortPort(place)}</h3>}
            {s.tips.map((t) => (
              <p key={t} style={{ fontSize: 14.5, lineHeight: 1.7, color: COLORS.ink, opacity: 0.85, marginBottom: 8 }}>{t}</p>
            ))}
            {s.picks.length > 0 && (
              <ul style={{ margin: "4px 0 10px", paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
                {s.picks.map((p) => (
                  <li key={p.name}>
                    <a href={p.url} target="_blank" rel={relFor(true)} style={{ color: COLORS.sea, fontWeight: 700 }}>{p.name}</a>
                    {` (${p.kind.toLowerCase()})`}: {p.note}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <a href={buildStayLink(s.search)} target="_blank" rel={relFor(Boolean(PARTNER_IDS.booking))} style={button}>
                Places to stay on Booking.com →
              </a>
              {s.links.agoda && <a href={s.links.agoda} target="_blank" rel={relFor(true)} style={button}>Agoda →</a>}
              {s.links.hostelworld && <a href={s.links.hostelworld} target="_blank" rel={relFor(true)} style={button}>Hostels on Hostelworld →</a>}
            </div>
          </div>
        );
      })}
      {earns && (
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Some of these links earn us a small commission if you book, at no extra cost to you.</p>
      )}
    </section>
  );
}
