// Affiliate link builders. Replace the PARTNER_IDS placeholders with real
// partner/affiliate IDs once each program's application is approved
// (see README "Next real steps" — submit affiliate applications).

export const PARTNER_IDS = {
  twelveGo: process.env.NEXT_PUBLIC_12GO_PARTNER_ID || "YOUR_12GO_PARTNER_ID",
  klook: process.env.NEXT_PUBLIC_KLOOK_AID || "YOUR_KLOOK_AID",
  viator: process.env.NEXT_PUBLIC_VIATOR_PID || "YOUR_VIATOR_PID",
  getyourguide: process.env.NEXT_PUBLIC_GYG_PARTNER_ID || "YOUR_GYG_PARTNER_ID",
};

export function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function buildTransportLink(from, to) {
  const params = new URLSearchParams({
    partner: PARTNER_IDS.twelveGo,
    sub_id: "islandbounce_web",
  });
  return `https://12go.asia/en/travel/${slug(from)}/${slug(to)}?${params.toString()}`;
}

export function buildActivityLink(platform, query) {
  const q = encodeURIComponent(query);
  if (platform === "Klook") return `https://www.klook.com/search/?query=${q}&aid=${PARTNER_IDS.klook}`;
  if (platform === "Viator") return `https://www.viator.com/searchResults/all?text=${q}&pid=${PARTNER_IDS.viator}`;
  return `https://www.getyourguide.com/s/?q=${q}&partner_id=${PARTNER_IDS.getyourguide}`;
}
