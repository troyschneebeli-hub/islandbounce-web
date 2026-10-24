"use client";

// Booking controls for the route pages. RouteBookingProvider holds the date,
// travellers and port pair, so the booking box and every timetable row's Book
// button open the same booking page. All links come from bookingLink().

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { COLORS } from "@/lib/theme";
import { bookingLink } from "@/lib/bookingLink";

const BookingContext = createContext(null);

const TRAVELLER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const short = (name) => name.replace(/ \((SW )?Lombok\)$/, "");
const pairKey = (p) => `${p.from}|${p.to}`;

// A day in the visitor's own time zone, as "YYYY-MM-DD" (0 = today, 1 = tomorrow).
function dayISO(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const tomorrowISO = () => dayISO(1);

/** @param {{ pairs: { from: string, to: string, minPrice: number | null }[], defaultPair?: { from: string, to: string }, children: any }} props */
export function RouteBookingProvider({ pairs, defaultPair, children }) {
  const initial = pairs.find((p) => defaultPair && pairKey(p) === pairKey(defaultPair)) || pairs[0];
  // The page is pre-rendered, so "tomorrow" is set after it loads in the browser.
  const [date, setDate] = useState("");
  const [travellers, setTravellers] = useState(2);
  const [pair, setPair] = useState(initial ? pairKey(initial) : "");
  useEffect(() => setDate((d) => d || tomorrowISO()), []);

  // Until the date is set (first paint), links carry no date rather than one
  // worked out on the server.
  const linkFor = (from, to) => bookingLink(from, to, date || undefined, undefined, travellers);
  // "Look for" note: the booking site can't open one sailing (no per-trip links), only the route, so after a tap on a
  // time or Book we say which card to pick there. It stays until closed, so it's still there when they come back.
  const [hint, setHint] = useState(null);
  return (
    <BookingContext.Provider value={{ pairs, date, setDate, travellers, setTravellers, pair, setPair, linkFor, setHint }}>
      {children}
      {hint && <LookForNote hint={hint} date={date} travellers={travellers} onClose={() => setHint(null)} />}
    </BookingContext.Provider>
  );
}

const fmtDay = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) : "");

function LookForNote({ hint, date, travellers, onClose }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ position: "fixed", left: 16, right: 16, bottom: "calc(84px + env(safe-area-inset-bottom))", zIndex: 50, maxWidth: 440, margin: "0 auto", background: COLORS.seaDeep, color: "white", borderRadius: 14, padding: "12px 40px 12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontSize: 13.5, lineHeight: 1.45 }}
    >
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1, opacity: 0.75, marginBottom: 2 }}>OPENED THE BOOKING PAGE IN A NEW TAB</div>
      On {short(hint.from)} → {short(hint.to)}, look for{" "}
      <strong>
        {hint.listedAt || hint.time} {hint.operator}
        {hint.fare ? `, from A$${hint.fare}` : ""}
      </strong>
      {hint.listedAt && hint.listedAt !== hint.time ? ` (the operator's timetable says ${hint.time})` : ""}
      {date ? ` on ${fmtDay(date)}` : ""}
      {travellers ? `, ${travellers} ${travellers === 1 ? "traveller" : "travellers"}` : ""}. Fares can differ by date.
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "white", fontSize: 18, lineHeight: 1, cursor: "pointer", opacity: 0.8 }}
      >
        ×
      </button>
    </div>
  );
}

function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("RouteBooking components must sit inside RouteBookingProvider");
  return ctx;
}

const label = { display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: COLORS.sea, marginBottom: 4 };
const field = { width: "100%", border: `1px solid ${COLORS.foamLine}`, borderRadius: 8, padding: "9px 10px", fontSize: 14, color: COLORS.ink, background: "white" };
const bigButton = { display: "block", textAlign: "center", background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 15, padding: "13px 20px", borderRadius: 999, textDecoration: "none" };

export function BookingBox() {
  const { pairs, date, setDate, travellers, setTravellers, pair, setPair, linkFor } = useBooking();
  const buttonRef = useRef(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  // On phones, pin a copy of the button to the bottom of the screen once the
  // main one has scrolled out of view, and drop it again when the site footer
  // comes into view so it never covers the footer links.
  useEffect(() => {
    if (!buttonRef.current || typeof IntersectionObserver === "undefined") return;
    const footer = document.querySelector("footer");
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === buttonRef.current) setButtonVisible(entry.isIntersecting);
        else setFooterVisible(entry.isIntersecting);
      }
    });
    obs.observe(buttonRef.current);
    if (footer) obs.observe(footer);
    return () => obs.disconnect();
  }, []);

  const current = pairs.find((p) => pairKey(p) === pair) || pairs[0];
  if (!current) return null;
  const href = linkFor(current.from, current.to);
  const routeText = `${short(current.from)} to ${short(current.to)}`;

  return (
    <>
      <div style={{ border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: 16, background: COLORS.foam, marginBottom: 28 }}>
        <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
          {pairs.length > 1 && (
            <div className="col-span-2">
              <label htmlFor="route-pair" style={label}>Route</label>
              <select id="route-pair" value={pair} onChange={(e) => setPair(e.target.value)} style={field}>
                {pairs.map((p) => (
                  <option key={pairKey(p)} value={pairKey(p)}>
                    {short(p.from)} → {short(p.to)}{p.minPrice ? ` · from A$${p.minPrice}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="route-date" style={label}>Date</label>
            <input id="route-date" type="date" value={date} min={date ? dayISO(0) : undefined} onChange={(e) => setDate(e.target.value)} style={field} />
          </div>
          <div>
            <label htmlFor="route-travellers" style={label}>Travellers</label>
            <select id="route-travellers" value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} style={field}>
              {TRAVELLER_OPTIONS.map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "traveller" : "travellers"}</option>
              ))}
            </select>
          </div>
        </div>
        <a ref={buttonRef} href={href} target="_blank" rel="sponsored noopener noreferrer" style={bigButton}>
          Check times and book
        </a>
        <p style={{ fontSize: 11.5, color: COLORS.ink, opacity: 0.65, marginTop: 8, textAlign: "center" }}>
          Opens {routeText} on the booking page with your date and travellers filled in.
        </p>
      </div>

      {!buttonVisible && !footerVisible && (
        <div
          className="md:hidden"
          style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))", background: "rgba(255,255,255,0.96)", borderTop: `1px solid ${COLORS.foamLine}`, boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
        >
          <a href={href} target="_blank" rel="sponsored noopener noreferrer" style={bigButton}>
            Check times and book
          </a>
        </div>
      )}
    </>
  );
}

// A departure time as a chip that opens the route on the booking page with the chosen date and
// travellers. Never a per-sailing link: the booking site has no stable link to one sailing.
/** @param {{ from: string, to: string, time: string, operator: string, listedAt?: string | null, fare?: number | null }} props */
export function TimeChip({ from, to, time, operator, listedAt, fare }) {
  const { linkFor, setHint } = useBooking();
  const listed = listedAt && listedAt !== time ? ` (listed there at ${listedAt})` : "";
  return (
    <a
      href={linkFor(from, to)}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => setHint({ from, to, time, operator, listedAt, fare })}
      title={`Opens ${short(from)} to ${short(to)} on the booking page. Look for the ${time} ${operator} sailing${listed}.`}
      style={{ display: "inline-block", fontWeight: 700, color: COLORS.sea, background: COLORS.foam, border: `1px solid ${COLORS.foamLine}`, borderRadius: 999, padding: "2px 9px", textDecoration: "none", whiteSpace: "nowrap" }}
    >
      {time}
    </a>
  );
}

/** @param {{ from: string, to: string, time: string, operator: string, listedAt?: string | null, fare?: number | null }} props */
export function RowBookButton({ from, to, time, operator, listedAt, fare }) {
  const { linkFor, setHint } = useBooking();
  return (
    <a
      href={linkFor(from, to)}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => setHint({ from, to, time, operator, listedAt, fare })}
      title={`Opens this route on the booking page. Look for the ${time} ${operator} sailing.`}
      style={{ display: "inline-block", background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 12.5, padding: "5px 12px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap" }}
    >
      Book
    </a>
  );
}
