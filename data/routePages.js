import { joinList, plural } from "@/lib/timetable";

// Definitions + copy for the SEO route pages (/indonesia/routes/[slug]).
// Anything numeric (departure counts, times, durations, operator names) is
// computed from data/timetables.js at render time via `ctx`, so it can never
// disagree with the timetable shown on the same page. Static copy below is
// limited to things that are stable and true; prices are deliberately absent
// until fares have actually been verified.

export const BALI_MAINLAND = ["Padang Bai", "Benoa / Nusa Dua", "Serangan", "Sanur", "Kusamba"];
const LOMBOK_PORTS = ["Bangsal (Lombok)", "Senggigi (Lombok)", "Lembar (Lombok)"];

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
    metaTitle: "Bali to Gili Islands & Gili Trawangan: Fast Boat Times",
    metaDescription:
      "Fast boats from Padang Bai, Serangan and Benoa / Nusa Dua to Gili Trawangan, Air and Meno: times and operators.",
    blurb: "Every departure from Bali to Gili Trawangan, Gili Air and Gili Meno, by port and operator.",
    fromLabel: "Bali",
    toLabel: "the Gili Islands",
    fromPorts: BALI_MAINLAND,
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Padang Bai", "Serangan", "Gili Trawangan"],
    bookFrom: "Bali",
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
      {
        heading: "Checking in",
        paragraphs: [CHECKIN_TEXT],
      },
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
    h1: "Bali to Lombok by ferry and fast boat",
    metaTitle: "Bali to Lombok Ferry & Fast Boat: Times and Options",
    metaDescription:
      "Two ways to cross from Bali to Lombok: the public ferry to Lembar or fast boats to Bangsal and Senggigi, with departure times.",
    blurb: "The public ferry to Lembar versus fast boats to Bangsal and Senggigi, with departures and operators.",
    fromLabel: "Bali",
    toLabel: "Lombok",
    fromPorts: BALI_MAINLAND,
    toPorts: LOMBOK_PORTS,
    conditionPorts: ["Padang Bai", "Bangsal (Lombok)", "Senggigi (Lombok)"],
    bookFrom: "Bali",
    bookTo: "Lombok",
    related: ["bali-to-gili-islands", "gili-trawangan-to-bali", "gili-air-to-bali"],
    lead: (c) =>
      `There are two ways to cross from Bali to Lombok by sea: the slow public ferry from Padang Bai to Lembar, and fast boats to ${joinList(c.toNames)}. ` +
      `We list ${plural(c.count, "fast boat departure")} with ${joinOps(c.operators)}, leaving between ${c.earliest} and ${c.latest}.`,
    sections: [
      {
        heading: "Two ways to cross",
        paragraphs: [
          "The public ferry runs between Padang Bai and Lembar. It's the slow option, but it's cheap, runs around the clock at roughly 60 to 90 minute intervals, and is the weather-reliable backup when fast boats are cancelled.",
          "Fast boats are quicker and cost more. They serve Bangsal (the gateway to the Gili Islands) and Senggigi on Lombok's west coast, and are listed in the timetable above.",
        ],
      },
      {
        heading: "Which Lombok port?",
        paragraphs: [
          "Bangsal is the port for the Gili Islands and north-west Lombok, and Senggigi is on the west coast. Lembar, where the public ferry docks, is in the south-west of the island.",
        ],
      },
      {
        heading: "Flying instead?",
        paragraphs: ["There are also short flights between Bali and Lombok. This page covers the crossing by sea."],
      },
    ],
    faqs: (c) => [
      {
        q: "Is there a ferry from Bali to Lombok?",
        a: `Yes, two kinds. A slow public ferry runs between Padang Bai and Lembar around the clock, and fast boats run to Bangsal and Senggigi. We list ${plural(c.count, "fast boat departure")} so far.`,
      },
      {
        q: "How long does the Bali to Lombok fast boat take?",
        a: `Crossing times are ${c.durations}. The public ferry is much slower, so plan on several hours.`,
      },
      {
        q: "Is the public ferry cheaper than the fast boat?",
        a: "The public ferry is generally the cheaper option, while fast boats cost more but save a lot of time. Fares change by operator and season, so confirm the price when you book.",
      },
      {
        q: "Which Lombok port should I go to?",
        a: "Choose the port nearest where you're staying: Bangsal for the Gili Islands and the north-west, Senggigi for the west coast, Lembar for the south-west.",
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
