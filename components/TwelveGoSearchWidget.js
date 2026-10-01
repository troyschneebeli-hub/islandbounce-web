"use client";

import { useEffect, useRef } from "react";
import { COLORS } from "@/lib/theme";

// The real 12Go search-widget embed, configured in their dashboard with
// our logo, orange brand color, and a 15px radius to match the rest of
// the site (built together in chat — settings confirmed against a live
// preview before generating this code).
//
// FIXED 2026-09-30: originally loaded via next/script with
// strategy="afterInteractive". That's Next's own recommended approach for
// most third-party embeds, but it has one specific behavior that bit us
// here: Next deliberately does NOT remove afterInteractive scripts when
// the component unmounts (by design — right for things like analytics,
// wrong for a widget that apparently self-positions as a floating
// element). The result: once loaded on the Book page, the widget kept
// floating on top of whatever page was visited next, confirmed by a
// screenshot showing it over the Split Charters page.
//
// This version manages the script manually instead: injected into a
// specific container div on mount, and — critically — actually removed,
// container cleared, on unmount. This is the correct fix for a script
// that needs to exist only while this specific page is showing.
//
// Honest limitation: I still can't execute third-party scripts from here
// to watch this happen live. This is my best correct fix for the
// mechanism that caused the bug, based on the evidence in the
// screenshot — genuinely needs a real re-test (visit Book, then navigate
// to another page, confirm the widget is actually gone) before trusting
// it's fully resolved.
//
// The "Powered by 12Go system" line is required by 12Go's terms — kept
// exactly as their dashboard generated it, not reworded.
export default function TwelveGoSearchWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.id = "twelvego-search-form";
    script.src = "https://cdn0.trainbusferry.com/tools/form/en/?id=17069158&domain=booking.islandbouncetravel.com";
    script.setAttribute("data-one2go", "17069158");
    script.setAttribute("data-color", "orange");
    script.setAttribute("data-language", "en");
    script.setAttribute("data-width", "372");
    script.setAttribute("data-height", "320");
    script.setAttribute("data-border", "1");
    script.setAttribute("data-radius", "15");
    script.setAttribute("data-logo", "https://islandbouncetravel.com/images/logo.png");
    script.setAttribute("data-domain", "booking.islandbouncetravel.com");
    script.async = true;
    container.appendChild(script);

    // Cleanup on unmount (i.e. navigating away from this page): remove the
    // script itself, and clear anything it rendered inside our container.
    // This is what was missing before — without it, the widget's effects
    // outlive the page it was meant to live on.
    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} />
      <div id="powered" style={{ fontSize: 11, color: COLORS.ink, opacity: 0.6, marginTop: 10, textAlign: "center" }}>
        Powered by{" "}
        <a href="https://12go.asia/?z=17069158" style={{ color: COLORS.sea }} target="_blank" rel="noopener noreferrer">
          12Go system
        </a>
      </div>
    </div>
  );
}
