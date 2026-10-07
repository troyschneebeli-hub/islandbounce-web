"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { CONTACT_EMAIL } from "@/lib/site";
import { submitWaitlist, buildWaitlistMailto } from "@/lib/waitlist";

export default function SplitCharterPage() {
  const [email, setEmail] = useState("");
  const [route, setRoute] = useState("Nusa Penida day charter");
  const [sent, setSent] = useState(""); // "" | "saved" | "mailto"
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");
    setSending(true);
    const result = await submitWaitlist({
      email,
      route,
      endpoint: process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT,
    });
    setSending(false);
    if (result.status === "invalid") {
      setError("Enter a valid email so we can notify you.");
    } else if (result.status === "error") {
      setError(`Something went wrong saving that. Please try again, or email us at ${CONTACT_EMAIL}.`);
    } else if (result.status === "saved") {
      setSent("saved");
    } else {
      // No signup service configured yet: open the visitor's email app with a
      // pre-filled message to us, so the email genuinely reaches us.
      window.location.href = buildWaitlistMailto(CONTACT_EMAIL, result.email, route);
      setSent("mailto");
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 60px" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: 2, marginBottom: 8 }}>
        NEW · COMING SOON
      </div>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 10 }}>
        Split a Private Charter
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.85, marginBottom: 24, maxWidth: 600 }}>
        Right now there&apos;s a big gap between a crowded shared fast boat and a $650/day private charter. This is the
        option in between — team up with other travelers heading the same way on similar dates, split a private boat,
        and pay a fraction each.
      </p>

      <div style={{ background: COLORS.foam, borderRadius: 10, padding: 20, marginBottom: 28 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.sea, letterSpacing: 1, marginBottom: 10 }}>
          THE MATH
        </div>
        <div className="flex flex-col sm:flex-row gap-4" style={{ textAlign: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.ink }}>$650</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>private charter, solo or as a couple</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, opacity: 0.4 }}>→</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.coral }}>~$108</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>per person, split six ways</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 14 }}>
        How it&apos;ll work
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ marginBottom: 32 }}>
        {[
          { n: "01", title: "Pick a route & window", body: "Choose the charter you want and a rough date range, not one fixed day — wider windows fill faster." },
          { n: "02", title: "We match you with others", body: "Once enough travelers register interest in the same route and window, we'll bring you together." },
          { n: "03", title: "Book direct, split the cost", body: "The group books the real charter through our partner platform and pays directly — we never hold anyone's money." },
        ].map((s) => (
          <div key={s.n}>
            <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.brass, marginBottom: 6 }}>{s.n}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
            <p style={{ fontSize: 12.5, opacity: 0.7, lineHeight: 1.6 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 6 }}>
          Register your interest
        </h2>
        <p style={{ fontSize: 13, opacity: 0.65, marginBottom: 16 }}>
          This isn&apos;t live yet — we&apos;re gauging interest before building the matching tool. Tell us what route
          you&apos;d want to split and we&apos;ll email you the moment it&apos;s ready.
        </p>
        {!sent ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="sm:flex-1"
              style={{ padding: "10px 8px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontSize: 14 }}
            >
              <option>Nusa Penida day charter</option>
              <option>Gili Islands day charter</option>
              <option>Bali → Gili private crossing</option>
              <option>Not sure yet</option>
            </select>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sm:flex-1"
              style={{ padding: "10px 10px", borderRadius: 6, border: `1px solid ${COLORS.foamLine}`, fontSize: 14 }}
            />
            <button
              type="button"
              onClick={handleRegister}
              disabled={sending}
              style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 6, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {sending ? "Sending…" : "Notify me"}
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: COLORS.sea, fontWeight: 600 }}>
            {sent === "saved"
              ? <>You&apos;re on the list for {route}.</>
              : <>Your email app should have opened. Hit send to join the list for {route}. If nothing opened, email us at {CONTACT_EMAIL}.</>}
          </div>
        )}
        {error && <div style={{ fontSize: 12, color: COLORS.coralDeep, marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
