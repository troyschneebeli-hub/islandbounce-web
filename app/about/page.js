import { COLORS } from "@/lib/theme";

export const metadata = {
  title: "Why IslandBounce",
  description: "How IslandBounce works, what's verified vs. researched, and our affiliate disclosure.",
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 32, color: COLORS.sea, marginBottom: 16 }}>
        Why IslandBounce
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
        Most transport comparison sites are built from schedules and spreadsheets, not real knowledge of the place.
        We&apos;re building IslandBounce the other way around — starting from real, on-the-ground familiarity with
        these islands, and adding firsthand detail — which terminal, which operator&apos;s aircon actually works, what
        the informal port fee is — route by route, as we go.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
        We&apos;re upfront that this is a work in progress: not every route has been personally verified yet, and
        we&apos;ll mark the difference clearly rather than write as if it has. We compare across operators and
        platforms, and we&apos;re upfront that some of those links earn us a commission if you book through them — at
        no extra cost to you. That&apos;s how the site stays free and independent.
      </p>
      <div style={{ background: COLORS.foam, borderRadius: 10, padding: 18, fontSize: 13, opacity: 0.85 }}>
        <strong>Disclosure:</strong> IslandBounce participates in affiliate programs including 12Go, Klook, Viator, and
        GetYourGuide. We aim to personally verify every route we recommend, and we&apos;ll always tell you plainly if
        one hasn&apos;t been checked firsthand yet.
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 14 }}>
          Who&apos;s behind this
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
          <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Troy</div>
            <div style={{ fontSize: 12.5, opacity: 0.65, marginBottom: 8 }}>Co-Founder &amp; Head of Customer Relations</div>
            <a href="mailto:troy@islandbouncetravel.com" style={{ color: COLORS.sea, fontWeight: 600, textDecoration: "none", fontSize: 13 }}>
              troy@islandbouncetravel.com
            </a>
          </div>
          <div style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Boston</div>
            <div style={{ fontSize: 12.5, opacity: 0.65, marginBottom: 8 }}>Co-Founder &amp; Head of Web &amp; Marketing</div>
            <a href="mailto:boston@islandbouncetravel.com" style={{ color: COLORS.sea, fontWeight: 600, textDecoration: "none", fontSize: 13 }}>
              boston@islandbouncetravel.com
            </a>
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
          Spotted something wrong, run a boat operator, or just want to say hi — either of us is a fair place to start.
        </p>
      </div>
    </div>
  );
}
