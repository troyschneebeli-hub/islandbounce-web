import { NextResponse } from "next/server";
import { BALI_PORTS } from "@/data/ports";
import { BOAT_ROUTES, genDepartures, CHECKIN_BUFFER_MIN } from "@/data/planner";

// POST { address: string, destination: string } -> for every Bali port that
// has a route to `destination`, real driving time (Google Distance Matrix)
// plus the boat schedule for that leg. This is the "address in, every route
// out" version of the closest-port + trip-planner tools combined into one
// call, so the whole thing can be answered in a single request.
export async function POST(request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GOOGLE_MAPS_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const address = (body?.address || "").trim();
  const destination = (body?.destination || "").trim();
  if (!address) return NextResponse.json({ error: "Missing 'address'." }, { status: 400 });
  if (!destination) return NextResponse.json({ error: "Missing 'destination'." }, { status: 400 });

  // Only query ports that actually have a route to this destination —
  // no point spending Distance Matrix calls on ports that don't serve it.
  const candidatePorts = BALI_PORTS.filter((p) => BOAT_ROUTES[p.name]?.[destination]);
  if (candidatePorts.length === 0) {
    return NextResponse.json({ error: `No Bali port in our data has a route to ${destination} yet.` }, { status: 404 });
  }

  const destinationsParam = candidatePorts.map((p) => p.address).join("|");
  const params = new URLSearchParams({
    origins: address,
    destinations: destinationsParam,
    mode: "driving",
    units: "metric",
    key: apiKey,
  });

  let data;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`);
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Could not reach Google Maps. Try again in a moment." }, { status: 502 });
  }

  if (data.status !== "OK") {
    return NextResponse.json(
      { error: `Google Maps error: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}` },
      { status: 502 }
    );
  }

  const row = data.rows?.[0];
  if (!row) return NextResponse.json({ error: "No results returned for that address." }, { status: 502 });

  const resolvedAddress = data.origin_addresses?.[0] || address;

  const results = candidatePorts
    .map((port, i) => {
      const el = row.elements?.[i];
      if (!el || el.status !== "OK") {
        return { port: port.name, status: el?.status || "UNKNOWN", driveSeconds: null };
      }
      const driveSeconds = el.duration.value;
      const driveMin = Math.round(driveSeconds / 60);
      const scooterMin = Math.max(5, Math.round(driveMin * 0.75));

      const cfg = BOAT_ROUTES[port.name][destination];
      const boats = genDepartures(port.name, destination, cfg);
      const fastestBoat = boats.reduce((a, b) => (a.boatMin < b.boatMin ? a : b));
      const totalMin = driveMin + CHECKIN_BUFFER_MIN + fastestBoat.boatMin;

      return {
        port: port.name,
        status: "OK",
        distanceText: el.distance.text,
        driveMin,
        driveText: el.duration.text,
        scooterMin,
        boats,
        fastestBoat,
        totalMin,
      };
    })
    .sort((a, b) => {
      if (a.totalMin == null) return 1;
      if (b.totalMin == null) return -1;
      return a.totalMin - b.totalMin;
    });

  return NextResponse.json({ resolvedAddress, destination, results });
}
