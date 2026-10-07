"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TwelveGoBookingWidget from "@/components/TwelveGoBookingWidget";

// The booking box shown under the Trip Planner. Reads the same optional
// ?to=<destination> the planner reads, so the two boxes agree when someone
// arrives from a route page's "Open the Trip Planner" link.
function Inner() {
  const searchParams = useSearchParams();
  return <TwelveGoBookingWidget initialTo={searchParams.get("to") || undefined} />;
}

export default function HubBooking() {
  return (
    <Suspense fallback={<div style={{ minHeight: 230 }} />}>
      <Inner />
    </Suspense>
  );
}
