// Waitlist signup logic, kept out of the page component so it can be tested.
//
// Previously the "Notify me" button just displayed "You're on the list" and
// discarded the email (a TODO left in the code). Now:
//  - If NEXT_PUBLIC_WAITLIST_ENDPOINT is set (any service that accepts a JSON
//    POST, e.g. a Formspree form URL), the email is really sent there.
//  - If it isn't set, we fall back to opening the visitor's email app with a
//    pre-filled message to us, so the promise on the page is still true.

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

export function buildWaitlistMailto(contactEmail, email, route) {
  const subject = encodeURIComponent("Split Charter waitlist");
  const body = encodeURIComponent(
    `Please add me to the Split Charter waitlist.\nRoute: ${route}\nMy email: ${email}`
  );
  return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}

// Returns { status: "invalid" | "saved" | "mailto" | "error", email? }
/** @param {{ email?: string, route?: string, endpoint?: string, fetchFn?: Function }} [args] */
export async function submitWaitlist({ email, route, endpoint, fetchFn } = {}) {
  const clean = (email || "").trim();
  if (!isValidEmail(clean)) return { status: "invalid" };
  if (!endpoint) return { status: "mailto", email: clean };
  try {
    const doFetch = fetchFn || fetch;
    const res = await doFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: clean, route, source: "split-charter-waitlist" }),
    });
    return res.ok ? { status: "saved", email: clean } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
