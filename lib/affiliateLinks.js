// Affiliate link builders. Replace the PARTNER_IDS placeholders with real
// partner/affiliate IDs once each program's application is approved
// (see README "Next real steps" — submit affiliate applications).

export const PARTNER_IDS = {
  // 12Go affiliate ID (appears in every public 12Go link/embed, so not a secret).
  // Hardcoded as the fallback so links still track if the Vercel env var is unset.
  twelveGo: process.env.NEXT_PUBLIC_12GO_PARTNER_ID || "17069158",
  klook: process.env.NEXT_PUBLIC_KLOOK_AID || "YOUR_KLOOK_AID",
  viator: process.env.NEXT_PUBLIC_VIATOR_PID || "YOUR_VIATOR_PID",
  getyourguide: process.env.NEXT_PUBLIC_GYG_PARTNER_ID || "YOUR_GYG_PARTNER_ID",
};

// "Bangsal (Lombok)" -> "bangsal", "Benoa / Nusa Dua" -> "benoa-nusa-dua".
// The bracketed region suffix is our own disambiguation, not part of the
// place name, and the old version also left a trailing hyphen
// ("bangsal-lombok-"). Only Padang Bai -> Gili Trawangan and
// Sanur -> Gili Trawangan have been confirmed against live 12Go pages; the
// other port names are worth a click-through test.
export function slug(s) {
  return s
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// date, if given, should be "YYYY-MM-DD".
//
// VERIFIED by click-through on the live site (Oct 2026): the route in the
// path (/en/travel/<from>/<to>) and the "date" parameter both land
// pre-filled on booking.islandbouncetravel.com. The same URL shape is used
// for plain 12go.asia as a fallback, which has not been separately tested.
//
// Still worth confirming in the 12Go dashboard stats: that clicks from the
// site are being credited to affiliate ID 17069158 (the "z" parameter below).
//
// baseUrl defaults to 12go.asia itself; the booking widget passes our
// white-label domain (booking.islandbouncetravel.com) when it's enabled.
export function buildTransportLink(from, to, date, baseUrl = "https://12go.asia") {
  // FIXED: 12Go's own dashboard links use "z" as the affiliate parameter
  // (e.g. https://12go.asia/?z=17069158), not "partner" - the old name meant
  // clicks weren't being credited. sub_id also had an underscore, but 12Go's
  // Sub_id field only allows a-z, A-Z, 0-9 and hyphens, so it's hyphenated now.
  const params = new URLSearchParams({
    z: PARTNER_IDS.twelveGo,
    sub_id: "islandbounce-web",
  });
  if (date) params.set("date", date);
  return `${baseUrl}/en/travel/${slug(from)}/${slug(to)}?${params.toString()}`;
}

export function buildActivityLink(platform, query) {
  const q = encodeURIComponent(query);
  if (platform === "Klook") return `https://www.klook.com/search/?query=${q}&aid=${PARTNER_IDS.klook}`;
  if (platform === "Viator") return `https://www.viator.com/searchResults/all?text=${q}&pid=${PARTNER_IDS.viator}`;
  return `https://www.getyourguide.com/s/?q=${q}&partner_id=${PARTNER_IDS.getyourguide}`;
}
