import Link from "next/link";
import { COLORS } from "@/lib/theme";

export const metadata = {
  title: "Places We Cover",
  description: "Gili Trawangan, Gili Air, Gili Meno, Nusa Penida, Nusa Lembongan and Lombok — what each place is actually like.",
};

// Genuine info about each place — not transport, not paid activities, just
// what the island is actually like and who it suits. Route pages already
// cover how to get there; this page is deliberately just about the place.
const PLACES = [
  {
    name: "Gili Trawangan",
    tagline: "The lively one",
    blurb:
      "The biggest and busiest of the three Gilis — real nightlife, a proper strip of restaurants and dive shops, sunset bars right on the sand. No cars or motorbikes anywhere on the island; everyone gets around on foot, by bicycle, or by horse cart (cidomo). Best fit if you want at least some energy in the evenings, not just quiet.",
  },
  {
    name: "Gili Air",
    tagline: "The middle ground",
    blurb:
      "Sits between Trawangan's energy and Meno's silence — still a real choice of cafes and places to eat, but noticeably calmer once the sun goes down. A common pick for couples and families who want some atmosphere without it being the main event.",
  },
  {
    name: "Gili Meno",
    tagline: "The quiet one",
    blurb:
      "The smallest and least developed of the three, often called the honeymoon island. A turtle sanctuary, a salt lake, and not much else by design — genuinely few places to eat compared to the other two. The right choice only if disconnecting is actually the point.",
  },
  {
    name: "Nusa Penida",
    tagline: "Dramatic clifftop scenery",
    blurb:
      "Bigger and rougher than the Gilis, southeast of Bali — this is where the famous clifftop viewpoints are (Kelingking, Angel's Billabong, Broken Beach), plus manta ray snorkeling on the right season. Roads are rough; most people get around by scooter or a hired driver, not on foot. More a day of scenery and photos than beach lounging.",
  },
  {
    name: "Nusa Lembongan",
    tagline: "Calmer, closer to Bali",
    blurb:
      "Nusa Penida's smaller, quieter neighbor, and the shorter crossing from Bali. Known for surf breaks, mangrove tours, and the Devil's Tears viewpoint — a noticeably more laid-back, less-touristy feel than Bali's main areas, without going as remote as the Gilis.",
  },
  {
    name: "Lombok",
    tagline: "Bali's bigger, quieter neighbor",
    blurb:
      "The main gateway to the Gilis (most boats land at Bangsal), but genuinely worth time on its own — Mount Rinjani for trekkers, beaches with a fraction of Bali's crowds, and Senggigi as the main tourist strip on the west coast if you want a base with some infrastructure.",
  },
];

export default function DestinationsPage() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 30, color: COLORS.sea, marginBottom: 6, textAlign: "center" }}>
        Places We Cover
      </h1>
      <p style={{ fontSize: 14, color: COLORS.ink, opacity: 0.7, textAlign: "center", maxWidth: 560, margin: "0 auto 32px" }}>
        What each place is actually like — not schedules or bookings, just a real sense of where you're headed.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {PLACES.map((p) => (
          <div key={p.name} style={{ background: "white", border: `1px solid ${COLORS.foamLine}`, borderRadius: 14, padding: 22 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: COLORS.brass, letterSpacing: 1, marginBottom: 4 }}>
              {p.tagline.toUpperCase()}
            </div>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 20, color: COLORS.sea, marginBottom: 8 }}>
              {p.name}
            </h2>
            <p style={{ fontSize: 13.5, color: COLORS.ink, opacity: 0.85, lineHeight: 1.65 }}>{p.blurb}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: COLORS.ink, opacity: 0.6, textAlign: "center", marginTop: 36 }}>
        Working out how to actually get to any of these?{" "}
        <Link href="/indonesia/routes" style={{ color: COLORS.sea, fontWeight: 700 }}>
          See real routes and times →
        </Link>
      </p>
    </div>
  );
}
