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
        q: "How long is the fast boat from Gili Trawangan to Bali?",
        a: `Crossing times are ${c.durations}. Times differ by port and by departure, so check the Duration column above and confirm with the operator.`,
      },
      {
        q: "What time is the first boat from Gili Trawangan to Bali?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change, so check with the operator before planning around one boat.`,
      },
      {
        q: "Which operators run boats from Gili Trawangan to Bali?",
        a: `We list ${joinOps(c.operators)}. We add more operators as we get their timetables.`,
      },
      CANCEL_FAQ("Gili Trawangan", "Bali"),
      BOOK_FAQ,
    ],
  },

  "bali-to-gili-islands": {
    slug: "bali-to-gili-islands",
    region: "Gili Islands",
    name: "Bali to the Gili Islands",
    h1: "Bali to the Gili Islands by fast boat",
    metaTitle: "Bali to Gili Islands Fast Boat: Times, Operators & Sea Conditions",
    metaDescription:
      "Compare fast boats from Bali to Gili Trawangan, Gili Air and Gili Meno from Padang Bai, Sanur, Benoa and Serangan, with times, operators and live sea conditions.",
    blurb: "Every fast boat from Bali to the Gilis in one table, with operators, crossing times and live sea conditions.",
    fromLabel: "Bali",
    toLabel: "Gili Islands",
    fromPorts: BALI_MAINLAND,
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Padang Bai", "Serangan", "Gili Trawangan"],
    bookFrom: "Padang Bai",
    bookTo: "Gili Trawangan",
    related: ["gili-trawangan-to-bali", "gili-air-to-bali", "bali-to-lombok-ferry"],
    lead: (c) =>
      `Fast boats run from ${joinList(c.fromNames)} to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Gili Trawangan is the main stop and has the most boats.`,
    sections: [
      {
        heading: "Which Gili island?",
        paragraphs: [
          "Gili Trawangan is the biggest and busiest of the three, with the most nightlife and the most boat options. Gili Air is quieter but still well connected. Gili Meno is the smallest and quietest, with fewer direct services.",
          "None of the Gilis has cars or motorbikes, so once you land you'll get around on foot, by bicycle or by horse cart (cidomo).",
        ],
      },
      {
        heading: "Choosing your departure port",
        paragraphs: [
          "Padang Bai, on Bali's east coast, usually has the shortest crossing, but it's a longer drive from the airport and south Bali.",
          "Serangan and Benoa / Nusa Dua are in south Bali, closer to the airport and Sanur. Crossings from there are longer, and some boats call at other ports or islands on the way.",
          "Put your hotel into the Trip Planner to see real driving times to every port and weigh them against the boat time.",
        ],
        cta: PLANNER_CTA("Gili Trawangan"),
      },
      {
        heading: "Stops on the way",
        paragraphs: [
          "Some fast boats run a circuit, calling at more than one port or island. Where we know a boat stops elsewhere, it's shown in the Notes column, and those stops add to your crossing time.",
        ],
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long does the fast boat from Bali to the Gili Islands take?",
        a: `Crossing times are: ${c.durations}. Boats that call at other ports on the way take longer, so compare the Duration and Notes columns.`,
      },
      {
        q: "Which operators go from Bali to the Gili Islands?",
        a: `We list ${joinOps(c.operators)}. We add more operators as we get their timetables.`,
      },
      {
        q: "Which Bali port is best for the Gilis?",
        a: "Padang Bai usually has the shortest crossing, while Serangan and Benoa / Nusa Dua are closer to the airport and south Bali. The right one depends on where you're staying: the Trip Planner shows real driving times to each.",
      },
      {
        q: "Are there direct boats, or do they stop on the way?",
        a: "Both exist. Some boats run a circuit and call at other ports or islands on the way to the Gilis. Where we know about those stops, they're listed in the Notes column above.",
      },
      CANCEL_FAQ("Bali", "the Gili Islands"),
      BOOK_FAQ,
    ],
  },

  "bali-to-lombok-ferry": {
    slug: "bali-to-lombok-ferry",
    region: "Lombok",
    name: "Bali to Lombok",
    h1: "Bali to Lombok by fast boat",
    metaTitle: "Bali to Lombok Fast Boat to Bangsal: Options and Operators",
    metaDescription:
      "Fast boats from Bali to Bangsal on Lombok, the gateway to the Gili Islands. Compare operators and book your crossing.",
    blurb: "Fast boats from Bali to Bangsal on Lombok, with operators compared.",
    fromLabel: "Bali",
    toLabel: "Lombok",
    fromPorts: BALI_MAINLAND,
    toPorts: LOMBOK_PORTS,
    conditionPorts: ["Padang Bai", "Bangsal (Lombok)"],
    bookFrom: "Bali",
    bookTo: "Lombok",
    related: ["bali-to-gili-islands", "gili-trawangan-to-bali", "gili-air-to-bali"],
    lead: (c) =>
      `Fast boats cross from Bali to Bangsal, the Lombok port for the Gili Islands. ` +
      `We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, leaving between ${c.earliest} and ${c.latest}.`,
    sections: [
      {
        heading: "Crossing to Bangsal",
        paragraphs: [
          "Fast boats run from Bali's harbours to Bangsal, the main gateway to the Gili Islands and north-west Lombok. Most people leave from Padang Bai or Sanur, depending on where they're staying.",
          "From Bangsal you can carry on by road or by short boat to the Gilis, and the timetable above lists every departure we compare.",
        ],
      },
      {
        heading: "Flying instead?",
        paragraphs: ["There are also short flights between Bali and Lombok. This page covers the crossing by sea."],
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

  "nusa-penida-to-gili-islands": {
    slug: "nusa-penida-to-gili-islands",
    region: "Nusa Islands",
    name: "Nusa Penida to the Gili Islands",
    h1: "Nusa Penida to the Gili Islands by fast boat",
    metaTitle: "Nusa Penida to Gili Islands Fast Boat: Times & Operators",
    metaDescription:
      "Fast boat times from Nusa Penida to Gili Trawangan, Gili Air and Gili Meno, with operators and live sea conditions.",
    blurb: "Fast boats from Nusa Penida to the Gilis, with operators, crossing times and sea conditions.",
    fromLabel: "Nusa Penida",
    toLabel: "Gili Islands",
    fromPorts: ["Nusa Penida"],
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Nusa Penida", "Gili Trawangan"],
    bookFrom: "Nusa Penida",
    bookTo: "Gili Trawangan",
    related: ["nusa-lembongan-to-gili-islands", "bali-to-gili-islands", "gili-trawangan-to-bali"],
    lead: (c) =>
      `Fast boats run from Nusa Penida to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.`,
    sections: [
      {
        heading: "Going straight from Nusa to the Gilis",
        paragraphs: [
          "You don't have to go back to Bali first. A small number of fast boats run from Nusa Penida to the Gili Islands, so you can carry on from the cliffs to the beaches without a night on the mainland.",
          "There are only a few departures a day, mostly in the morning, so check the times before you plan your day on Nusa Penida around one of them.",
        ],
      },
      {
        heading: "Why the crossing takes a while",
        paragraphs: [
          "Some boats call at more than one Gili on the way, and those stops add to the crossing. Where we know a boat stops elsewhere, it's shown in the Notes column.",
        ],
      },
      {
        heading: "Getting to the harbour",
        paragraphs: [
          "Nusa Penida is large and the roads are rough, so allow plenty of time to reach the harbour from your accommodation. Most people go by scooter or a hired driver.",
          CHECKIN_TEXT,
        ],
        cta: PLANNER_CTA("Gili Trawangan"),
      },
    ],
    faqs: (c) => [
      {
        q: "Can I go from Nusa Penida to the Gili Islands without going back to Bali?",
        a: `Yes. We list ${plural(c.count, "direct departure")} from Nusa Penida to the Gilis, with ${joinOps(c.operators)}.`,
      },
      {
        q: "How long is the fast boat from Nusa Penida to the Gili Islands?",
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Duration and Notes columns.`,
      },
      {
        q: "What time is the first boat from Nusa Penida to the Gilis?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change, so check with the operator before planning around one boat.`,
      },
      CANCEL_FAQ("Nusa Penida", "the Gili Islands"),
      BOOK_FAQ,
    ],
  },

  "nusa-lembongan-to-gili-islands": {
    slug: "nusa-lembongan-to-gili-islands",
    region: "Nusa Islands",
    name: "Nusa Lembongan to the Gili Islands",
    h1: "Nusa Lembongan to the Gili Islands by fast boat",
    metaTitle: "Nusa Lembongan to Gili Islands Fast Boat: Times & Operators",
    metaDescription:
      "Fast boat times from Nusa Lembongan to Gili Trawangan, Gili Air and Gili Meno, with operators and live sea conditions.",
    blurb: "Fast boats from Nusa Lembongan to the Gilis, with operators, crossing times and sea conditions.",
    fromLabel: "Nusa Lembongan",
    toLabel: "Gili Islands",
    fromPorts: ["Nusa Lembongan"],
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Nusa Lembongan", "Gili Trawangan"],
    bookFrom: "Nusa Lembongan",
    bookTo: "Gili Trawangan",
    related: ["nusa-penida-to-gili-islands", "bali-to-gili-islands", "gili-trawangan-to-bali"],
    lead: (c) =>
      `Fast boats run from Nusa Lembongan to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.`,
    sections: [
      {
        heading: "Going straight from Lembongan to the Gilis",
        paragraphs: [
          "You can cross from Nusa Lembongan to the Gili Islands without returning to Bali. Only a few boats a day make the crossing, mostly in the morning, so it's worth fixing the time before you plan the rest of your stay.",
        ],
      },
      {
        heading: "Which Gili?",
        paragraphs: [
          "Gili Trawangan is the liveliest and has the most boats, Gili Air is the calm middle ground, and Gili Meno is the quietest. The Gilis have no cars or motorbikes, so you'll get around on foot, by bicycle or by horse cart.",
        ],
      },
      {
        heading: "Getting to the harbour and boarding",
        paragraphs: [
          "Lembongan is small, so the harbour is usually a short ride from where you're staying. Allow extra time with luggage.",
          CHECKIN_TEXT,
        ],
        cta: PLANNER_CTA("Gili Trawangan"),
      },
    ],
    faqs: (c) => [
      {
        q: "Is there a boat from Nusa Lembongan to the Gili Islands?",
        a: `Yes. We list ${plural(c.count, "departure")} from Nusa Lembongan to the Gilis, with ${joinOps(c.operators)}.`,
      },
      {
        q: "How long is the fast boat from Nusa Lembongan to the Gili Islands?",
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Duration and Notes columns.`,
      },
      {
        q: "What time is the first boat from Nusa Lembongan to the Gilis?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change, so check with the operator before planning around one boat.`,
      },
      CANCEL_FAQ("Nusa Lembongan", "the Gili Islands"),
      BOOK_FAQ,
    ],
  },
};

export const ROUTE_SLUGS = Object.keys(ROUTE_PAGES);
export const REGION_ORDER = ["Gili Islands", "Nusa Islands", "Lombok"];
