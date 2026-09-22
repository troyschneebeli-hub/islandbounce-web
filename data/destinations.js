// Destination registry. Region architecture: each region gets its own
// subdirectory (islandbouncetravel.com/indonesia/, later /philippines/, /laos/).
// This file currently holds Indonesia's one combined destination; the
// registry pattern (and the "laos" entry, kept but inactive) is what
// later regions will follow. When a region is ready, its destinations
// move into a data/destinations-<region>.js file and get added to the
// region nav.

// Only Bali & Gili is live for now — Laos data stays below, ready to
// switch back on later, it's just not shown in nav/homepage yet.
export const ACTIVE_DESTINATIONS = ["bali-gili-lombok"];

export const DESTINATIONS = {
  "bali-gili-lombok": {
    region: "INDONESIA · BALI, GILI ISLANDS, NUSA & LOMBOK",
    name: "Bali, Gili Islands, Nusa & Lombok",
    tagline:
      "Every short boat crossing in the region — Bali to the Gilis, Nusa Penida, Nusa Lembongan, and Lombok — compared side by side.",
    eventideSlug: "gili-nusa-penida-charter",
    transport: [
      { mode: "Fast boat", from: "Sanur", to: "Gili Trawangan", duration: "~1h 45m", price: "$20–35", note: "Most departures, most competition between operators." },
      { mode: "Fast boat", from: "Padang Bai", to: "Gili Trawangan", duration: "~1h 30m", price: "$18–30", note: "Slightly shorter crossing, fewer daily departures." },
      { mode: "Fast boat + transfer", from: "Serangan", to: "Gili Trawangan", duration: "~1h 15m", price: "$25–40", note: "Newer harbor, smoother exit from south Bali traffic." },
    ],
    activities: [
      { title: "Snorkeling & turtle spotting", platform: "Klook", price: "from $12", blurb: "Shallow reef just off the main strip — genuinely good visibility most of the year, no boat needed for the closest spots." },
      { title: "Learn to dive (PADI)", platform: "Viator", price: "from $85", blurb: "Gili Trawangan is one of the cheapest places in the world to get open-water certified." },
      { title: "Sunset horseback ride", platform: "GetYourGuide", price: "from $28", blurb: "No motor vehicles on the island — this is a genuinely unusual, low-key way to see the far side at golden hour." },
    ],
  },
  "vang-vieng": {
    region: "LAOS · MEKONG VALLEY",
    name: "Vang Vieng",
    tagline: "The karst valley between Vientiane and Luang Prabang — once party-famous, now a quieter mix of tubing and caves.",
    eventideSlug: null,
    transport: [
      { mode: "Laos–China train", from: "Vientiane", to: "Vang Vieng", duration: "~1h", price: "$5–12", note: "Fastest option; book a few days ahead in high season.", direct: null },
      {
        mode: "Minivan", from: "Vientiane", to: "Vang Vieng", duration: "~3.5–4h", price: "$8–15",
        note: "Frequent departures, door-to-door pickup common.",
        // Example of a converted operator — once a direct deal is signed
        // (see the disintermediation process in the business plan), adding
        // this one field is the only change needed to switch the CTA from
        // the 12Go affiliate link to a direct booking channel.
        direct: { operator: "Green Discovery", url: "https://wa.me/8562099999999?text=Booking%20via%20IslandBounce" },
      },
      { mode: "Train (continuing north)", from: "Vang Vieng", to: "Luang Prabang", duration: "~1h", price: "$5–15", note: "Same line as the Vientiane leg.", direct: null },
    ],
    activities: [
      { title: "Nam Song River tubing", platform: "Klook", price: "from $8", blurb: "Calmer than its old party reputation — most operators run it as a scenic float now." },
      { title: "Blue Lagoon & cave tour", platform: "GetYourGuide", price: "from $18", blurb: "Half-day combining a swim at the lagoon with a guided cave exploration." },
      { title: "Sunrise hot air balloon", platform: "Viator", price: "from $95", blurb: "Books out early in high season — worth reserving a few days ahead." },
    ],
  },
};

// Placeholder — real cross-domain link once eventide.com is live.
export const EVENTIDE_URL = process.env.NEXT_PUBLIC_EVENTIDE_URL || "https://eventide.com";
