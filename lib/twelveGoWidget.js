// RE-ENABLED 2026-09-30 (third attempt): confirmed via an actual fresh
// browser check — real padlock, no warning — not just the 12Go
// dashboard's "Enabled" status. The route+date link-building to this
// domain (see buildTransportLink in lib/affiliateLinks.js) is still
// separately unverified — worth a real click-through test to confirm the
// resulting page actually shows the picked route/date, not just that the
// domain itself loads securely. If the certificate ever regresses, set
// this back to `null`; the booking page falls back to a working
// deep-link search either way.

export const TWELVEGO_WHITELABEL_URL = "https://booking.islandbouncetravel.com";
