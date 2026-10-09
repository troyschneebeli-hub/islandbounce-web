export const BALI_PORTS = [
  { name: "Sanur", region: "bali", address: "Sanur Harbour, Sanur, Denpasar, Bali, Indonesia", lat: -8.6817, lng: 115.2649, blurb: "Central and easy to reach — around 25 minutes from Kuta, 40–50 minutes from Canggu, and 45 minutes to an hour from Ubud. Usually the most convenient port if you're staying anywhere in South or Central Bali.", connects: "Nusa Penida, Nusa Lembongan, Gili Trawangan, Gili Air, Bangsal", frequency: "Up to 13 sailings/day to Gili Trawangan alone" },
  { name: "Padang Bai", region: "bali", address: "Padang Bai Harbour, Padang Bai, Karangasem, Bali, Indonesia", lat: -8.5280, lng: 115.5090, blurb: "The trade-off port: the drive is real — about 45 minutes from Kuta or Denpasar, closer to 1.5–2 hours from Canggu or Uluwatu — but the boat crossing itself is short, and this port has the most operators and departures of anywhere on this list.", connects: "Gili Trawangan, Gili Air, Gili Meno, Bangsal", frequency: "~10/day to Gili Trawangan" },
  { name: "Serangan", region: "bali", address: "Serangan Harbour, Serangan, Denpasar, Bali, Indonesia", lat: -8.7325, lng: 115.2356, blurb: "Similar drive time to Sanur from Kuta or Denpasar (25–35 minutes), but usually a smoother run with less South Bali traffic to fight through on the way in.", connects: "Gili Trawangan, Gili Air, Gili Meno, Bangsal", frequency: "2–4 sailings/day depending on route and season" },
  // NOTE: Kusamba and Benoa are close estimates (nearby village/harbor
  // centers), not verified against an exact pier location — worth
  // confirming against Google Maps directly before treating as precise.
  { name: "Kusamba", region: "bali", address: "Kusamba Harbour, Kusamba, Klungkung, Bali, Indonesia", lat: -8.5765, lng: 115.4640, blurb: "East Bali, near Padang Bai — around 40–45 minutes from Denpasar or Ubud, more like an hour to 90 minutes from Kuta, Canggu, or Uluwatu. The trade-off for the fastest, cheapest hop to Nusa Penida.", connects: "Nusa Penida (Sampalan & Buyuk harbors)", frequency: "6+ daily departures, just 15 minutes crossing" },
  { name: "Benoa / Nusa Dua", region: "bali", address: "Benoa Harbour, Benoa, Denpasar, Bali, Indonesia", lat: -8.7489, lng: 115.2126, blurb: "The closest port if you're based in Uluwatu, Jimbaran, or Nusa Dua — as little as 20–30 minutes away. Kuta and Seminyak aren't far either (25–30 minutes), but it's a longer haul from Canggu or Ubud (45 minutes to over an hour).", connects: "Gili Islands", frequency: "1–2 sailings/day" },
];

// NOTE: approximate coordinates from general knowledge, not independently
// verified against exact harbor points — good enough for map markers,
// worth a spot-check against Google Maps directly before treating as precise.
export const ISLAND_PORTS = [
  { name: "Gili Trawangan", region: "gili-lombok", lat: -8.3496, lng: 116.0463, blurb: "The most-searched Gili — biggest island, most nightlife, most boat options.", connects: "Sanur, Padang Bai, Serangan, Bangsal", frequency: "Most-served Gili port by far" },
  { name: "Gili Air", region: "gili-lombok", lat: -8.3563, lng: 116.0836, blurb: "Quieter than Trawangan, still well connected.", connects: "Sanur, Padang Bai, Serangan, Bangsal", frequency: "Similar frequency to Gili Trawangan" },
  { name: "Gili Meno", region: "gili-lombok", lat: -8.3453, lng: 116.0667, blurb: "The smallest, quietest Gili — fewer direct services.", connects: "Padang Bai, Serangan", frequency: "Fewer direct sailings than Trawangan/Air" },
  { name: "Nusa Penida", region: "nusa", lat: -8.7278, lng: 115.5444, blurb: "Multiple harbors (Toyapakeh, Buyuk, Sampalan) depending on which Bali port you leave from.", connects: "Sanur, Kusamba, Padang Bai", frequency: "Very frequent from Kusamba; 2x/day from Padang Bai" },
  { name: "Nusa Lembongan", region: "nusa", lat: -8.6784, lng: 115.4425, blurb: "The other Nusa island — short hop from Sanur, short hop to Penida.", connects: "Sanur, Nusa Penida", frequency: "Multiple daily departures" },
  { name: "Bangsal (Lombok)", region: "gili-lombok", lat: -8.3489, lng: 116.0913, blurb: "The main Lombok gateway to the Gilis — most fast boats land here.", connects: "Sanur, Padang Bai, Serangan, Gili Islands", frequency: "Most fast boats run once daily, ~8–9:30am" },
];
