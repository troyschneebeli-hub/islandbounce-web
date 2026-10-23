// One place for the canonical site address, so sitemap, robots, structured
// data and metadata can't drift apart. Must match Vercel's primary domain:
// it's the "www." version (the bare domain 308-redirects to it), so canonicals
// and the sitemap must not point at the redirecting address.
export const SITE_URL = "https://www.islandbouncetravel.com";

// Public contact address used by the footer, privacy policy and the waitlist
// fallback. Currently Troy's inbox; once the shared contact group address
// (e.g. hello@islandbouncetravel.com) is confirmed working, change it here
// and everywhere updates.
export const CONTACT_EMAIL = "troy@islandbouncetravel.com";
