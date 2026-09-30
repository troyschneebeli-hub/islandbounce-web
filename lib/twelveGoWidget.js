// Set this once your white-label subdomain (booking.islandbouncetravel.com)
// shows "Active" in 12Go's affiliate dashboard, not while it still says
// "Pending - waiting for approval" — sending customers to a page that
// isn't live yet would be a broken link, not a booking page.
//
// Leave it as `null` until then: the booking page automatically falls
// back to a working deep-link search using the site's own port data, so
// the page is genuinely useful today either way.

export const TWELVEGO_WHITELABEL_URL = null; // e.g. "https://booking.islandbouncetravel.com"
