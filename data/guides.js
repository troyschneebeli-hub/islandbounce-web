// Planning guides (/indonesia/guides/<slug>): answer "how do I get from where I'm staying to the Gilis" and "which port"
// searches. Anything about boats (counts, times, crossings, fares) is computed from SAILINGS by `boatStats`, so a guide
// can never disagree with the route pages. Drive times are rough ranges in the same words the port and route pages use;
// the Trip Planner gives the real figure for a hotel.
import { SAILINGS } from "@/data/sailings";
import { countDepartures, durationMins, fmtDuration, joinList, plural } from "@/lib/timetable";

export const GILIS = ["Gili Trawangan", "Gili Air", "Gili Meno"];

// Daily boats from any of `fromPorts` to any of `toPorts`: totals plus one row per from -> to pair.
export function boatStats(fromPorts, toPorts, sailings = SAILINGS) {
  const rows = sailings.filter((s) => fromPorts.includes(s.from) && toPorts.includes(s.to));
  const sum = (list) => {
    const times = list.map((s) => s.departs).sort();
    const durs = list.map((s) => durationMins(s.departs, s.arrives)).filter((d) => d != null);
    const fares = list.map((s) => s.fareAUD ?? s.price).filter((p) => p != null);
    return {
      count: countDepartures(list),
      earliest: times[0] || null,
      latest: times[times.length - 1] || null,
      minDur: durs.length ? Math.min(...durs) : null,
      minFare: fares.length ? Math.min(...fares) : null,
      operators: [...new Set(list.map((s) => s.operator))],
    };
  };
  const pairs = [];
  for (const from of fromPorts) for (const to of toPorts) {
    const list = rows.filter((s) => s.from === from && s.to === to);
    if (list.length) pairs.push({ from, to, ...sum(list) });
  }
  return { ...sum(rows), pairs };
}

// "08:30" minus 180 minutes -> "05:30" (clamped to the same day).
export function timeMinus(hhmm, mins) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  const t = Math.max(0, h * 60 + m - mins);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

const pb = () => boatStats(["Padang Bai"], GILIS);
const sanur = () => boatStats(["Sanur"], GILIS);
const giliLine = (s, port) =>
  s.count
    ? `${plural(s.count, "daily boat")} leave ${port} for the Gilis, between ${s.earliest} and ${s.latest}, with the fastest crossing ${fmtDuration(s.minDur)}${s.minFare != null ? ` and fares from A$${s.minFare}` : ""}.`
    : `We don't list a daily boat from ${port} to the Gilis this week, so check live times on the booking page.`;

export const GUIDES = {
  "ubud-to-gili-islands": {
    slug: "ubud-to-gili-islands",
    name: "Ubud to the Gili Islands",
    h1: "Ubud to the Gili Islands: which port, and how long it takes",
    metaTitle: "Ubud to Gili Islands: Best Port, Drive Time & Fast Boats",
    metaDescription:
      "How to get from Ubud to Gili Trawangan (Gili T), Gili Air or Gili Meno: which harbour to drive to, how long it takes, and every daily fast boat from there. Compare and book.",
    intro: "There's no boat from Ubud itself: you drive to a harbour, then take a fast boat. From Ubud the two sensible ports are Padang Bai on the east coast and Sanur in the south.",
    compare: { fromPorts: ["Padang Bai", "Sanur"], toPorts: GILIS, title: "Daily boats from Padang Bai and Sanur to the Gilis" },
    planner: "Gili Trawangan",
    sections: () => [
      {
        heading: "Padang Bai: the usual choice from Ubud",
        paragraphs: [
          "Padang Bai is roughly an hour's drive from Ubud, depending on traffic, and it usually has the shortest crossing to the Gilis. That combination makes it the quickest door-to-island option for most Ubud stays.",
          giliLine(pb(), "Padang Bai"),
        ],
      },
      {
        heading: "Sanur: if you're heading south first",
        paragraphs: [
          "Sanur is 45 minutes to an hour from Ubud. The boat ride to the Gilis is longer than from Padang Bai, and some boats call at other islands on the way, so it mainly makes sense if you're staying in the south before you go.",
          giliLine(sanur(), "Sanur"),
        ],
      },
      {
        heading: "Timing your day",
        paragraphs: [
          (() => {
            const s = pb();
            return s.earliest
              ? `The earliest daily boat from Padang Bai to the Gilis leaves at ${s.earliest}. Check-in is usually an hour before departure, so with the drive, plan to leave Ubud about two hours before your boat, more in busy traffic.`
              : "Check-in is usually an hour before departure, so with the drive, plan to leave Ubud about two hours before your boat.";
          })(),
          "Some fast boat tickets include a shared transfer from Ubud hotels. What's included differs by operator, so check on the booking page for your boat.",
        ],
      },
    ],
    faqs: () => {
      const s = pb();
      return [
        { q: "What's the best way to get from Ubud to the Gili Islands?", a: "Drive to Padang Bai (roughly an hour) and take a fast boat from there: it's usually the shortest crossing. Sanur works too, with a longer boat ride." },
        { q: "How long does Ubud to Gili Trawangan take?", a: `Allow about an hour for the drive, an hour for check-in, and the crossing itself${s.minDur != null ? `, which takes from ${fmtDuration(s.minDur)} from Padang Bai` : ""}. Door to door, most people spend half a day.` },
        { q: "Can I go from Ubud to the Gilis in one day?", a: s.latest ? `Yes. Daily boats from Padang Bai to the Gilis run from ${s.earliest} to ${s.latest}, so a morning start from Ubud gives you plenty of choice.` : "Yes, with a morning start from Ubud." },
      ];
    },
  },

  "seminyak-canggu-to-gili-islands": {
    slug: "seminyak-canggu-to-gili-islands",
    name: "Seminyak, Canggu and Kuta to the Gili Islands",
    h1: "Seminyak, Canggu and Kuta to the Gili Islands",
    metaTitle: "Seminyak & Canggu to Gili Islands: Which Port & Fast Boats",
    metaDescription:
      "Getting from Seminyak, Canggu or Kuta to Gili Trawangan (Gili T), Gili Air or Gili Meno: Sanur vs Padang Bai, drive times and every daily fast boat. Compare and book.",
    intro: "From Bali's south-west coast you have a real choice: Sanur is close but the boat ride is longer, while Padang Bai has the shorter crossing but a long drive.",
    compare: { fromPorts: ["Sanur", "Padang Bai", "Benoa / Nusa Dua"], toPorts: GILIS, title: "Daily boats from the south Bali ports to the Gilis" },
    planner: "Gili Trawangan",
    sections: () => [
      {
        heading: "Sanur: the short drive",
        paragraphs: [
          "Sanur harbour is about 25 minutes from Kuta, roughly 30 to 45 minutes from Seminyak and 40 to 50 minutes from Canggu. The crossing to the Gilis is longer than from Padang Bai, and some boats call at other islands on the way.",
          giliLine(sanur(), "Sanur"),
        ],
      },
      {
        heading: "Padang Bai: the short crossing",
        paragraphs: [
          "Padang Bai is about 1 to 1.5 hours from Kuta and 1.5 to 2 hours from Canggu. In exchange you get the shortest crossing and the widest choice of operators.",
          giliLine(pb(), "Padang Bai"),
        ],
      },
      {
        heading: "Which should you pick?",
        paragraphs: [
          "If you get seasick or travel in the wetter months (roughly November to March), the shorter crossing from Padang Bai is worth the drive. If you'd rather keep the car journey short, Sanur is the easy option.",
          "Benoa, near Kuta and Seminyak, has only a few boats to the Gilis, so it's worth a look only if one of its times suits you.",
        ],
      },
    ],
    faqs: () => [
      { q: "Which port is closest to Seminyak for the Gilis?", a: "Sanur, roughly 30 to 45 minutes away. Benoa is about as close but has far fewer boats to the Gilis." },
      { q: "Is it worth driving to Padang Bai from Canggu?", a: "It's 1.5 to 2 hours, but the crossing is shorter and there are more operators. If rough water bothers you, it's usually worth it." },
      { q: "How long does Canggu to Gili Trawangan take?", a: "Most of a day: the drive to the harbour, an hour for check-in, and the crossing. The table above shows each port's crossing times." },
    ],
  },

  "bali-airport-to-gili-islands": {
    slug: "bali-airport-to-gili-islands",
    name: "Bali airport to the Gili Islands",
    h1: "Bali airport to the Gili Islands: can you do it the day you land?",
    metaTitle: "Bali Airport to Gili Islands: Same-Day Boats & Timing",
    metaDescription:
      "Flying into Bali (Denpasar) and heading to Gili Trawangan, Gili Air or Gili Meno? When the last daily boats leave, which port to drive to, and when a night in Bali makes more sense.",
    intro: "You can't take a boat from the airport itself: you drive to Sanur or Padang Bai first. Whether you can reach the Gilis the same day depends on when you land.",
    compare: { fromPorts: ["Sanur", "Padang Bai"], toPorts: GILIS, title: "Daily boats to the Gilis from the ports nearest the airport" },
    planner: "Gili Trawangan",
    sections: () => {
      const s = sanur();
      const p = pb();
      return [
        {
          heading: "When is the last boat?",
          paragraphs: [
            [
              s.latest ? `The latest daily boat from Sanur to the Gilis leaves at ${s.latest}` : null,
              p.latest ? `the latest from Padang Bai at ${p.latest}` : null,
            ].filter(Boolean).join(", and ") + ". Times change with the season, so check the booking page for your date.",
            "To make a boat after landing you need time for immigration and bags, the drive, and check-in (usually an hour before departure). As a rough guide, allow about three hours from landing to departure from Padang Bai and two and a half from Sanur.",
          ],
        },
        {
          heading: "So, same day or not?",
          paragraphs: [
            p.latest || s.latest
              ? `If you land before about ${timeMinus(p.latest && (!s.latest || p.latest > s.latest) ? p.latest : s.latest, 180)}, a same-day boat is realistic. Later than that, a night in Sanur or near the airport and a morning boat is the calmer plan, and morning seas are usually smoother anyway.`
              : "Daily boats leave in the morning and early afternoon, so a night in Bali and a morning boat is usually the calmer plan.",
            "Flights can be late and boats don't wait, so don't book a tight connection you can't change.",
          ],
        },
        {
          heading: "Heading back for a flight",
          paragraphs: [
            "Going the other way, add up the crossing, the drive from the harbour to the airport and your airline's check-in time. Rough seas can delay boats, so many travellers take a morning boat for an evening flight, or spend the last night in Bali.",
          ],
          cta: { href: "/indonesia/routes/gili-islands-to-bali", label: "Gili Islands to Bali times →" },
        },
      ];
    },
    faqs: () => [
      { q: "Can I go straight from Bali airport to the Gili Islands?", a: "Yes, if you land early enough: drive to Sanur or Padang Bai and take a fast boat. Land in the afternoon or evening and you'll usually need a night in Bali first." },
      { q: "Which port is closest to Bali airport for the Gilis?", a: "Sanur is the closest port with daily boats to the Gilis. Padang Bai is further from the airport but has the shorter crossing." },
      { q: "Is there a boat from the airport?", a: "No. Fast boats leave from the harbours, so you'll need a car or a transfer from the airport to the port." },
    ],
  },

  "padang-bai-or-sanur-for-gili": {
    slug: "padang-bai-or-sanur-for-gili",
    name: "Padang Bai or Sanur for the Gilis?",
    h1: "Padang Bai or Sanur for the Gili Islands?",
    metaTitle: "Padang Bai or Sanur to Gili Islands? Boats, Crossing & Drive",
    metaDescription:
      "Padang Bai vs Sanur for Gili Trawangan (Gili T), Gili Air and Gili Meno: daily boats, crossing times, fares and drive times compared side by side, from the latest timetable.",
    intro: "These are the two Bali ports most people use for the Gilis. The short answer: Padang Bai for the shorter crossing and more boats, Sanur for the shorter drive from the south.",
    compare: { fromPorts: ["Padang Bai", "Sanur"], toPorts: GILIS, title: "Padang Bai and Sanur to the Gilis, side by side" },
    planner: "Gili Trawangan",
    sections: () => {
      const p = pb();
      const s = sanur();
      return [
        {
          heading: "The numbers",
          paragraphs: [
            `Padang Bai: ${plural(p.count, "daily boat")} to the Gilis with ${plural(p.operators.length, "operator")}${p.minDur != null ? `, fastest crossing ${fmtDuration(p.minDur)}` : ""}${p.minFare != null ? `, fares from A$${p.minFare}` : ""}.`,
            `Sanur: ${plural(s.count, "daily boat")} with ${plural(s.operators.length, "operator")}${s.minDur != null ? `, fastest crossing ${fmtDuration(s.minDur)}` : ""}${s.minFare != null ? `, fares from A$${s.minFare}` : ""}.`,
          ],
        },
        {
          heading: "The drive",
          paragraphs: [
            "Sanur is about 25 minutes from Kuta, 40 to 50 minutes from Canggu and 45 minutes to an hour from Ubud. Padang Bai is about 1 to 1.5 hours from Kuta, 1.5 to 2 hours from Canggu or Uluwatu, and roughly an hour from Ubud.",
          ],
        },
        {
          heading: "Our take",
          paragraphs: [
            "Staying in Ubud or east Bali, or worried about rough water? Padang Bai. Staying in Kuta, Seminyak or Canggu and want a short transfer? Sanur, as long as one of its times suits you.",
            `Operators on both: ${joinList([...new Set(p.operators.filter((o) => s.operators.includes(o)))]) || "none in our latest check"}.`,
          ],
        },
      ];
    },
    faqs: () => [
      { q: "Is Padang Bai or Sanur better for Gili Trawangan?", a: "Padang Bai usually has the shorter crossing and more boats; Sanur has the shorter drive from south Bali. Pick by where you're staying." },
      { q: "Is the crossing rougher from Sanur?", a: "It's longer, so you spend more time on open water, which matters most in the wetter months (roughly November to March)." },
    ],
  },
};

export const GUIDE_SLUGS = Object.keys(GUIDES);
