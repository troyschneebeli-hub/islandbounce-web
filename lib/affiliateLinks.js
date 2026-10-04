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

export function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// date, if given, should be "YYYY-MM-DD". UNVERIFIED: this matches the
// standard convention used by third-party tools built on 12Go's data, but
// I don't have confirmation this exact parameter name is honored by
// 12go.asia's own public search pages — a wrong parameter name fails
// silently (date just gets ignored) rather than erroring, so this
// genuinely needs a real click-through test: pick a date, follow the
// link, confirm it actually lands pre-filled rather than on a blank
// date search.
//
// baseUrl defaults to 12go.asia itself. It also accepts our white-label
// domain (booking.islandbouncetravel.com) — SAME UNVERIFIED CAVEAT
// applies doubly there: white-label sites built on the same underlying
// platform commonly mirror the parent site's URL structure, which is why
// this is built to just swap the domain rather than invent a different
// path shape, but "commonly" isn't "confirmed." This needs its own
// separate real click-through test once the white-label domain's SSL
// certificate is actually working — don't assume it's right just because
// the plain 12go.asia version turns out to be.
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
