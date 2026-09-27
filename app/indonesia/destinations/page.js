import { COLORS } from "@/lib/theme";
import { DESTINATIONS, ACTIVE_DESTINATIONS } from "@/data/destinations";
import PoppyCard from "@/components/PoppyCard";

export const metadata = {
  title: "Destination Guide",
  description: "Guides for every destination IslandBounce covers in Indonesia.",
};

export default function DestinationsPage() {
  const active = Object.entries(DESTINATIONS).filter(([key]) => ACTIVE_DESTINATIONS.includes(key));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6, textAlign: "center" }}>
        Destination Guide
      </h1>
      <p style={{ fontSize: 14, color: COLORS.ink, opacity: 0.7, textAlign: "center", maxWidth: 520, margin: "0 auto 28px" }}>
        Real guides for the places we actually know well — more added as they're properly researched, not just
        listed for the sake of it.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {active.map(([key, d]) => (
          <PoppyCard key={key} href={`/indonesia/guide/${key}`} eyebrow={d.region} title={d.name} blurb={d.tagline} width={380} />
        ))}
      </div>
    </div>
  );
}
