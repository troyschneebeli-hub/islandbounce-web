import { buildTransportLink } from "@/lib/affiliateLinks";
import { TWELVEGO_WHITELABEL_URL } from "@/lib/twelveGoWidget";

// The one place that decides where a "book this route" click goes: our own
// booking domain when it's enabled, otherwise 12Go directly. Used by both the
// Trip Planner's port cards and the booking box, so they can't disagree.
// date is optional, "YYYY-MM-DD".
export function bookingLink(from, to, date) {
  return buildTransportLink(from, to, date || undefined, TWELVEGO_WHITELABEL_URL || undefined);
}
