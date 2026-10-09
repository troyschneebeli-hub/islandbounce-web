import { buildTransportLink } from "@/lib/affiliateLinks";
import { TWELVEGO_WHITELABEL_URL } from "@/lib/twelveGoWidget";

// The one place that decides where a "book this route" click goes: our own
// booking domain when it's enabled, otherwise 12Go directly. Used by both the
// Trip Planner's port cards and the booking box, so they can't disagree.
// travellers (a number) is optional too and pre-fills the Travelers box.
// date and returnDate are optional, "YYYY-MM-DD". With a returnDate the
// booking page opens as a return trip with both dates filled in.
export function bookingLink(from, to, date, returnDate, travellers) {
  return buildTransportLink(from, to, date || undefined, TWELVEGO_WHITELABEL_URL || undefined, returnDate || undefined, travellers || undefined);
}
