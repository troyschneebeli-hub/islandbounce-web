import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { GIVING } from "@/data/giving";

export const metadata = {
  title: "Giving Back to the Gili Islands",
  description: `IslandBounce gives ${GIVING.percent}% of the commission it earns to ${GIVING.org}, which restores reefs and tackles waste on the Gili Islands. Booking through us costs you nothing extra.`,
  alternates: { canonical: "/giving" },
};

const h2 = { fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.sea, margin: "28px 0 10px" };
const para = { fontSize: 15, lineHeight: 1.7, marginBottom: 14 };
const th = { textAlign: "left", fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: COLORS.sea, padding: "8px 10px", borderBottom: `2px solid ${COLORS.foamLine}` };
const td = { padding: "10px", fontSize: 14, borderBottom: `1px solid ${COLORS.foamLine}` };
const aud = (n) => `A$${Number(n).toFixed(2)}`;

export default function GivingPage() {
  const { percent, org, orgUrl, orgHelpUrl, ledger } = GIVING;
  const totalDonated = ledger.reduce((sum, r) => sum + (r.donatedAUD || 0), 0);
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "44px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 32, color: COLORS.sea, marginBottom: 16 }}>
        Giving back to the islands
      </h1>
      <p style={para}>
        IslandBounce is an affiliate site: when you book through our links, the booking site pays us a commission, and you pay the same
        price as booking with them directly. <strong>{percent}% of every commission we earn goes to {org}</strong>, which looks after the
        reefs and beaches of the Gili Islands that so many of the boats on this site sail to.
      </p>

      <h2 style={h2}>What {org} does</h2>
      <p style={para}>
        {org} is a conservation team based on the Gili Islands. Their work includes reef restoration (Biorock structures and coral
        gardening), island-wide waste collection, environmental education, and a sea turtle project.{" "}
        <a href={orgUrl} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.sea, fontWeight: 700 }}>Visit their site</a> to see
        their projects.
      </p>
      <p style={{ ...para, fontSize: 13.5, opacity: 0.75 }}>
        We chose to support {org}; they don&apos;t endorse IslandBounce or the boats we list.
      </p>

      <h2 style={h2}>Every donation, in the open</h2>
      {ledger.length ? (
        <>
          <p style={para}>
            We&apos;ve given {aud(totalDonated)} so far. Each quarter we add what we earned in commission, what we gave and proof of the
            donation.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr>
                  <th style={th}>Period</th>
                  <th style={th}>Commission earned</th>
                  <th style={th}>Donated</th>
                  <th style={th}>Proof</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r) => (
                  <tr key={r.period}>
                    <td style={td}>{r.period}</td>
                    <td style={td}>{aud(r.earnedAUD)}</td>
                    <td style={td}>{aud(r.donatedAUD)}</td>
                    <td style={td}>{r.proof ? <a href={r.proof} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.sea }}>Receipt</a> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p style={para}>
          We&apos;re new and haven&apos;t earned any commission yet, so we haven&apos;t donated yet. Once we do, we&apos;ll list each quarter
          here: what we earned, what we gave and proof of the donation.
        </p>
      )}

      <h2 style={h2}>Help directly when you&apos;re there</h2>
      <p style={para}>
        {org} runs a community beach clean-up, Debris Free Friday, every Friday from 5pm on the Gilis. The spot changes each week and is
        posted on their social media. You can also{" "}
        <a href={orgHelpUrl} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.sea, fontWeight: 700 }}>see other ways to help</a>.
      </p>

      <div style={{ background: COLORS.foam, borderRadius: 10, padding: 18, fontSize: 13, opacity: 0.85, marginTop: 24 }}>
        Questions about our giving? <Link href="/about" style={{ color: COLORS.sea, fontWeight: 700 }}>Get in touch</Link>.
      </div>
    </div>
  );
}
