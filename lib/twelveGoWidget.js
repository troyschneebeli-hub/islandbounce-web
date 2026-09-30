// REVERTED 2026-09-30 (second attempt, still broken): rechecked in a real
// browser and NET::ERR_CERT_COMMON_NAME_INVALID is still there. The
// certificate genuinely hasn't been fixed yet — this isn't a caching
// fluke. Leave this as `null` and do NOT re-enable based on the 12Go
// dashboard's "Enabled" status alone again; only flip this back after an
// actual fresh-browser check shows a real padlock with no warning. The
// booking page falls back to a working deep-link search either way.

export const TWELVEGO_WHITELABEL_URL = null; // e.g. "https://booking.islandbouncetravel.com"
