import { NextResponse } from "next/server";

// Open-Meteo Marine Weather API — free, keyless. Their free tier is
// licensed for non-commercial use; IslandBounce is commission-based, so
// this is a deliberate low-risk choice at pre-revenue scale, with a plan
// to move to their paid commercial tier (or an alternative provider) once
// the business is actually earning. See project notes.
//
// GET /api/sea-conditions?lat=...&lng=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing 'lat' or 'lng'." }, { status: 400 });
  }

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: "wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period",
    timezone: "auto",
  });

  let data;
  try {
    const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params.toString()}`, {
      // Cached for an hour server-side — conditions don't need
      // second-by-second polling, and this keeps well within Open-Meteo's
      // free-tier rate limits regardless of actual site traffic.
      next: { revalidate: 3600 },
    });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Could not reach Open-Meteo. Try again shortly." }, { status: 502 });
  }

  if (!data?.current) {
    return NextResponse.json({ error: "No marine data for this location — it may be too far from open water for the model grid." }, { status: 404 });
  }

  const waveHeight = data.current.wave_height; // meters
  const swellHeight = data.current.swell_wave_height;
  const swellPeriod = data.current.swell_wave_period;
  const wavePeriod = data.current.wave_period;
  const waveDirection = data.current.wave_direction;

  // Comfort scale — how the crossing will actually FEEL, on a 5-tier
  // gradient. General banding, not an official standard.
  let comfort = "glassy";
  if (waveHeight >= 2.5) comfort = "rough";
  else if (waveHeight >= 1.5) comfort = "choppy";
  else if (waveHeight >= 1.0) comfort = "slight-chop";
  else if (waveHeight >= 0.5) comfort = "calm";

  // Cancellation-risk estimate — this one IS grounded in real published
  // numbers, not invented:
  // - Indonesia's own meteorology agency (BMKG) publishes official small
  //   craft/ferry caution thresholds: ferries are flagged for caution
  //   above 2.5m wave height (21+ knot winds).
  // - Real-world reporting on Bali↔Gili fast boat suspensions (Padang Bai
  //   port authority, BMKG bulletins, operator advisories through 2025-26)
  //   consistently shows tourist fast boats — smaller and more
  //   wave-sensitive than official ferries — actually getting suspended
  //   once wave height reaches roughly 2.5–3m.
  // This is still an ESTIMATE, not a prediction: individual operators,
  // port authorities (Syahbandar), and specific routes/straits vary, and
  // the actual call is always theirs on the day.
  let cancellationRisk = "low";
  if (waveHeight >= 3.0) cancellationRisk = "high";
  else if (waveHeight >= 2.5) cancellationRisk = "moderate";

  return NextResponse.json({
    waveHeight,
    swellHeight,
    swellPeriod,
    wavePeriod,
    waveDirection,
    comfort,
    cancellationRisk,
    fetchedAt: data.current.time,
  });
}
