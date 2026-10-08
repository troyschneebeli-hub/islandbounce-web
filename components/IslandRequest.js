"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { CONTACT_EMAIL } from "@/lib/site";
import { submitWaitlist, buildWaitlistMailto } from "@/lib/waitlist";

// Replaces the empty "Philippines / Laos: coming soon" cards with something
// useful: asking visitors where they'd like us to go next. Uses the same
// signup helper as the Split Charters waitlist (a real signup service if
// NEXT_PUBLIC_WAITLIST_ENDPOINT is set, otherwise a pre-filled email to us).
export default function IslandRequest() {
  const [island, setIsland] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setError("");
    setSending(true);
    const route = `Island request: ${island.trim() || "not specified"}`;
    const result = await submitWaitlist({ email, route, endpoint: process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT, source: "island-request" });
    setSending(false);
    if (result.status === "invalid") setError("Enter a valid email so we can let you know.");
    else if (result.status === "error") setError(`Something went wrong. Please try again, or email us at ${CONTACT_EMAIL}.`);
    else if (result.status === "saved") setSent("saved");
    else {
      window.location.href = buildWaitlistMailto(CONTACT_EMAIL, result.email, route, { subject: "Island request", intro: "Please tell me when you add a new island." });
      setSent("mailto");
    }
  }

  const input = { padding: "10px 12px", borderRadius: 8, border: `1px solid ${COLORS.foamLine}`, fontSize: 14, width: "100%", background: "white", color: COLORS.ink };

  return (
    <div style={{ maxWidth: 560, margin: "26px auto 0", background: COLORS.foam, borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
      <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 19, color: COLORS.sea, marginBottom: 4 }}>Where should we go next?</h3>
      {sent ? (
        <p style={{ fontSize: 14, color: COLORS.sea, fontWeight: 600 }}>
          {sent === "saved" ? "Thanks, we'll let you know." : `Your email app should have opened. Hit send to tell us. If nothing opened, email us at ${CONTACT_EMAIL}.`}
        </p>
      ) : (
        <>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>Tell us an island or country you'd like compared, and we'll email you when we add it.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input aria-label="Island or country" value={island} onChange={(e) => setIsland(e.target.value)} placeholder="e.g. Flores, Philippines" style={input} />
            <input aria-label="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
            <button type="button" onClick={handleSend} disabled={sending} style={{ background: COLORS.coral, color: "white", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
              {sending ? "Sending…" : "Tell us"}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: COLORS.coralDeep, marginTop: 8 }}>{error}</div>}
        </>
      )}
    </div>
  );
}
