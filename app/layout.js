import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IslandBounce — Compare boats. Find your island. Go properly.",
    template: "%s | IslandBounce",
  },
  description:
    "Ferry, fast-boat, and trip-planning comparisons across Bali, the Gili Islands, Nusa Penida, and Lombok — every departure compared side by side.",
};

// Explicit rather than relying on Next.js's default — without this, mobile
// browsers can render the whole site zoomed out to a desktop-width layout,
// making everything tiny regardless of how good the responsive CSS is.
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Tells Google directly what our official name and logo are, so it has
// what it needs to show the logo in search results or a Knowledge Panel —
// showing it is always Google's own call, this just makes it possible.
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IslandBounce",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts via <link> rather than a CSS @import: same fonts, but the browser can fetch them in parallel instead of after the CSS. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd).replace(/</g, "\\u003c") }} />
        <div style={{ minHeight: "100%" }}>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
