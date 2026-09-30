// RE-ENABLED 2026-09-30 for another attempt, since the earlier
// NET::ERR_CERT_COMMON_NAME_INVALID may just have been the SSL certificate
// still issuing. IMPORTANT: before this reaches real customers, confirm in
// an actual browser that booking.islandbouncetravel.com loads with a real
// padlock and no warning — I can't verify a live certificate from here,
// only that this code correctly points at the right URL. If the warning
// is still there, set this back to `null` immediately; the booking page
// falls back to a working deep-link search either way, so nothing breaks
// by turning this off again.

export const TWELVEGO_WHITELABEL_URL = "https://booking.islandbouncetravel.com";
