// "Where to stay" for each place the boats go, shown on its port page and on route pages that end there.
// `tips` is plain area advice (no named hotels until we've stayed there ourselves). `search` is what the Booking.com
// search link looks for. `links` takes ready-made links from each program's own link tool once we're approved
// (Agoda, Hostelworld): paste the full link, including our ID, and the button appears. `picks` (optional) are places
// we've stayed and recommend: { name, kind: "Hostel" | "Hotel" | "Guesthouse", note, url }.
export const STAYS = {
  "Gili Trawangan": {
    search: "Gili Trawangan, Indonesia",
    tips: [
      "The east side near the harbour has the bars, the night market and most of the hostels. Light sleepers do better on the quieter north or west (sunset) side.",
      "There are no cars or motorbikes: you walk, cycle or take a horse cart from the harbour, so check how far your place is before you book.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
  "Gili Air": {
    search: "Gili Air, Indonesia",
    tips: [
      "Quieter than Gili Trawangan, with cafes and a few bars. Most places are near the harbour on the east side, with quieter spots around the rest of the island.",
      "No cars or motorbikes here either, and the island is small enough to walk or cycle around.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
  "Gili Meno": {
    search: "Gili Meno, Indonesia",
    tips: [
      "The smallest and quietest Gili, with fewer places to stay, eat and party. Good for a few calm days; book ahead in peak season because there's less choice.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
  "Nusa Penida": {
    search: "Nusa Penida, Indonesia",
    tips: [
      "Penida is bigger than it looks and the roads are slow. Stay near the harbour your boat uses, or near the sights you'll spend most days at, rather than crossing the island twice a day.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
  "Nusa Lembongan": {
    search: "Nusa Lembongan, Indonesia",
    tips: [
      "Jungut Batu, on the north-west coast where many boats land, has the widest choice of budget places. Mushroom Bay is quieter, and Nusa Ceningan is across the yellow bridge.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
  Sanur: {
    search: "Sanur, Bali, Indonesia",
    tips: [
      "Staying in Sanur the night before puts you a short ride from the harbour, so an early boat doesn't mean a pre-dawn drive across Bali.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
  "Padang Bai": {
    search: "Padang Bai, Bali, Indonesia",
    tips: [
      "A small village right by the harbour. A night in a guesthouse here saves the 1 to 1.5 hour drive from south Bali before an early boat to the Gilis or Lombok.",
    ],
    links: { agoda: null, hostelworld: null },
    picks: [],
  },
};

// Places to stay for a route page: its destination ports (islands only, not the Bali ports), most specific first.
export function staysForRoute(route) {
  return route.toPorts.filter((p) => STAYS[p] && !["Sanur", "Padang Bai"].includes(p)).slice(0, 3);
}
