import { joinList, plural } from "@/lib/timetable";

// Definitions + copy for the SEO route pages (/indonesia/routes/[slug]).
// Anything numeric (departure counts, times, durations, operator names) is
// computed from data/timetables.js at render time via `ctx`, so it can never
// disagree with the timetable shown on the same page. Static copy below is
// limited to things that are stable and true; prices are deliberately absent
// until fares have actually been verified.

export const BALI_MAINLAND = ["Padang Bai", "Benoa / Nusa Dua", "Serangan", "Sanur", "Kusamba"];
const LOMBOK_PORTS = ["Bangsal (Lombok)"];

const CANCEL_FAQ = (from, to) => ({
  q: `Can the boat from ${from} to ${to} be cancelled?`,
  a:
    "Yes. Rough seas are the main reason fast boats are delayed or cancelled, and it happens more often in the wetter months (roughly November to March). " +
    "The sea-conditions estimate on this page is a guide, not a guarantee: the operator and the port authority make the actual call on the day. " +
    "Leave a buffer before any onward flight rather than booking one for the same day.",
});

const BOOK_FAQ = {
  q: "Do I need to book in advance?",
  a:
    "In peak season, popular morning departures can sell out a day or two ahead. Off-peak you can often book closer to the day. " +
    "Booking ahead is the safer choice if you have a flight or a connection to make.",
};

const CHECKIN_TEXT =
  "Eka Jaya asks passengers to check in an hour before departure. For other operators, check the time on your ticket.";

const PLANNER_CTA = (to) => ({
  href: to ? `/indonesia?to=${encodeURIComponent(to)}` : "/indonesia",
  label: "Open the Trip Planner →",
});

// Names of operators for the intro and FAQs: the first few, then "and N more operators".
function joinOps(list, max = 5) {
  if (list.length <= max) return joinList(list);
  return `${list.slice(0, max).join(", ")} and ${list.length - max} more operators`;
}

export const ROUTE_PAGES = {
  "gili-trawangan-to-bali": {
    slug: "gili-trawangan-to-bali",
    region: "Gili Islands",
    name: "Gili Trawangan to Bali",
    h1: "Gili Trawangan to Bali by fast boat",
    metaTitle: "Gili Trawangan to Bali Fast Boat: Times & Sea Conditions",
    metaDescription:
      "Fast boat times from Gili Trawangan to Bali's Padang Bai and Benoa / Nusa Dua, with live sea conditions.",
    blurb: "Departures back to Bali from Gili Trawangan, with crossing times and live sea conditions.",
    fromLabel: "Gili Trawangan",
    toLabel: "Bali",
    fromPorts: ["Gili Trawangan"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Gili Trawangan", "Padang Bai"],
    bookFrom: "Gili Trawangan",
    bookTo: "Bali",
    related: ["bali-to-gili-islands", "gili-air-to-bali", "bali-to-lombok-ferry"],
    lead: (c) =>
      `Fast boats run from Gili Trawangan to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.`,
    sections: [
      {
        heading: "Which Bali port should you choose?",
        paragraphs: [
          "Padang Bai is on Bali's east coast and usually has the shortest crossing. It's the natural choice if you're heading to the east coast or Ubud, but it's a longer drive from the airport and south Bali.",
          "Benoa / Nusa Dua is in south Bali, much closer to the airport, Nusa Dua and the south coast. The crossings we've seen from Gili Trawangan to there are longer.",
          "Not sure? Put your Bali hotel or flight details into the Trip Planner and compare real driving times to each port against the boat time.",
        ],
        cta: PLANNER_CTA("Gili Trawangan"),
      },
      {
        heading: "Getting to the harbour and boarding",
        paragraphs: [
          "Gili Trawangan has no cars or motorbikes, so you'll reach the harbour on foot, by bicycle or by horse cart (cidomo). Allow extra time if you have luggage.",
          CHECKIN_TEXT,
        ],
      },
    ],
    faqs: (c) => [
      {
        q: "Is there a fast boat from Bali to Lombok?",
        a: `Yes. Fast boats run from Bali to Bangsal on Lombok. We list ${plural(c.count, "departure")} so far.`,
      },
      {
        q: "How long does the Bali to Lombok fast boat take?",
        a: `Crossing times are ${c.durations}.`,
      },
      {
        q: "Which Lombok port do the boats go to?",
        a: "Bangsal, the main port for the Gili Islands and north-west Lombok.",
      },
      CANCEL_FAQ("Bali", "Lombok"),
    ],
  },

  "gili-air-to-bali": {
    slug: "gili-air-to-bali",
    region: "Gili Islands",
    name: "Gili Air to Bali",
    h1: "Gili Air to Bali by fast boat",
    metaTitle: "Gili Air to Bali Fast Boat: Times & Sea Conditions",
    metaDescription:
      "Fast boat times from Gili Air to Bali's Padang Bai and Benoa / Nusa Dua, with live sea conditions.",
    blurb: "Departures from Gili Air back to Bali, with crossing times and live sea conditions.",
    fromLabel: "Gili Air",
    toLabel: "Bali",
    fromPorts: ["Gili Air"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Gili Air", "Padang Bai"],
    bookFrom: "Gili Air",
    bookTo: "Bali",
    related: ["gili-trawangan-to-bali", "bali-to-gili-islands", "bali-to-lombok-ferry"],
    lead: (c) =>
      `Fast boats run from Gili Air to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.`,
    sections: [
      {
        heading: "Which Bali port should you choose?",
        paragraphs: [
          "Padang Bai is on Bali's east coast and usually has the shortest crossing. Benoa / Nusa Dua is in south Bali, closer to the airport and the south coast, but the crossings we've seen there are longer.",
          "Put your Bali hotel or flight details into the Trip Planner to compare real driving times to each port against the boat time.",
        ],
        cta: PLANNER_CTA("Gili Air"),
      },
      {
        heading: "If there's no boat from Gili Air at your time",
        paragraphs: [
          "Some boats to Bali leave from Gili Trawangan or from Bangsal on Lombok instead. Gili Air is only a short hop from both, so it can be worth checking those departures too.",
        ],
        cta: { href: "/indonesia/routes/gili-trawangan-to-bali", label: "See Gili Trawangan to Bali →" },
      },
      {
        heading: "Getting to the harbour and boarding",
        paragraphs: ["Like the other Gilis, Gili Air has no cars or motorbikes, so allow extra time to reach the harbour with luggage.", CHECKIN_TEXT],
      },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Gili Air to Bali?",
        a: `Crossing times are ${c.durations}. Times differ by port and by departure, so check the Duration column above and confirm with the operator.`,
      },
      {
        q: "What time is the first boat from Gili Air to Bali?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change, so check with the operator before planning around one boat.`,
      },
      {
        q: "Do I have to go to Gili Trawangan first?",
        a: "Not necessarily: departures straight from Gili Air are listed above. Other boats to Bali leave from Gili Trawangan, so if nothing suits your day, check that page too.",
      },
      CANCEL_FAQ("Gili Air", "Bali"),
      BOOK_FAQ,
    ],
  },
};

export const ROUTE_SLUGS = Object.keys(ROUTE_PAGES);
export const REGION_ORDER = ["Gili Islands", "Lombok"];
