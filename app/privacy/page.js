import { COLORS } from "@/lib/theme";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Privacy Policy",
  description: "What IslandBounce collects, why, and who else is involved.",
  alternates: { canonical: "/privacy" },
};

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 21, color: COLORS.sea, margin: "28px 0 8px" };
const p = { fontSize: 14.5, lineHeight: 1.7, color: COLORS.ink, opacity: 0.88, marginBottom: 10 };
const link = { color: COLORS.sea, fontWeight: 600 };

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 70px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 32, color: COLORS.sea, marginBottom: 4 }}>
        Privacy Policy
      </h1>
      <p style={{ ...p, opacity: 0.6, fontSize: 13 }}>Last updated 7 October 2026</p>

      <p style={p}>
        IslandBounce is operated by ClankINC, an Australian partnership. This page explains what information the site
        collects, what we do with it, and who else is involved. We aim to handle personal information in line with the
        Australian Privacy Principles.
      </p>

      <h2 style={h2}>What we collect</h2>
      <p style={p}>
        <strong>Visit statistics.</strong> We use Vercel Web Analytics to see which pages are visited, roughly where
        visitors are from, what device they use, and how they found us. We use this to improve the site, not to
        identify individual visitors. See{" "}
        <a style={link} href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">
          Vercel&apos;s analytics privacy documentation
        </a>.
      </p>
      <p style={p}>
        <strong>Trip Planner addresses.</strong> If you enter an address, it is sent to Google Maps services to work out
        driving distances and routes. We don&apos;t save or keep a record of it ourselves. Our hosting provider&apos;s standard
        server logs may briefly record requests.
      </p>
      <p style={p}>
        <strong>Split Charters waitlist.</strong> If you join the waitlist we receive your email address and the route you
        chose, and use them only to tell you when it launches.
      </p>
      <p style={p}>
        <strong>Emails to us.</strong> If you contact us, we keep your message and address so we can reply.
      </p>

      <h2 style={h2}>Cookies and third parties</h2>
      <p style={p}>
        IslandBounce doesn&apos;t set advertising cookies. Some third-party services we use or link to may set their own: Google
        Maps (maps and address suggestions) and the booking platforms you click through to, such as 12Go. They have their
        own privacy policies, and we don&apos;t control them. Booking links may carry a tracking code so the platform knows the
        visit came from us.
      </p>

      <h2 style={h2}>Bookings and affiliate links</h2>
      <p style={p}>
        IslandBounce is a comparison site. We don&apos;t operate the boats and we don&apos;t take payment for bookings. When you
        book, you do so on the operator&apos;s or booking platform&apos;s own site and under their terms and privacy policy. We may
        earn a commission when you book through our links, at no extra cost to you.
      </p>

      <h2 style={h2}>Who we share information with</h2>
      <p style={p}>
        We don&apos;t sell personal information. We use service providers to run the site: Vercel (hosting and analytics), Google
        (maps and our email), and Open-Meteo (sea conditions, which only receives port locations, not visitor information).
      </p>

      <h2 style={h2}>How long we keep it</h2>
      <p style={p}>
        Waitlist emails are kept until the feature launches or you ask us to remove you. Emails to us are kept as long as
        needed to deal with your enquiry and for our records.
      </p>

      <h2 style={h2}>Your choices</h2>
      <p style={p}>
        You can ask to see the personal information we hold about you, ask us to correct or delete it, or ask us to remove
        you from the waitlist, by emailing{" "}
        <a style={link} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you&apos;re unhappy with how we&apos;ve handled
        something, tell us first; you can also contact the{" "}
        <a style={link} href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">Office of the Australian Information Commissioner</a>.
      </p>

      <h2 style={h2}>Changes</h2>
      <p style={p}>If we change how the site handles information, we&apos;ll update this page and its date.</p>
    </div>
  );
}
