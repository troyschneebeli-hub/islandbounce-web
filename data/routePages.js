import { joinList, plural, rangeText } from "@/lib/timetable";

// Definitions + copy for the SEO route pages (/indonesia/routes/[slug]).
// Anything numeric (departure counts, times, durations, operator names) is
// computed from data/sailings.js (the 12Go listings, the only sailings the site
// shows) at render time via `ctx`, so it can never disagree with the timetable
// shown on the same page. Static copy below is limited to things that are
// stable and true, and doesn't name operators.
// `ourPick` is an optional hand-written editorial note shown under the computed
// "Our pick" block on the route page. Leave it "" to show nothing.

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
  "The times on this page are guides taken from the booking site. Check-in is usually an hour before departure, but go by the time on your ticket.";

const PLANNER_CTA = (to) => ({
  href: to ? `/indonesia?to=${encodeURIComponent(to)}` : "/indonesia",
  label: "Open the Trip Planner →",
});

// Names of operators for the intro and FAQs: the first few, then "and N more operators".
// Three names keep the intro short on a phone; the full list is in the operator chips and the table.
function joinOps(list, max = 3) {
  if (list.length <= max) return joinList(list);
  return `${list.slice(0, max).join(", ")} and ${plural(list.length - max, "more operator")}`;
}

// "12 of them are confirmed ..." sentence for the intro, from the confirmed sailings (data/confirmed.js).
const CONFIRMED_LINE = (c) =>
  c.confirmedCount === 0
    ? ""
    : c.confirmedCount === c.count
      ? ` All of them appeared on the operator's own timetable as well as the booking site in our latest check.`
      : ` ${c.confirmedCount} of them appeared on the operator's own timetable as well as the booking site in our latest check.`;

const CONFIRMED_FAQ = (from, to, c) => ({
  q: `Which ${from} to ${to} boats are confirmed?`,
  a:
    c.confirmedCount
      ? `${plural(c.confirmedCount, "departure")} with ${joinOps(c.confirmedOperators)} also match the operator's own timetable (${c.scanText}). They're tagged Confirmed in the table above. The others are on the booking page every day but aren't on an operator timetable we've checked.`
      : "None yet. Every departure above is on the booking page every day, but we haven't matched it to the operator's own timetable, so confirm with the operator before you plan around one boat.",
});

const LEMBONGAN_LANDING =
  "Many boats to and from Nusa Lembongan land on the beach rather than at a pier, so you may step off into shallow water. Wear sandals and pack so your bag can be carried.";
const PENIDA_HARBOURS =
  "Nusa Penida has several harbours, including Toyapakeh, Buyuk and Sampalan. Which one your boat uses depends on the operator, so check your ticket and plan your onward ride from there.";

export const ROUTE_PAGES = {
  "gili-trawangan-to-bali": {
    slug: "gili-trawangan-to-bali",
    region: "Gili Islands",
    name: "Gili Trawangan to Bali",
    h1: "Gili Trawangan to Bali by fast boat",
    metaTitle: "Gili Trawangan to Bali Fast Boat: Times & Sea Conditions",
    metaDescription:
      "Gili Trawangan to Bali fast boat departures, crossing times and operators, plus live sea conditions. Compare boats side by side and book on 12Go.",
    blurb: "Departures back to Bali from Gili Trawangan, with crossing times and live sea conditions.",
    fromLabel: "Gili Trawangan",
    toLabel: "Bali",
    fromPorts: ["Gili Trawangan"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Gili Trawangan", "Padang Bai"],
    bookFrom: "Gili Trawangan",
    bookTo: "Padang Bai",
    related: ["bali-to-gili-islands", "gili-air-to-bali", "bali-to-lombok-ferry"],
    ourPick: "",
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
        a: `Crossing times are ${c.durations}. Times differ by port and by departure, so check the Arrives column above and confirm with the operator.`,
      },
      {
        q: "What time is the first boat from Gili Trawangan to Bali?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change, so check with the operator before planning around one boat.`,
      },
      {
        q: "Which operators run boats from Gili Trawangan to Bali?",
        a: `We list ${joinOps(c.operators)}. These are the operators listed on the booking site when we last checked.`,
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
    metaTitle: "Bali to Gili Islands Fast Boat: Times & Sea Conditions",
    metaDescription:
      "Bali to Gili Trawangan, Gili Air and Gili Meno fast boat times and operators from Padang Bai, Sanur and Serangan, with sea conditions. Compare and book.",
    blurb: "Every fast boat from Bali to the Gilis in one table, with operators, crossing times and live sea conditions.",
    fromLabel: "Bali",
    toLabel: "Gili Islands",
    fromPorts: BALI_MAINLAND,
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Padang Bai", "Serangan", "Gili Trawangan"],
    bookFrom: "Padang Bai",
    bookTo: "Gili Trawangan",
    related: ["gili-trawangan-to-bali", "gili-air-to-bali", "bali-to-lombok-ferry"],
    ourPick: "",
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
          "Some fast boats run a circuit, calling at more than one port or island. Those stops add to your crossing time, so compare the arrival times in the table.",
        ],
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long does the fast boat from Bali to the Gili Islands take?",
        a: `Crossing times are: ${c.durations}. Boats that call at other ports on the way take longer, so compare the Arrives column.`,
      },
      {
        q: "Which operators go from Bali to the Gili Islands?",
        a: `We list ${joinOps(c.operators)}. These are the operators listed on the booking site when we last checked.`,
      },
      {
        q: "Which Bali port is best for the Gilis?",
        a: "Padang Bai usually has the shortest crossing, while Serangan and Benoa / Nusa Dua are closer to the airport and south Bali. The right one depends on where you're staying: the Trip Planner shows real driving times to each.",
      },
      {
        q: "Are there direct boats, or do they stop on the way?",
        a: "Both exist. Some boats run a circuit and call at other ports or islands on the way to the Gilis. Compare the arrival times above to spot the longer trips.",
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
    metaTitle: "Bali to Lombok Fast Boat to Bangsal: Operators & Times",
    metaDescription:
      "Bali to Lombok by fast boat to Bangsal: which operators run it, crossing times and how to book. Compare options on 12Go before you travel.",
    blurb: "Fast boats from Bali to Bangsal on Lombok, with operators compared.",
    fromLabel: "Bali",
    toLabel: "Lombok",
    fromPorts: BALI_MAINLAND,
    toPorts: LOMBOK_PORTS,
    conditionPorts: ["Padang Bai", "Bangsal (Lombok)"],
    bookFrom: "Padang Bai",
    bookTo: "Bangsal (Lombok)",
    related: ["bali-to-gili-islands", "gili-trawangan-to-bali", "gili-air-to-bali"],
    ourPick: "",
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
      "Gili Air to Bali fast boat departures, crossing times and operators, with sea conditions for the crossing. Compare boats and book on 12Go.",
    blurb: "Departures from Gili Air back to Bali, with crossing times and live sea conditions.",
    fromLabel: "Gili Air",
    toLabel: "Bali",
    fromPorts: ["Gili Air"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Gili Air", "Padang Bai"],
    bookFrom: "Gili Air",
    bookTo: "Padang Bai",
    related: ["gili-trawangan-to-bali", "bali-to-gili-islands", "bali-to-lombok-ferry"],
    ourPick: "",
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
        a: `Crossing times are ${c.durations}. Times differ by port and by departure, so check the Arrives column above and confirm with the operator.`,
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
      "Nusa Penida to Gili Trawangan, Gili Air and Gili Meno by fast boat: departures, crossing times and operators. Compare and book on 12Go.",
    blurb: "Fast boats from Nusa Penida to the Gilis, with operators, crossing times and sea conditions.",
    fromLabel: "Nusa Penida",
    toLabel: "Gili Islands",
    fromPorts: ["Nusa Penida"],
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Nusa Penida", "Gili Trawangan"],
    bookFrom: "Nusa Penida",
    bookTo: "Gili Trawangan",
    related: ["nusa-lembongan-to-gili-islands", "bali-to-gili-islands", "gili-trawangan-to-bali"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Nusa Penida to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.`,
    sections: [
      {
        heading: "Going straight from Nusa to the Gilis",
        paragraphs: [
          "You don't have to go back to Bali first. Fast boats run from Nusa Penida to the Gili Islands, so you can carry on from the cliffs to the beaches without a night on the mainland.",
          "Check the times above before you plan your last day on Nusa Penida around one of them.",
        ],
      },
      {
        heading: "Why the crossing takes a while",
        paragraphs: [
          "Some boats call at more than one Gili on the way, and those stops add to the crossing.",
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
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column.`,
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
      "Nusa Lembongan to Gili Trawangan, Gili Air and Gili Meno by fast boat: departures, crossing times and operators. Compare and book on 12Go.",
    blurb: "Fast boats from Nusa Lembongan to the Gilis, with operators, crossing times and sea conditions.",
    fromLabel: "Nusa Lembongan",
    toLabel: "Gili Islands",
    fromPorts: ["Nusa Lembongan"],
    toPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    conditionPorts: ["Nusa Lembongan", "Gili Trawangan"],
    bookFrom: "Nusa Lembongan",
    bookTo: "Gili Trawangan",
    related: ["nusa-penida-to-gili-islands", "bali-to-gili-islands", "gili-trawangan-to-bali"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Nusa Lembongan to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.`,
    sections: [
      {
        heading: "Going straight from Lembongan to the Gilis",
        paragraphs: [
          "You can cross from Nusa Lembongan to the Gili Islands without returning to Bali. It's worth fixing your departure time before you plan the rest of your stay.",
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
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column.`,
      },
      {
        q: "What time is the first boat from Nusa Lembongan to the Gilis?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change, so check with the operator before planning around one boat.`,
      },
      CANCEL_FAQ("Nusa Lembongan", "the Gili Islands"),
      BOOK_FAQ,
    ],
  },
  "padang-bai-to-gili-trawangan": {
    slug: "padang-bai-to-gili-trawangan",
    region: "Gili Islands",
    name: "Padang Bai to Gili Trawangan",
    h1: "Padang Bai to Gili Trawangan by fast boat",
    metaTitle: "Padang Bai to Gili Trawangan Fast Boat: Times & Operators",
    metaDescription:
      "Padang Bai to Gili Trawangan fast boat times, crossing time and operators, with sea conditions for the crossing. Compare boats and book on 12Go.",
    blurb: "The busiest route to the Gilis, with the most operators, departures and sea conditions.",
    fromLabel: "Padang Bai",
    toLabel: "Gili Trawangan",
    fromPorts: ["Padang Bai"],
    toPorts: ["Gili Trawangan"],
    conditionPorts: ["Padang Bai", "Gili Trawangan"],
    bookFrom: "Padang Bai",
    bookTo: "Gili Trawangan",
    related: ["padang-bai-to-gili-air","sanur-to-gili-trawangan","bali-to-gili-islands","gili-trawangan-to-bali"],
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "fast boat departure")} from Padang Bai to Gili Trawangan with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.`,
    sections: [
      {
        heading: "Why most people choose Padang Bai",
        paragraphs: [
          "Padang Bai is the busiest departure port for the Gilis, with more operators and more departures than anywhere else in Bali, and Gili Trawangan is the most-served island on the other side. That means more choice of time, boat and price.",
          "The boat crossing from Padang Bai is shorter than from the southern ports, but the drive to the harbour is not. It is about 45 minutes from Kuta or Denpasar and 1.5 to 2 hours from Canggu or Uluwatu.",
        ],
      },
      {
        heading: "Which boat should I take?",
        paragraphs: [
          "Crossing times vary a lot between boats on this route. Some are quick direct crossings and others take much longer, so compare the Arrives column as well as the departure time.",
          "Morning departures usually have the calmest water and leave the rest of the day free.",
        ],
      },
      {
        heading: "Getting to the harbour and boarding",
        paragraphs: [
          "Padang Bai is a working ferry port as well as a fast boat harbour, so give yourself time to find the right pier and queue with your luggage.",
          CHECKIN_TEXT,
        ],
        cta: PLANNER_CTA("Gili Trawangan"),
      }
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Padang Bai to Gili Trawangan?",
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column before you book.`,
      },
      {
        q: "What time is the first boat from Padang Bai to Gili T?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change with the season, so confirm with the operator or on the booking page.`,
      },
      {
        q: "Which operators run Padang Bai to Gili Trawangan?",
        a: `We list ${joinOps(c.operators, 9)}. Boats, comfort and prices differ, so compare departure times and reviews as well as the fare.`,
      },
      {
        q: "Is it easy to get from Padang Bai to Gili Trawangan?",
        a: "Yes. It is the most popular route to the Gilis, with many departures a day in the main season. Most people book a ticket in advance, then arrive at the harbour an hour before departure.",
      },
      {
        q: "Where does the boat from Padang Bai arrive on Gili Trawangan?",
        a: "Boats arrive on the east side of the island near the main harbour area. Gili Trawangan has no cars, so you walk, cycle or take a cidomo (horse cart) to your accommodation.",
      },
      CANCEL_FAQ("Padang Bai", "Gili Trawangan"),
      BOOK_FAQ,
    ],
  },
  "padang-bai-to-gili-air": {
    slug: "padang-bai-to-gili-air",
    region: "Gili Islands",
    name: "Padang Bai to Gili Air",
    h1: "Padang Bai to Gili Air by fast boat",
    metaTitle: "Padang Bai to Gili Air Fast Boat: Times & Operators",
    metaDescription:
      "Padang Bai to Gili Air fast boat times, crossing time and operators, with sea conditions. See which boats go direct and which stop on the way, then book on 12Go.",
    blurb: "Fast boats from Padang Bai to the quieter Gili, with times and which boats stop on the way.",
    fromLabel: "Padang Bai",
    toLabel: "Gili Air",
    fromPorts: ["Padang Bai"],
    toPorts: ["Gili Air"],
    conditionPorts: ["Padang Bai", "Gili Air"],
    bookFrom: "Padang Bai",
    bookTo: "Gili Air",
    related: ["padang-bai-to-gili-trawangan","sanur-to-gili-air","bali-to-gili-islands","gili-air-to-bali"],
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "fast boat departure")} from Padang Bai to Gili Air with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.`,
    sections: [
      {
        heading: "A quieter Gili, a longer crossing",
        paragraphs: [
          "Gili Air sits closest to Lombok and is calmer than Gili Trawangan: cafes, yoga and swimming rather than nightlife. Many travellers pick it for exactly that.",
          "Gili Air is often the last stop on a circuit, so some boats from Padang Bai call at Gili Trawangan or Gili Meno first. Those boats take longer than a direct crossing, so compare the Arrives column before you choose.",
        ],
      },
      {
        heading: "Getting to Padang Bai",
        paragraphs: [
          "Padang Bai is about 45 minutes from Kuta or Denpasar and 1.5 to 2 hours from Canggu or Uluwatu. It has the most operators of any Bali port, which gives you a good spread of departure times.",
          CHECKIN_TEXT,
        ],
        cta: PLANNER_CTA("Gili Air"),
      }
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Padang Bai to Gili Air?",
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column before you book.`,
      },
      {
        q: "What time is the first boat from Padang Bai to Gili Air?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change with the season, so confirm with the operator or on the booking page.`,
      },
      {
        q: "Which operators run Padang Bai to Gili Air?",
        a: `We list ${joinOps(c.operators, 9)}. Boats, comfort and prices differ, so compare departure times and reviews as well as the fare.`,
      },
      {
        q: "Do all boats from Padang Bai to Gili Air go direct?",
        a: "Not all of them. Some stop at Gili Trawangan or Gili Meno before reaching Gili Air, which makes the trip longer. Compare the arrival times above to spot the longer trips.",
      },
      CANCEL_FAQ("Padang Bai", "Gili Air"),
      BOOK_FAQ,
    ],
  },
  "sanur-to-gili-trawangan": {
    slug: "sanur-to-gili-trawangan",
    region: "Gili Islands",
    name: "Sanur to Gili Trawangan",
    h1: "Sanur to Gili Trawangan by fast boat",
    metaTitle: "Sanur to Gili Trawangan Fast Boat: Times & Operators",
    metaDescription:
      "Sanur to Gili Trawangan fast boat times, crossing time and operators, with sea conditions. Compare direct boats and stops on the way, then book on 12Go.",
    blurb: "A shorter drive than Padang Bai: fast boats from Sanur to Gili Trawangan.",
    fromLabel: "Sanur",
    toLabel: "Gili Trawangan",
    fromPorts: ["Sanur"],
    toPorts: ["Gili Trawangan"],
    conditionPorts: ["Sanur", "Gili Trawangan"],
    bookFrom: "Sanur",
    bookTo: "Gili Trawangan",
    related: ["sanur-to-gili-air","padang-bai-to-gili-trawangan","bali-to-gili-islands","gili-trawangan-to-bali"],
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "fast boat departure")} from Sanur to Gili Trawangan with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.`,
    sections: [
      {
        heading: "Sanur: the easy port",
        paragraphs: [
          "Sanur is the convenient port if you are staying in South or Central Bali. It is about 25 minutes from Kuta, 40 to 50 minutes from Canggu and 45 to 60 minutes from Ubud, so you avoid the long drive east to Padang Bai.",
          "The trade-off is the sea. Sanur is further from the Gilis than Padang Bai, so the crossing takes longer and can be rougher in the wetter months. Check the sea conditions below before you commit to a date.",
        ],
      },
      {
        heading: "Direct or via Nusa Penida?",
        paragraphs: [
          "Some boats from Sanur call at Nusa Penida on the way to the Gilis, which makes a longer day but lets you drop in on Nusa. Compare the arrival times in the table to spot them.",
          CHECKIN_TEXT,
        ],
        cta: PLANNER_CTA("Gili Trawangan"),
      }
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Sanur to Gili Trawangan?",
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column before you book.`,
      },
      {
        q: "What time is the first boat from Sanur to Gili T?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change with the season, so confirm with the operator or on the booking page.`,
      },
      {
        q: "Which operators run Sanur to Gili Trawangan?",
        a: `We list ${joinOps(c.operators, 9)}. Boats, comfort and prices differ, so compare departure times and reviews as well as the fare.`,
      },
      {
        q: "Is Sanur or Padang Bai better for Gili Trawangan?",
        a: "Sanur is easier to reach from South and Central Bali. Padang Bai has more operators and a shorter crossing, but a longer drive. Choose by where you are staying and how you handle rough water.",
      },
      CANCEL_FAQ("Sanur", "Gili Trawangan"),
      BOOK_FAQ,
    ],
  },
  "sanur-to-gili-air": {
    slug: "sanur-to-gili-air",
    region: "Gili Islands",
    name: "Sanur to Gili Air",
    h1: "Sanur to Gili Air by fast boat",
    metaTitle: "Sanur to Gili Air Fast Boat: Times & Operators",
    metaDescription:
      "Sanur to Gili Air fast boat times, crossing time and operators, with sea conditions. See which boats stop on the way and book on 12Go.",
    blurb: "Fast boats from Sanur to Gili Air, with times and which boats stop on the way.",
    fromLabel: "Sanur",
    toLabel: "Gili Air",
    fromPorts: ["Sanur"],
    toPorts: ["Gili Air"],
    conditionPorts: ["Sanur", "Gili Air"],
    bookFrom: "Sanur",
    bookTo: "Gili Air",
    related: ["sanur-to-gili-trawangan","padang-bai-to-gili-air","bali-to-gili-islands","gili-air-to-bali"],
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "fast boat departure")} from Sanur to Gili Air with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.`,
    sections: [
      {
        heading: "Sanur to the quiet Gili",
        paragraphs: [
          "Gili Air is the calmer choice of the three Gilis, and Sanur is the easy port from South and Central Bali, so this pairing suits travellers who want a short transfer and a relaxed island.",
          "Crossing times vary widely from Sanur. Some boats stop at other islands such as Nusa Penida, Gili Trawangan or Gili Meno on the way, which adds time, so check the Arrives column and pick the boat that suits your day.",
        ],
      },
      {
        heading: "Getting to the harbour",
        paragraphs: [
          "Sanur harbour is about 25 minutes from Kuta and 40 to 50 minutes from Canggu. Allow extra time in busy traffic.",
          CHECKIN_TEXT,
        ],
        cta: PLANNER_CTA("Gili Air"),
      }
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Sanur to Gili Air?",
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column before you book.`,
      },
      {
        q: "What time is the first boat from Sanur to Gili Air?",
        a: `The earliest departure is ${c.earliest} and the latest is ${c.latest}. Timetables change with the season, so confirm with the operator or on the booking page.`,
      },
      {
        q: "Which operators run Sanur to Gili Air?",
        a: `We list ${joinOps(c.operators, 9)}. Boats, comfort and prices differ, so compare departure times and reviews as well as the fare.`,
      },
      {
        q: "How long does Sanur to Gili Air take?",
        a: "It depends on the boat. Direct crossings are shorter, but some boats call at other islands first. The timetable above shows each boat's crossing time and stops.",
      },
      CANCEL_FAQ("Sanur", "Gili Air"),
      BOOK_FAQ,
    ],
  },

  "sanur-to-nusa-penida": {
    slug: "sanur-to-nusa-penida",
    region: "Nusa Islands",
    name: "Sanur to Nusa Penida",
    h1: "Sanur to Nusa Penida by fast boat",
    metaTitle: "Sanur to Nusa Penida Fast Boat: Times & Operators",
    metaDescription:
      "Sanur to Nusa Penida fast boat times, crossing time and operators, with confirmed departures and live sea conditions. Compare boats and book on 12Go.",
    blurb: "The main crossing from south Bali to Nusa Penida, with confirmed departures and crossing times.",
    fromLabel: "Sanur",
    toLabel: "Nusa Penida",
    fromPorts: ["Sanur"],
    toPorts: ["Nusa Penida"],
    conditionPorts: ["Sanur", "Nusa Penida"],
    bookFrom: "Sanur",
    bookTo: "Nusa Penida",
    related: ["bali-to-nusa-penida", "sanur-to-nusa-lembongan", "nusa-penida-to-bali", "nusa-penida-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "fast boat departure")} from Sanur to Nusa Penida with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Why most people leave from Sanur",
        paragraphs: [
          "Sanur is the easiest port to reach from south and central Bali: about 25 minutes from Kuta, 40 to 50 minutes from Canggu and 45 minutes to an hour from Ubud. That's why it has so many boats to Nusa Penida spread across the day.",
          "With this many departures you can usually pick a time that suits you, so check the Arrives column too: crossing times differ between boats.",
        ],
      },
      {
        heading: "Arriving on Nusa Penida",
        paragraphs: [
          PENIDA_HARBOURS,
          "Penida's roads are steep and rough in places. If you're planning a day trip, an early boat leaves the most time on the island.",
        ],
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT], cta: PLANNER_CTA("Nusa Penida") },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Sanur to Nusa Penida?",
        a: `Crossing times are ${c.durations}, depending on the boat. Check the Arrives column above and confirm on your ticket.`,
      },
      {
        q: "What time is the first boat from Sanur to Nusa Penida?",
        a: `The earliest departure we list is ${c.earliest} and the latest is ${c.latest}. Timetables change, so confirm on the booking page for your date.`,
      },
      {
        q: "Which operators run Sanur to Nusa Penida?",
        a: `We list ${joinOps(c.operators, 9)}. Boats and comfort differ, so compare times and reviews as well as the fare.`,
      },
      CONFIRMED_FAQ("Sanur", "Nusa Penida", c),
      {
        q: "Can I do Nusa Penida as a day trip from Sanur?",
        a: `Yes, many people do. With departures from ${c.earliest}, an early boat out and an afternoon boat back gives you most of a day on the island. Book the return before you go in busy months.`,
      },
      CANCEL_FAQ("Sanur", "Nusa Penida"),
      BOOK_FAQ,
    ],
  },

  "sanur-to-nusa-lembongan": {
    slug: "sanur-to-nusa-lembongan",
    region: "Nusa Islands",
    name: "Sanur to Nusa Lembongan",
    h1: "Sanur to Nusa Lembongan by fast boat",
    metaTitle: "Sanur to Nusa Lembongan Fast Boat: Times & Operators",
    metaDescription:
      "Sanur to Nusa Lembongan fast boat times, crossing time and operators, with confirmed departures and live sea conditions. Compare boats and book on 12Go.",
    blurb: "The short hop from Sanur to Nusa Lembongan, with confirmed departures and crossing times.",
    fromLabel: "Sanur",
    toLabel: "Nusa Lembongan",
    fromPorts: ["Sanur"],
    toPorts: ["Nusa Lembongan"],
    conditionPorts: ["Sanur", "Nusa Lembongan"],
    bookFrom: "Sanur",
    bookTo: "Nusa Lembongan",
    related: ["bali-to-nusa-lembongan", "nusa-lembongan-to-bali", "sanur-to-nusa-penida", "nusa-lembongan-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "fast boat departure")} from Sanur to Nusa Lembongan with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Sanur to Lembongan",
        paragraphs: [
          "Sanur is the usual port for Nusa Lembongan: it's about 25 minutes from Kuta and 45 minutes to an hour from Ubud, and boats run through the day.",
          "Lembongan is joined to Nusa Ceningan by a footbridge, and Nusa Penida is a short boat ride away, so it makes a good base for all three islands.",
        ],
      },
      { heading: "Arriving on Lembongan", paragraphs: [LEMBONGAN_LANDING, CHECKIN_TEXT], cta: PLANNER_CTA("Nusa Lembongan") },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Sanur to Nusa Lembongan?",
        a: `Crossing times are ${c.durations}, depending on the boat. Check the Arrives column above and confirm on your ticket.`,
      },
      {
        q: "What time is the first boat from Sanur to Nusa Lembongan?",
        a: `The earliest departure we list is ${c.earliest} and the latest is ${c.latest}. Timetables change, so confirm on the booking page for your date.`,
      },
      {
        q: "Which operators run Sanur to Nusa Lembongan?",
        a: `We list ${joinOps(c.operators, 9)}. Boats and comfort differ, so compare times and reviews as well as the fare.`,
      },
      CONFIRMED_FAQ("Sanur", "Nusa Lembongan", c),
      {
        q: "Will I get wet getting off the boat?",
        a: "Possibly. Many boats land on Lembongan's beach rather than at a pier, so you may step off into shallow water. Wear sandals and keep valuables in a bag you can lift.",
      },
      CANCEL_FAQ("Sanur", "Nusa Lembongan"),
      BOOK_FAQ,
    ],
  },

  "bali-to-nusa-penida": {
    slug: "bali-to-nusa-penida",
    region: "Nusa Islands",
    name: "Bali to Nusa Penida",
    h1: "Bali to Nusa Penida by fast boat",
    metaTitle: "Bali to Nusa Penida Fast Boat: Times From Every Port",
    metaDescription:
      "Fast boats from Bali to Nusa Penida from Sanur, Padang Bai, Serangan and Benoa: departures, crossing times and operators, with sea conditions. Compare and book.",
    blurb: "Every Bali port with boats to Nusa Penida in one table, with confirmed departures.",
    fromLabel: "Bali",
    toLabel: "Nusa Penida",
    fromPorts: BALI_MAINLAND,
    toPorts: ["Nusa Penida"],
    conditionPorts: ["Sanur", "Padang Bai", "Nusa Penida"],
    bookFrom: "Sanur",
    bookTo: "Nusa Penida",
    related: ["sanur-to-nusa-penida", "bali-to-nusa-lembongan", "nusa-penida-to-bali", "nusa-penida-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run to Nusa Penida from ${joinList(c.fromNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Which Bali port for Nusa Penida?",
        paragraphs: [
          "Sanur has by far the most boats and is the easiest port to reach from south and central Bali. The other ports have only a few departures, so they mainly suit you if you're staying close by.",
          "Put your hotel into the Trip Planner to compare real driving times to each port against the boat time.",
        ],
        cta: PLANNER_CTA("Nusa Penida"),
      },
      { heading: "Arriving on Nusa Penida", paragraphs: [PENIDA_HARBOURS, CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Bali to Nusa Penida?",
        a: `Crossing times are: ${c.durations}. Check the Arrives column above for each boat.`,
      },
      {
        q: "Which Bali ports have boats to Nusa Penida?",
        a: `We list departures from ${joinList(c.fromNames)}. Sanur has the most.`,
      },
      {
        q: "Which operators go from Bali to Nusa Penida?",
        a: `We list ${joinOps(c.operators, 9)}. These are the operators listed on the booking site when we last checked.`,
      },
      CONFIRMED_FAQ("Bali", "Nusa Penida", c),
      CANCEL_FAQ("Bali", "Nusa Penida"),
      BOOK_FAQ,
    ],
  },

  "bali-to-nusa-lembongan": {
    slug: "bali-to-nusa-lembongan",
    region: "Nusa Islands",
    name: "Bali to Nusa Lembongan",
    h1: "Bali to Nusa Lembongan by fast boat",
    metaTitle: "Bali to Nusa Lembongan Fast Boat: Times From Every Port",
    metaDescription:
      "Fast boats from Bali to Nusa Lembongan from Sanur, Padang Bai and Benoa: departures, crossing times and operators, with sea conditions. Compare and book.",
    blurb: "Every Bali port with boats to Nusa Lembongan, with confirmed departures.",
    fromLabel: "Bali",
    toLabel: "Nusa Lembongan",
    fromPorts: BALI_MAINLAND,
    toPorts: ["Nusa Lembongan"],
    conditionPorts: ["Sanur", "Nusa Lembongan"],
    bookFrom: "Sanur",
    bookTo: "Nusa Lembongan",
    related: ["sanur-to-nusa-lembongan", "bali-to-nusa-penida", "nusa-lembongan-to-bali", "nusa-lembongan-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run to Nusa Lembongan from ${joinList(c.fromNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Which Bali port for Lembongan?",
        paragraphs: [
          "Sanur has the most boats to Nusa Lembongan and is the easiest port to reach from south and central Bali. The other ports have only a few departures.",
          "Put your hotel into the Trip Planner to compare real driving times to each port against the boat time.",
        ],
        cta: PLANNER_CTA("Nusa Lembongan"),
      },
      { heading: "Arriving on Lembongan", paragraphs: [LEMBONGAN_LANDING, CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Bali to Nusa Lembongan?",
        a: `Crossing times are: ${c.durations}. Check the Arrives column above for each boat.`,
      },
      {
        q: "Which Bali ports have boats to Nusa Lembongan?",
        a: `We list departures from ${joinList(c.fromNames)}.`,
      },
      {
        q: "Which operators go from Bali to Nusa Lembongan?",
        a: `We list ${joinOps(c.operators, 9)}. These are the operators listed on the booking site when we last checked.`,
      },
      CONFIRMED_FAQ("Bali", "Nusa Lembongan", c),
      CANCEL_FAQ("Bali", "Nusa Lembongan"),
      BOOK_FAQ,
    ],
  },

  "nusa-lembongan-to-bali": {
    slug: "nusa-lembongan-to-bali",
    region: "Nusa Islands",
    name: "Nusa Lembongan to Bali",
    h1: "Nusa Lembongan to Bali by fast boat",
    metaTitle: "Nusa Lembongan to Bali Fast Boat: Times & Operators",
    metaDescription:
      "Nusa Lembongan to Bali fast boat departures to Sanur and other ports, with crossing times, operators and confirmed departures. Compare boats and book on 12Go.",
    blurb: "Boats back to Bali from Nusa Lembongan, with confirmed departures and crossing times.",
    fromLabel: "Nusa Lembongan",
    toLabel: "Bali",
    fromPorts: ["Nusa Lembongan"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Nusa Lembongan", "Sanur"],
    bookFrom: "Nusa Lembongan",
    bookTo: "Sanur",
    related: ["sanur-to-nusa-lembongan", "nusa-penida-to-bali", "nusa-lembongan-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Nusa Lembongan to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Getting back to Bali",
        paragraphs: [
          "Most boats from Lembongan go to Sanur, which is close to the airport and south Bali. If you have a flight the same day, leave plenty of time for traffic on the Bali side.",
          LEMBONGAN_LANDING,
        ],
        cta: PLANNER_CTA(),
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Nusa Lembongan to Bali?",
        a: `Crossing times are: ${c.durations}. Check the Arrives column above for each boat.`,
      },
      {
        q: "What time is the last boat from Nusa Lembongan to Bali?",
        a: `The latest departure we list is ${c.latest}, and the earliest is ${c.earliest}. Timetables change, so confirm on the booking page for your date.`,
      },
      {
        q: "Which operators run Nusa Lembongan to Bali?",
        a: `We list ${joinOps(c.operators, 9)}.`,
      },
      CONFIRMED_FAQ("Nusa Lembongan", "Bali", c),
      CANCEL_FAQ("Nusa Lembongan", "Bali"),
      BOOK_FAQ,
    ],
  },

  "nusa-penida-to-bali": {
    slug: "nusa-penida-to-bali",
    region: "Nusa Islands",
    name: "Nusa Penida to Bali",
    h1: "Nusa Penida to Bali by fast boat",
    metaTitle: "Nusa Penida to Bali Fast Boat: Times & Operators",
    metaDescription:
      "Nusa Penida to Bali fast boat departures, crossing times and operators, with confirmed departures and sea conditions. Compare boats and book on 12Go.",
    blurb: "Boats back to Bali from Nusa Penida, with crossing times and sea conditions.",
    fromLabel: "Nusa Penida",
    toLabel: "Bali",
    fromPorts: ["Nusa Penida"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Nusa Penida", "Sanur"],
    bookFrom: "Nusa Penida",
    bookTo: "Sanur",
    related: ["sanur-to-nusa-penida", "bali-to-nusa-penida", "nusa-lembongan-to-bali", "nusa-penida-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Nusa Penida to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Getting back to Bali",
        paragraphs: [
          PENIDA_HARBOURS,
          "Penida's roads are slow, so allow plenty of time to reach the harbour. If you have a flight the same day, leave a generous buffer on the Bali side too.",
        ],
        cta: PLANNER_CTA(),
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Nusa Penida to Bali?",
        a: `Crossing times are: ${c.durations}. Check the Arrives column above for each boat.`,
      },
      {
        q: "What time is the last boat from Nusa Penida to Bali?",
        a: `The latest departure we list is ${c.latest}, and the earliest is ${c.earliest}. Timetables change, so confirm on the booking page for your date.`,
      },
      {
        q: "Which operators run Nusa Penida to Bali?",
        a: `We list ${joinOps(c.operators, 9)}.`,
      },
      CONFIRMED_FAQ("Nusa Penida", "Bali", c),
      CANCEL_FAQ("Nusa Penida", "Bali"),
      BOOK_FAQ,
    ],
  },

  "gili-islands-to-nusa-penida": {
    slug: "gili-islands-to-nusa-penida",
    region: "Nusa Islands",
    name: "Gili Islands to Nusa Penida",
    h1: "Gili Islands to Nusa Penida by fast boat",
    metaTitle: "Gili Islands to Nusa Penida Fast Boat: Times & Operators",
    metaDescription:
      "Gili Trawangan, Gili Air and Gili Meno to Nusa Penida by fast boat: departures, crossing times and operators, with confirmed departures. Compare and book.",
    blurb: "Straight from the Gilis to Nusa Penida without a night in Bali, with confirmed departures.",
    fromLabel: "Gili Islands",
    toLabel: "Nusa Penida",
    fromPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    toPorts: ["Nusa Penida"],
    conditionPorts: ["Gili Trawangan", "Nusa Penida"],
    bookFrom: "Gili Trawangan",
    bookTo: "Nusa Penida",
    related: ["nusa-penida-to-gili-islands", "gili-islands-to-nusa-lembongan", "gili-trawangan-to-bali"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from ${joinList(c.fromNames)} to Nusa Penida. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Skipping the mainland",
        paragraphs: [
          "You don't have to go back to Bali first. Fast boats run from the Gilis straight to Nusa Penida, which saves a night and a drive on the mainland.",
          "Some boats call at other islands or ports on the way, which adds to the crossing time, so compare the Arrives column before you choose.",
        ],
      },
      {
        heading: "Arriving on Nusa Penida",
        paragraphs: [PENIDA_HARBOURS, "The Gilis have no cars or motorbikes, so allow time to reach the harbour on foot, by bicycle or by horse cart.", CHECKIN_TEXT],
        cta: PLANNER_CTA("Nusa Penida"),
      },
    ],
    faqs: (c) => [
      {
        q: "Can I go from the Gili Islands to Nusa Penida without going back to Bali?",
        a: `Yes. We list ${plural(c.count, "departure")} from ${joinList(c.fromNames)} to Nusa Penida, with ${joinOps(c.operators)}.`,
      },
      {
        q: "How long is the fast boat from the Gilis to Nusa Penida?",
        a: `Crossing times are: ${c.durations}. Boats that call elsewhere on the way take longer.`,
      },
      {
        q: "What time do boats leave the Gilis for Nusa Penida?",
        a: `The earliest departure we list is ${c.earliest} and the latest is ${c.latest}. Timetables change, so confirm on the booking page for your date.`,
      },
      CONFIRMED_FAQ("Gili Islands", "Nusa Penida", c),
      CANCEL_FAQ("the Gili Islands", "Nusa Penida"),
      BOOK_FAQ,
    ],
  },

  "gili-islands-to-nusa-lembongan": {
    slug: "gili-islands-to-nusa-lembongan",
    region: "Nusa Islands",
    name: "Gili Islands to Nusa Lembongan",
    h1: "Gili Islands to Nusa Lembongan by fast boat",
    metaTitle: "Gili Islands to Nusa Lembongan Fast Boat: Times & Operators",
    metaDescription:
      "Gili Trawangan, Gili Air and Gili Meno to Nusa Lembongan by fast boat: departures, crossing times and operators, with confirmed departures. Compare and book.",
    blurb: "Straight from the Gilis to Nusa Lembongan, with confirmed departures and crossing times.",
    fromLabel: "Gili Islands",
    toLabel: "Nusa Lembongan",
    fromPorts: ["Gili Trawangan", "Gili Air", "Gili Meno"],
    toPorts: ["Nusa Lembongan"],
    conditionPorts: ["Gili Trawangan", "Nusa Lembongan"],
    bookFrom: "Gili Trawangan",
    bookTo: "Nusa Lembongan",
    related: ["nusa-lembongan-to-gili-islands", "gili-islands-to-nusa-penida", "gili-trawangan-to-bali"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from ${joinList(c.fromNames)} to Nusa Lembongan. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Skipping the mainland",
        paragraphs: [
          "Fast boats run from the Gilis straight to Nusa Lembongan, so you can carry on to the Nusa Islands without a night in Bali.",
          "Some boats call at other islands or ports on the way, which adds to the crossing time, so compare the Arrives column before you choose.",
        ],
      },
      {
        heading: "Arriving on Lembongan",
        paragraphs: [LEMBONGAN_LANDING, CHECKIN_TEXT],
        cta: PLANNER_CTA("Nusa Lembongan"),
      },
    ],
    faqs: (c) => [
      {
        q: "Can I go from the Gili Islands to Nusa Lembongan without going back to Bali?",
        a: `Yes. We list ${plural(c.count, "departure")} from ${joinList(c.fromNames)} to Nusa Lembongan, with ${joinOps(c.operators)}.`,
      },
      {
        q: "How long is the fast boat from the Gilis to Nusa Lembongan?",
        a: `Crossing times are: ${c.durations}. Boats that call elsewhere on the way take longer.`,
      },
      {
        q: "What time do boats leave the Gilis for Nusa Lembongan?",
        a: `The earliest departure we list is ${c.earliest} and the latest is ${c.latest}. Timetables change, so confirm on the booking page for your date.`,
      },
      CONFIRMED_FAQ("Gili Islands", "Nusa Lembongan", c),
      CANCEL_FAQ("the Gili Islands", "Nusa Lembongan"),
      BOOK_FAQ,
    ],
  },

  "lombok-to-bali": {
    slug: "lombok-to-bali",
    region: "Lombok",
    name: "Lombok to Bali",
    h1: "Lombok to Bali by fast boat",
    metaTitle: "Lombok to Bali Fast Boat From Bangsal: Times & Operators",
    metaDescription:
      "Lombok to Bali by fast boat from Bangsal: departures, crossing times and operators, with confirmed departures and sea conditions. Compare and book on 12Go.",
    blurb: "Fast boats from Bangsal on Lombok back to Bali, with confirmed departures.",
    fromLabel: "Lombok",
    toLabel: "Bali",
    fromPorts: LOMBOK_PORTS,
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Bangsal (Lombok)", "Padang Bai"],
    bookFrom: "Bangsal (Lombok)",
    bookTo: "Padang Bai",
    related: ["bali-to-lombok-ferry", "gili-trawangan-to-bali", "lombok-to-nusa-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Bangsal on Lombok to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Leaving from Bangsal",
        paragraphs: [
          "Bangsal, on Lombok's north-west coast, is the main harbour for fast boats to Bali and the Gili Islands. Some boats to Bali call at the Gilis on the way, which adds to the crossing time.",
          "Padang Bai, on Bali's east coast, usually has the shortest crossing. Sanur and the southern ports are closer to the airport but further by sea.",
        ],
        cta: PLANNER_CTA(),
      },
      { heading: "Flying instead?", paragraphs: ["There are also short flights between Lombok and Bali. This page covers the crossing by sea."] },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "Is there a fast boat from Lombok to Bali?",
        a: `Yes. We list ${plural(c.count, "departure")} from Bangsal to ${joinList(c.toNames)}.`,
      },
      {
        q: "How long does the Lombok to Bali fast boat take?",
        a: `Crossing times are: ${c.durations}. Boats that stop at the Gilis on the way take longer.`,
      },
      {
        q: "Which operators run Lombok to Bali?",
        a: `We list ${joinOps(c.operators, 9)}.`,
      },
      CONFIRMED_FAQ("Lombok", "Bali", c),
      CANCEL_FAQ("Lombok", "Bali"),
      BOOK_FAQ,
    ],
  },

  "lombok-to-nusa-islands": {
    slug: "lombok-to-nusa-islands",
    region: "Lombok",
    name: "Lombok to the Nusa Islands",
    h1: "Lombok to Nusa Penida and Lembongan by fast boat",
    metaTitle: "Lombok to Nusa Penida & Lembongan Fast Boat: Times",
    metaDescription:
      "Fast boats from Bangsal on Lombok to Nusa Penida and Nusa Lembongan: departures, crossing times and operators, with confirmed departures. Compare and book.",
    blurb: "Fast boats from Bangsal to Nusa Penida and Nusa Lembongan, with confirmed departures.",
    fromLabel: "Lombok",
    toLabel: "Nusa Islands",
    fromPorts: LOMBOK_PORTS,
    toPorts: ["Nusa Penida", "Nusa Lembongan"],
    conditionPorts: ["Bangsal (Lombok)", "Nusa Penida"],
    bookFrom: "Bangsal (Lombok)",
    bookTo: "Nusa Penida",
    related: ["nusa-islands-to-lombok", "lombok-to-bali", "gili-islands-to-nusa-penida"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Bangsal on Lombok to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Straight to the Nusa Islands",
        paragraphs: [
          "You can sail from Lombok to Nusa Penida or Nusa Lembongan without going through mainland Bali. Some of these boats call at the Gili Islands on the way, which adds to the crossing time.",
          PENIDA_HARBOURS,
        ],
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT], cta: PLANNER_CTA("Nusa Penida") },
    ],
    faqs: (c) => [
      {
        q: "Is there a boat from Lombok to Nusa Penida?",
        a: `Yes. We list ${plural(c.count, "departure")} from Bangsal to ${joinList(c.toNames)}.`,
      },
      {
        q: "How long is the boat from Lombok to the Nusa Islands?",
        a: `Crossing times are: ${c.durations}. Boats that stop at the Gilis on the way take longer.`,
      },
      {
        q: "Which operators run Lombok to the Nusa Islands?",
        a: `We list ${joinOps(c.operators, 9)}.`,
      },
      CONFIRMED_FAQ("Lombok", "Nusa Islands", c),
      CANCEL_FAQ("Lombok", "the Nusa Islands"),
      BOOK_FAQ,
    ],
  },

  "nusa-islands-to-lombok": {
    slug: "nusa-islands-to-lombok",
    region: "Lombok",
    name: "Nusa Islands to Lombok",
    h1: "Nusa Penida and Lembongan to Lombok by fast boat",
    metaTitle: "Nusa Penida & Lembongan to Lombok Fast Boat: Times",
    metaDescription:
      "Fast boats from Nusa Penida and Nusa Lembongan to Bangsal on Lombok: departures, crossing times and operators, with confirmed departures. Compare and book.",
    blurb: "Fast boats from Nusa Penida and Lembongan to Bangsal on Lombok, with confirmed departures.",
    fromLabel: "Nusa Islands",
    toLabel: "Lombok",
    fromPorts: ["Nusa Penida", "Nusa Lembongan"],
    toPorts: LOMBOK_PORTS,
    conditionPorts: ["Nusa Penida", "Bangsal (Lombok)"],
    bookFrom: "Nusa Penida",
    bookTo: "Bangsal (Lombok)",
    related: ["lombok-to-nusa-islands", "nusa-penida-to-gili-islands", "nusa-lembongan-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from ${joinList(c.fromNames)} to Bangsal on Lombok. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Straight to Lombok",
        paragraphs: [
          "You can sail from Nusa Penida or Nusa Lembongan to Lombok without going back to mainland Bali. Some of these boats call at the Gili Islands on the way, which adds to the crossing time.",
          "Bangsal is the main harbour on Lombok's north-west coast, and the usual landing point for fast boats from Bali and the Nusa Islands.",
        ],
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT], cta: PLANNER_CTA("Bangsal (Lombok)") },
    ],
    faqs: (c) => [
      {
        q: "Is there a boat from Nusa Penida to Lombok?",
        a: `Yes. We list ${plural(c.count, "departure")} from ${joinList(c.fromNames)} to Bangsal.`,
      },
      {
        q: "How long is the boat from the Nusa Islands to Lombok?",
        a: `Crossing times are: ${c.durations}. Boats that stop at the Gilis on the way take longer.`,
      },
      {
        q: "Which operators run the Nusa Islands to Lombok?",
        a: `We list ${joinOps(c.operators, 9)}.`,
      },
      CONFIRMED_FAQ("Nusa Islands", "Lombok", c),
      CANCEL_FAQ("the Nusa Islands", "Lombok"),
      BOOK_FAQ,
    ],
  },

  "gili-meno-to-bali": {
    slug: "gili-meno-to-bali",
    region: "Gili Islands",
    name: "Gili Meno to Bali",
    h1: "Gili Meno to Bali by fast boat",
    metaTitle: "Gili Meno to Bali Fast Boat: Times & Operators",
    metaDescription:
      "Gili Meno to Bali fast boat departures, crossing times and operators, with confirmed departures and sea conditions. Compare boats and book on 12Go.",
    blurb: "Departures from Gili Meno, the quietest Gili, back to Bali.",
    fromLabel: "Gili Meno",
    toLabel: "Bali",
    fromPorts: ["Gili Meno"],
    toPorts: BALI_MAINLAND,
    conditionPorts: ["Gili Meno", "Padang Bai"],
    bookFrom: "Gili Meno",
    bookTo: "Padang Bai",
    related: ["gili-trawangan-to-bali", "gili-air-to-bali", "bali-to-gili-islands"],
    ourPick: "",
    lead: (c) =>
      `Fast boats run from Gili Meno to ${joinList(c.toNames)}. We list ${plural(c.count, "departure")} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. Crossing times: ${c.durations}.` +
      CONFIRMED_LINE(c),
    sections: [
      {
        heading: "Fewer boats from Meno",
        paragraphs: [
          "Gili Meno is the smallest and quietest of the three Gilis, and it has fewer direct boats than Gili Trawangan or Gili Air. If nothing suits your day, a short hop to one of the other Gilis opens up more departures.",
          "Like the other Gilis, Meno has no cars or motorbikes, so allow time to reach the harbour with luggage.",
        ],
        cta: { href: "/indonesia/routes/gili-trawangan-to-bali", label: "See Gili Trawangan to Bali →" },
      },
      { heading: "Checking in", paragraphs: [CHECKIN_TEXT] },
    ],
    faqs: (c) => [
      {
        q: "How long is the fast boat from Gili Meno to Bali?",
        a: `Crossing times are: ${c.durations}. Check the Arrives column above for each boat.`,
      },
      {
        q: "What time is the first boat from Gili Meno to Bali?",
        a: `The earliest departure we list is ${c.earliest} and the latest is ${c.latest}. Timetables change, so confirm on the booking page for your date.`,
      },
      {
        q: "Which operators run Gili Meno to Bali?",
        a: `We list ${joinOps(c.operators, 9)}.`,
      },
      CONFIRMED_FAQ("Gili Meno", "Bali", c),
      CANCEL_FAQ("Gili Meno", "Bali"),
      BOOK_FAQ,
    ],
  },
};

// One-port-to-one-port pages (e.g. Nusa Penida to Gili Trawangan) for pairs that otherwise only appear inside a group
// page such as "Nusa Penida to the Gili Islands". Only pairs with several daily boats get one (4+ in the 22-28 Oct
// check): a page with one or two boats is thin, and empties out whenever one operator drops off the booking site.
// Leaving/arriving copy comes from PORT_NOTES; `about` is written per page so no two pages read the same.
const NO_VEHICLES = "has no cars or motorbikes, so you get around on foot, by bicycle or by horse cart (cidomo). Allow extra time with luggage.";
const PORT_NOTES = {
  "Padang Bai": {
    leaving:
      "Padang Bai is on Bali's east coast, about 45 minutes from Kuta or Denpasar and 1.5 to 2 hours from Canggu or Uluwatu. It's a working ferry port as well as a fast boat harbour, so give yourself time to find the right pier.",
    arriving:
      "Padang Bai is on Bali's east coast: about 45 minutes by road to Kuta or Denpasar and 1.5 to 2 hours to Canggu or Uluwatu. If you have a flight the same day, leave a generous buffer for the drive.",
  },
  Sanur: {
    leaving: "Sanur harbour is about 25 minutes from Kuta, 40 to 50 minutes from Canggu and 45 minutes to an hour from Ubud. Allow extra time in busy traffic.",
    arriving:
      "Sanur is in south Bali, about 25 minutes from Kuta and close to the airport. If you have a flight the same day, leave plenty of time for traffic on the Bali side.",
  },
  "Gili Trawangan": { leaving: `Gili Trawangan ${NO_VEHICLES}`, arriving: `Gili Trawangan ${NO_VEHICLES}` },
  "Gili Air": { leaving: `Gili Air ${NO_VEHICLES}`, arriving: `Gili Air ${NO_VEHICLES}` },
  "Nusa Penida": {
    leaving: `${PENIDA_HARBOURS} Penida's roads are slow and rough in places, so allow plenty of time to reach the harbour.`,
    arriving: `${PENIDA_HARBOURS} Penida's roads are steep and slow, so plan your onward ride before you arrive.`,
  },
  "Nusa Lembongan": {
    leaving: `Lembongan is small, so the harbour is usually a short ride from where you're staying. ${LEMBONGAN_LANDING}`,
    arriving: LEMBONGAN_LANDING,
  },
  "Bangsal (Lombok)": {
    leaving: "Bangsal, on Lombok's north-west coast, is the main harbour for fast boats to Bali, the Nusa Islands and the Gili Islands.",
    arriving: "Bangsal, on Lombok's north-west coast, is the gateway to north-west Lombok, and the short boats to the Gili Islands leave from here too.",
  },
};

const SPECIFIC = [
  {
    slug: "gili-air-to-padang-bai", from: "Gili Air", to: "Padang Bai",
    about: [
      "Padang Bai usually has the shortest crossing from the Gilis to Bali, which makes it the quickest way back to the mainland from Gili Air.",
      "It suits you best if you're heading on to Ubud or east Bali. If you're flying out or staying in the south, compare Gili Air to Sanur too: a longer crossing, but a much shorter drive.",
    ],
  },
  {
    slug: "gili-trawangan-to-padang-bai", from: "Gili Trawangan", to: "Padang Bai",
    about: [
      "Padang Bai is the classic crossing back to Bali from Gili Trawangan, and usually the shortest one by sea.",
      "The catch is the drive on the Bali side: from Padang Bai it's about 45 minutes to Kuta or Denpasar and up to 2 hours to Canggu or Uluwatu. Good for Ubud and the east, less so for a same-day flight.",
    ],
  },
  {
    slug: "gili-air-to-sanur", from: "Gili Air", to: "Sanur",
    about: [
      "Sanur lands you in south Bali, close to the airport, Kuta and Canggu, so it's the easier choice if you're flying out or staying in the south.",
      "The crossing is longer than to Padang Bai, and some boats call at other islands such as Gili Trawangan or Nusa Penida on the way. Compare the Arrives column to find the quickest boat.",
    ],
  },
  {
    slug: "gili-trawangan-to-sanur", from: "Gili Trawangan", to: "Sanur",
    about: [
      "Going to Sanur instead of Padang Bai trades a longer boat ride for a much shorter drive: Sanur is about 25 minutes from Kuta and close to the airport.",
      "Some boats stop at other islands on the way, which adds to the crossing, so check the arrival times before you pick one.",
    ],
  },
  {
    slug: "nusa-penida-to-gili-trawangan", from: "Nusa Penida", to: "Gili Trawangan",
    about: [
      "You can go straight from Nusa Penida to Gili Trawangan without a night back on mainland Bali, which saves a day of transfers.",
      "Some of these boats run a circuit and call at other islands before Gili Trawangan. The crossing times in the table show which boats are quickest.",
    ],
  },
  {
    slug: "gili-trawangan-to-nusa-penida", from: "Gili Trawangan", to: "Nusa Penida",
    about: [
      "Heading from the Gilis to Nusa Penida? There's no need to go back through Bali: these boats sail from Gili Trawangan straight to Penida.",
      "Some call at other islands or ports on the way, so compare the arrival times and pick the boat that fits your day.",
    ],
  },
  {
    slug: "nusa-penida-to-gili-air", from: "Nusa Penida", to: "Gili Air",
    about: [
      "Gili Air is the calm middle Gili, closest to Lombok, and you can reach it straight from Nusa Penida without a stop in mainland Bali.",
      "Gili Air is often one of the last stops on a circuit, so some boats call at Gili Trawangan or Gili Meno first. Check the Arrives column for the quickest crossing.",
    ],
  },
  {
    slug: "gili-air-to-nusa-penida", from: "Gili Air", to: "Nusa Penida",
    about: [
      "These boats take you from Gili Air straight to Nusa Penida, so you can swap the beaches for Penida's cliffs without a night in Bali.",
      "Some boats call at other islands on the way, which adds to the crossing time, so compare the arrival times before you book.",
    ],
  },
  {
    slug: "nusa-lembongan-to-gili-trawangan", from: "Nusa Lembongan", to: "Gili Trawangan",
    about: [
      "Nusa Lembongan to Gili Trawangan takes you from the Nusa Islands to the liveliest Gili in one boat, with no stop in mainland Bali.",
      "Some boats call at Nusa Penida or other islands on the way. The crossing times in the table show the difference.",
    ],
  },
  {
    slug: "nusa-lembongan-to-gili-air", from: "Nusa Lembongan", to: "Gili Air",
    about: [
      "Nusa Lembongan to Gili Air links two of the quieter islands, with no stop in mainland Bali.",
      "Gili Air is usually one of the last stops on a circuit, so some boats call at Gili Trawangan or Gili Meno first. Compare the Arrives column before you choose.",
    ],
  },
  {
    slug: "lombok-to-nusa-penida", from: "Bangsal (Lombok)", to: "Nusa Penida", name: "Lombok to Nusa Penida",
    about: [
      "Boats from Bangsal, on Lombok's north-west coast, sail to Nusa Penida without going through mainland Bali.",
      "Many of them call at the Gili Islands on the way, which adds to the crossing time, so check the arrival times in the table.",
    ],
  },
  {
    slug: "nusa-penida-to-lombok", from: "Nusa Penida", to: "Bangsal (Lombok)", name: "Nusa Penida to Lombok",
    about: [
      "You can sail from Nusa Penida to Bangsal on Lombok without going back to mainland Bali.",
      "Many of these boats stop at the Gili Islands before Lombok, so the crossing is longer than it looks on a map. Compare the Arrives column.",
    ],
  },
  {
    slug: "lombok-to-padang-bai", from: "Bangsal (Lombok)", to: "Padang Bai", name: "Lombok to Padang Bai",
    about: [
      "Padang Bai, on Bali's east coast, usually has the shortest crossing from Bangsal to Bali.",
      "Some of these boats call at the Gili Islands on the way. If you're flying out of Bali, remember the drive from Padang Bai to the airport and the south coast is a long one, so leave a buffer.",
    ],
  },
  {
    slug: "padang-bai-to-lombok", from: "Padang Bai", to: "Bangsal (Lombok)", name: "Padang Bai to Lombok",
    about: [
      "Fast boats from Padang Bai cross to Bangsal, the harbour on Lombok's north-west coast and the gateway to the Gili Islands.",
      "Some boats call at the Gilis before reaching Bangsal, so compare the arrival times in the table. Short flights between Bali and Lombok also exist; this page covers the crossing by sea.",
    ],
  },
];

const short = (p) => p.replace(" (Lombok)", "");

function specificRoute({ slug, from, to, name, about }) {
  const f = short(from);
  const t = to === "Bangsal (Lombok)" ? "Lombok" : to;
  const title = name || `${f} to ${t}`;
  const toArrive = to === "Bangsal (Lombok)" ? "Bangsal" : to;
  const arriveIn = ["Padang Bai", "Sanur", "Bangsal (Lombok)"].includes(to) ? "in" : "on";
  return {
    slug,
    region: [from, to].some((p) => p.startsWith("Bangsal")) ? "Lombok" : [from, to].some((p) => p.startsWith("Nusa")) ? "Nusa Islands" : "Gili Islands",
    name: title,
    h1: `${to === "Bangsal (Lombok)" ? `${f} to Bangsal, Lombok` : from === "Bangsal (Lombok)" ? `Bangsal, Lombok to ${t}` : title} by fast boat`,
    metaTitle: `${title} Fast Boat: Times & Operators`,
    metaDescription:
      `${title} fast boat times${from.startsWith("Bangsal") || to.startsWith("Bangsal") ? " (Bangsal harbour)" : ""}, crossing times and operators, ` +
      "with sea conditions for the crossing. Compare daily departures side by side and book on 12Go.",
    blurb: about[0],
    fromLabel: f,
    toLabel: t,
    fromPorts: [from],
    toPorts: [to],
    conditionPorts: [from, to],
    bookFrom: from,
    bookTo: to,
    related: [], // filled in below: the reverse trip, the group page it belongs to, and pages from the same port
    ourPick: "",
    lead: (c) =>
      `We list ${plural(c.count, "daily fast boat departure")} from ${f} to ${short(to)} with ${joinOps(c.operators)}, ` +
      `leaving between ${c.earliest} and ${c.latest}. The crossing takes ${rangeText(c.pairs[0].min, c.pairs[0].max)}, depending on the boat.` +
      CONFIRMED_LINE(c),
    sections: [
      { heading: `About ${title}`, paragraphs: about },
      { heading: `Leaving from ${short(from)}`, paragraphs: [PORT_NOTES[from].leaving, CHECKIN_TEXT] },
      { heading: `Arriving ${arriveIn} ${toArrive}`, paragraphs: [PORT_NOTES[to].arriving], cta: PLANNER_CTA(BALI_MAINLAND.includes(to) ? undefined : to) },
    ],
    faqs: (c) => [
      {
        q: `How long is the fast boat from ${f} to ${short(to)}?`,
        a: `Crossing times are ${c.durations}. Boats that call at other islands on the way take longer, so compare the Arrives column before you book.`,
      },
      {
        q: `What time is the first boat from ${f} to ${short(to)}?`,
        a: `The earliest daily departure we list is ${c.earliest} and the latest is ${c.latest}. Timetables change with the season, so confirm on the booking page for your date.`,
      },
      {
        q: `Which operators run ${f} to ${short(to)}?`,
        a: `We list ${joinOps(c.operators, 9)}. Boats, comfort and prices differ, so compare departure times and reviews as well as the fare.`,
      },
      CONFIRMED_FAQ(f, short(to), c),
      CANCEL_FAQ(f, short(to)),
      BOOK_FAQ,
    ],
  };
}

for (const p of SPECIFIC) ROUTE_PAGES[p.slug] = specificRoute(p);

// Group pages (several ports on one side) that cover a pair, smallest first.
export function groupPagesFor(from, to) {
  return Object.values(ROUTE_PAGES)
    .filter((r) => r.fromPorts.length * r.toPorts.length > 1 && r.fromPorts.includes(from) && r.toPorts.includes(to))
    .sort((a, b) => a.fromPorts.length * a.toPorts.length - b.fromPorts.length * b.toPorts.length);
}

// One-pair pages inside a group page, e.g. "Bali to the Gili Islands" -> "Padang Bai to Gili Air", ...
export function specificPagesIn(route) {
  return Object.values(ROUTE_PAGES).filter(
    (r) => r !== route && r.fromPorts.length === 1 && r.toPorts.length === 1 && route.fromPorts.includes(r.fromPorts[0]) && route.toPorts.includes(r.toPorts[0])
  );
}

for (const p of SPECIFIC) {
  const page = ROUTE_PAGES[p.slug];
  const reverse = Object.values(ROUTE_PAGES).find((r) => r.fromPorts.length === 1 && r.toPorts.length === 1 && r.fromPorts[0] === p.to && r.toPorts[0] === p.from);
  const sameFrom = Object.values(ROUTE_PAGES).filter((r) => r !== page && r.fromPorts.length === 1 && r.toPorts.length === 1 && r.fromPorts[0] === p.from);
  page.related = [...new Set([reverse, groupPagesFor(p.from, p.to)[0], ...sameFrom].filter(Boolean).map((r) => r.slug))].slice(0, 4);
}

// The most specific route page covering one from -> to pair (fewest port pairs), or null.
export function routePageFor(from, to) {
  let best = null;
  for (const r of Object.values(ROUTE_PAGES)) {
    if (!r.fromPorts.includes(from) || !r.toPorts.includes(to)) continue;
    const size = r.fromPorts.length * r.toPorts.length;
    if (!best || size < best.size) best = { route: r, size };
  }
  return best ? best.route : null;
}

export const ROUTE_SLUGS = Object.keys(ROUTE_PAGES);
export const REGION_ORDER = ["Gili Islands", "Nusa Islands", "Lombok"];
