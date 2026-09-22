import { NextResponse } from "next/server";
import { BALI_PORTS } from "@/data/ports";

// POST { address: string } -> ranked list of Bali ports by real driving
// time/distance from that address, using Google's Distance Matrix API.
//
// The API key stays server-side (GOOGLE_MAPS_API_KEY, no NEXT_PUBLIC_
// prefix) so it's never sent to the browser. Restrict the key in Google
// Cloud Console to this server's IP (or HTTP referrer if you later call
// this from a different host) and enable the Distance Matrix API on it.
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
  if (!address) {
    return NextResponse.json({ error: "Missing 'address'." }, { status: 400 });
  }

  const destinations = BALI_PORTS.map((p) => p.address).join("|");
  const params = new URLSearchParams({
    origins: address,
    destinations,
    mode: "driving",
    units: "metric",
    key: apiKey,
  });

  let data;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`);
    data = await res.json();
  } catch (err) {
    return NextResponse.json({ error: "Could not reach Google Maps. Try again in a moment." }, { status: 502 });
  }

  if (data.status !== "OK") {
    // Common cases: REQUEST_DENIED (bad/restricted key), INVALID_REQUEST,
    // OVER_QUERY_LIMIT (billing not enabled or quota hit).
    return NextResponse.json(
      { error: `Google Maps error: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}` },
      { status: 502 }
    );
  }

  const row = data.rows?.[0];
  if (!row) {
    return NextResponse.json({ error: "No results returned for that address." }, { status: 502 });
  }

  const resolvedAddress = data.origin_addresses?.[0] || address;

  const results = BALI_PORTS.map((port, i) => {
    const el = row.elements?.[i];
    if (!el || el.status !== "OK") {
      return {
        port: port.name,
        connects: port.connects,
        frequency: port.frequency,
        status: el?.status || "UNKNOWN",
        durationText: null,
        durationSeconds: null,
        distanceText: null,
      };
    }
    return {
      port: port.name,
      connects: port.connects,
      frequency: port.frequency,
      status: "OK",
      durationText: el.duration.text,
      durationSeconds: el.duration.value,
      distanceText: el.distance.text,
    };
  }).sort((a, b) => {
    if (a.durationSeconds == null) return 1;
    if (b.durationSeconds == null) return -1;
    return a.durationSeconds - b.durationSeconds;
  });

  return NextResponse.json({ resolvedAddress, results });
}
